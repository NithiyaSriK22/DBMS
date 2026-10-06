const db = require('../config/db');

exports.getAllSpecies = async (req, res) => {
  try {
    const { search, type, status, family, limit, offset, sort = 'Common_Name', order = 'ASC' } = req.query;

    let sql = `
      SELECT 
        s.Species_ID,
        s.Common_Name,
        s.Scientific_Name,
        s.Species_Type,
        s.Family,
        s.Conservation_Status,
        s.Population_Estimate,
        s.Description,
        s.Discovery_Date,
        s.Image_Url,
        s.Created_At,
        COUNT(DISTINCT sh.Habitat_ID) AS habitatCount,
        COUNT(DISTINCT st.Threat_ID) AS threatCount,
        COUNT(DISTINCT so.Observation_ID) AS observationCount
      FROM Species s
      LEFT JOIN Species_Habitat sh ON s.Species_ID = sh.Species_ID
      LEFT JOIN Species_Threat st ON s.Species_ID = st.Species_ID
      LEFT JOIN Species_Observation so ON s.Species_ID = so.Species_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (s.Common_Name LIKE ? OR s.Scientific_Name LIKE ? OR s.Family LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type && type !== 'All') {
      sql += ` AND s.Species_Type = ?`;
      params.push(type);
    }

    if (status && status !== 'All') {
      sql += ` AND s.Conservation_Status = ?`;
      params.push(status);
    }

    if (family) {
      sql += ` AND s.Family LIKE ?`;
      params.push(`%${family}%`);
    }

    sql += ` GROUP BY s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Family, s.Conservation_Status, s.Population_Estimate, s.Description, s.Discovery_Date, s.Image_Url, s.Created_At`;

    // Allowed sort fields
    const validSorts = ['Common_Name', 'Scientific_Name', 'Species_Type', 'Conservation_Status', 'Population_Estimate', 'Species_ID'];
    const sortCol = validSorts.includes(sort) ? sort : 'Common_Name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY s.${sortCol} ${sortOrder}`;

    if (limit) {
      sql += ` LIMIT ?`;
      params.push(parseInt(limit));
      if (offset) {
        sql += ` OFFSET ?`;
        params.push(parseInt(offset));
      }
    }

    const species = await db.query(sql, params);
    const countRes = await db.getOne('SELECT COUNT(*) AS total FROM Species');

    res.json({
      success: true,
      total: countRes?.total || 0,
      count: species.length,
      data: species,
    });
  } catch (err) {
    console.error('Get species error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve species: ' + err.message });
  }
};

exports.getSpeciesById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Core Species Data
    const species = await db.getOne('SELECT * FROM Species WHERE Species_ID = ?', [id]);
    if (!species) {
      return res.status(404).json({ success: false, message: `Species with ID #${id} not found.` });
    }

    // 2. Linked Habitats (via junction table Species_Habitat)
    const habitats = await db.query(`
      SELECT 
        h.Habitat_ID,
        h.Habitat_Name,
        h.Habitat_Type,
        h.Climate,
        h.Area,
        h.Protection_Status,
        sh.Population_Estimate AS habitatPopulation,
        sh.Recorded_Date
      FROM Species_Habitat sh
      JOIN Habitat h ON sh.Habitat_ID = h.Habitat_ID
      WHERE sh.Species_ID = ?
      ORDER BY sh.Population_Estimate DESC
    `, [id]);

    // 3. Linked Threats (via junction table Species_Threat)
    const threats = await db.query(`
      SELECT 
        t.Threat_ID,
        t.Threat_Name,
        t.Threat_Type,
        t.Severity,
        st.Impact_Level,
        st.Recorded_Date,
        st.Description AS impactDescription
      FROM Species_Threat st
      JOIN Threat t ON st.Threat_ID = t.Threat_ID
      WHERE st.Species_ID = ?
      ORDER BY 
        CASE st.Impact_Level
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          ELSE 4
        END
    `, [id]);

    // 4. Observation History (Species_Observation + Location + Researcher)
    const observations = await db.query(`
      SELECT 
        so.Observation_ID,
        so.Observation_Date,
        so.Population_Count,
        so.Observation_Method,
        so.Notes,
        l.Location_ID,
        l.Location_Name,
        l.State,
        l.Country,
        r.Researcher_ID,
        r.Name AS researcherName,
        r.Organization
      FROM Species_Observation so
      JOIN Location l ON so.Location_ID = l.Location_ID
      JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
      WHERE so.Species_ID = ?
      ORDER BY so.Observation_Date DESC
    `, [id]);

    // 5. Related Conservation Programs (in the locations where this species has been observed)
    const programs = await db.query(`
      SELECT DISTINCT
        cp.Program_ID,
        cp.Program_Name,
        cp.Objective,
        cp.Start_Date,
        cp.End_Date,
        cp.Budget,
        cp.Status,
        l.Location_Name,
        l.State
      FROM Conservation_Program cp
      JOIN Location l ON cp.Location_ID = l.Location_ID
      WHERE cp.Location_ID IN (
        SELECT DISTINCT Location_ID FROM Species_Observation WHERE Species_ID = ?
      ) OR cp.Location_ID IN (
        SELECT DISTINCT l2.Location_ID FROM Location l2 
        JOIN Species_Habitat sh ON l2.Habitat_ID = sh.Habitat_ID 
        WHERE sh.Species_ID = ?
      )
      ORDER BY cp.Status ASC, cp.Start_Date DESC
    `, [id, id]);

    res.json({
      success: true,
      data: {
        ...species,
        habitats,
        threats,
        observations,
        programs,
      },
    });
  } catch (err) {
    console.error('Get species by ID error:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
};

exports.createSpecies = async (req, res) => {
  try {
    const {
      commonName,
      scientificName,
      speciesType,
      family,
      conservationStatus,
      populationEstimate,
      description,
      discoveryDate,
      imageUrl,
      habitatIds = [], // Array of { habitatId, populationEstimate }
    } = req.body;

    // Required Field Validation
    if (!commonName || !scientificName || !speciesType || !family || !conservationStatus) {
      return res.status(400).json({
        success: false,
        message: 'Common name, scientific name, species type, family, and conservation status are required.',
      });
    }

    const validTypes = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Plant', 'Insect'];
    if (!validTypes.includes(speciesType)) {
      return res.status(400).json({ success: false, message: `Invalid species type. Must be one of: ${validTypes.join(', ')}` });
    }

    const validStatuses = ['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered'];
    if (!validStatuses.includes(conservationStatus)) {
      return res.status(400).json({ success: false, message: `Invalid conservation status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const pop = parseInt(populationEstimate || 0);
    if (isNaN(pop) || pop < 0) {
      return res.status(400).json({ success: false, message: 'Population estimate must be a non-negative integer.' });
    }

    // Check unique scientific name constraint
    const existing = await db.getOne('SELECT Species_ID FROM Species WHERE LOWER(Scientific_Name) = LOWER(?)', [scientificName.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: `A species with scientific name "${scientificName}" already exists in the database.` });
    }

    // Insert into Species Table
    const result = await db.query(`
      INSERT INTO Species (
        Common_Name, Scientific_Name, Species_Type, Family, 
        Conservation_Status, Population_Estimate, Description, Discovery_Date, Image_Url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      commonName.trim(),
      scientificName.trim(),
      speciesType,
      family.trim(),
      conservationStatus,
      pop,
      description || null,
      discoveryDate || null,
      imageUrl || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
    ]);

    const newSpeciesId = result.insertId;

    // Insert into Species_Habitat junction table if habitats provided
    if (Array.isArray(habitatIds) && habitatIds.length > 0) {
      for (const h of habitatIds) {
        const hId = typeof h === 'object' ? h.habitatId : h;
        const hPop = typeof h === 'object' ? (h.population || 0) : 0;
        if (hId) {
          await db.query(`
            INSERT OR IGNORE INTO Species_Habitat (Species_ID, Habitat_ID, Population_Estimate, Recorded_Date)
            VALUES (?, ?, ?, CURRENT_DATE)
          `, [newSpeciesId, hId, hPop]);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Species "${commonName}" added successfully to the biodiversity registry.`,
      speciesId: newSpeciesId,
    });
  } catch (err) {
    console.error('Create species error:', err);
    res.status(500).json({ success: false, message: 'Failed to create species record: ' + err.message });
  }
};

exports.updateSpecies = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      commonName,
      scientificName,
      speciesType,
      family,
      conservationStatus,
      populationEstimate,
      description,
      discoveryDate,
      imageUrl,
    } = req.body;

    const existing = await db.getOne('SELECT * FROM Species WHERE Species_ID = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Species with ID #${id} not found.` });
    }

    if (!commonName || !scientificName || !speciesType || !family || !conservationStatus) {
      return res.status(400).json({
        success: false,
        message: 'Common name, scientific name, species type, family, and conservation status are required.',
      });
    }

    // Check unique scientific name on other records
    const duplicate = await db.getOne(
      'SELECT Species_ID FROM Species WHERE LOWER(Scientific_Name) = LOWER(?) AND Species_ID != ?',
      [scientificName.trim(), id]
    );
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Another species record already uses scientific name "${scientificName}".` });
    }

    const pop = parseInt(populationEstimate || 0);
    if (isNaN(pop) || pop < 0) {
      return res.status(400).json({ success: false, message: 'Population estimate cannot be negative.' });
    }

    await db.query(`
      UPDATE Species SET
        Common_Name = ?,
        Scientific_Name = ?,
        Species_Type = ?,
        Family = ?,
        Conservation_Status = ?,
        Population_Estimate = ?,
        Description = ?,
        Discovery_Date = ?,
        Image_Url = ?
      WHERE Species_ID = ?
    `, [
      commonName.trim(),
      scientificName.trim(),
      speciesType,
      family.trim(),
      conservationStatus,
      pop,
      description,
      discoveryDate,
      imageUrl || existing.Image_Url,
      id,
    ]);

    res.json({
      success: true,
      message: `Species "${commonName}" updated successfully.`,
    });
  } catch (err) {
    console.error('Update species error:', err);
    res.status(500).json({ success: false, message: 'Failed to update species record: ' + err.message });
  }
};

exports.deleteSpecies = async (req, res) => {
  try {
    const { id } = req.params;

    const species = await db.getOne('SELECT Common_Name FROM Species WHERE Species_ID = ?', [id]);
    if (!species) {
      return res.status(404).json({ success: false, message: `Species with ID #${id} not found.` });
    }

    // Cascade delete handles Species_Habitat, Species_Threat, Species_Observation
    await db.query('DELETE FROM Species WHERE Species_ID = ?', [id]);

    res.json({
      success: true,
      message: `Species "${species.Common_Name}" and associated relational records have been safely deleted.`,
    });
  } catch (err) {
    console.error('Delete species error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete species: ' + err.message });
  }
};
