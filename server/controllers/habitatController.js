const db = require('../config/db');

exports.getAllHabitats = async (req, res) => {
  try {
    const { search, type, protection } = req.query;

    let sql = `
      SELECT 
        h.Habitat_ID,
        h.Habitat_Name,
        h.Habitat_Type,
        h.Climate,
        h.Area,
        h.Description,
        h.Protection_Status,
        COUNT(DISTINCT sh.Species_ID) AS speciesCount,
        COUNT(DISTINCT l.Location_ID) AS locationCount,
        COALESCE(SUM(sh.Population_Estimate), 0) AS totalRecordedPopulation
      FROM Habitat h
      LEFT JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
      LEFT JOIN Location l ON h.Habitat_ID = l.Habitat_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (h.Habitat_Name LIKE ? OR h.Habitat_Type LIKE ? OR h.Climate LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type && type !== 'All') {
      sql += ` AND h.Habitat_Type = ?`;
      params.push(type);
    }

    if (protection && protection !== 'All') {
      sql += ` AND h.Protection_Status = ?`;
      params.push(protection);
    }

    sql += ` GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Climate, h.Area, h.Description, h.Protection_Status`;
    sql += ` ORDER BY speciesCount DESC, h.Habitat_Name ASC`;

    const habitats = await db.query(sql, params);
    res.json({ success: true, count: habitats.length, data: habitats });
  } catch (err) {
    console.error('Get habitats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve habitats: ' + err.message });
  }
};

exports.getHabitatById = async (req, res) => {
  try {
    const { id } = req.params;
    const habitat = await db.getOne('SELECT * FROM Habitat WHERE Habitat_ID = ?', [id]);

    if (!habitat) {
      return res.status(404).json({ success: false, message: `Habitat #${id} not found.` });
    }

    // Species living in this habitat
    const species = await db.query(`
      SELECT 
        s.Species_ID,
        s.Common_Name,
        s.Scientific_Name,
        s.Species_Type,
        s.Conservation_Status,
        s.Image_Url,
        sh.Population_Estimate AS habitatPopulation,
        sh.Recorded_Date
      FROM Species_Habitat sh
      JOIN Species s ON sh.Species_ID = s.Species_ID
      WHERE sh.Habitat_ID = ?
      ORDER BY sh.Population_Estimate DESC
    `, [id]);

    // Locations associated with this habitat
    const locations = await db.query(`
      SELECT 
        l.Location_ID,
        l.Location_Name,
        l.State,
        l.Country,
        l.Latitude,
        l.Longitude,
        COUNT(so.Observation_ID) AS observationCount
      FROM Location l
      LEFT JOIN Species_Observation so ON l.Location_ID = so.Location_ID
      WHERE l.Habitat_ID = ?
      GROUP BY l.Location_ID, l.Location_Name, l.State, l.Country, l.Latitude, l.Longitude
    `, [id]);

    res.json({
      success: true,
      data: {
        ...habitat,
        species,
        locations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createHabitat = async (req, res) => {
  try {
    const { habitatName, habitatType, climate, area, description, protectionStatus } = req.body;

    if (!habitatName || !habitatType || !climate) {
      return res.status(400).json({ success: false, message: 'Habitat name, habitat type, and climate are required.' });
    }

    const areaNum = parseFloat(area || 0);
    if (isNaN(areaNum) || areaNum < 0) {
      return res.status(400).json({ success: false, message: 'Area must be a non-negative number in sq km.' });
    }

    // Unique name check
    const existing = await db.getOne('SELECT Habitat_ID FROM Habitat WHERE LOWER(Habitat_Name) = LOWER(?)', [habitatName.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: `Habitat with name "${habitatName}" already exists.` });
    }

    const result = await db.query(`
      INSERT INTO Habitat (Habitat_Name, Habitat_Type, Climate, Area, Description, Protection_Status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      habitatName.trim(),
      habitatType.trim(),
      climate.trim(),
      areaNum,
      description || null,
      protectionStatus || 'Protected',
    ]);

    res.status(201).json({
      success: true,
      message: `Habitat "${habitatName}" created successfully.`,
      habitatId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create habitat: ' + err.message });
  }
};

exports.updateHabitat = async (req, res) => {
  try {
    const { id } = req.params;
    const { habitatName, habitatType, climate, area, description, protectionStatus } = req.body;

    const existing = await db.getOne('SELECT * FROM Habitat WHERE Habitat_ID = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Habitat #${id} not found.` });
    }

    const areaNum = parseFloat(area || 0);
    if (isNaN(areaNum) || areaNum < 0) {
      return res.status(400).json({ success: false, message: 'Area cannot be negative.' });
    }

    // Check duplicate name
    const duplicate = await db.getOne('SELECT Habitat_ID FROM Habitat WHERE LOWER(Habitat_Name) = LOWER(?) AND Habitat_ID != ?', [habitatName.trim(), id]);
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Another habitat is already named "${habitatName}".` });
    }

    await db.query(`
      UPDATE Habitat SET
        Habitat_Name = ?,
        Habitat_Type = ?,
        Climate = ?,
        Area = ?,
        Description = ?,
        Protection_Status = ?
      WHERE Habitat_ID = ?
    `, [
      habitatName.trim(),
      habitatType.trim(),
      climate.trim(),
      areaNum,
      description,
      protectionStatus || 'Protected',
      id,
    ]);

    res.json({ success: true, message: `Habitat "${habitatName}" updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update habitat: ' + err.message });
  }
};

exports.deleteHabitat = async (req, res) => {
  try {
    const { id } = req.params;

    // Referential Integrity Check: Prevent deletion if locations reference this habitat
    const linkedLocations = await db.getOne('SELECT COUNT(*) AS count FROM Location WHERE Habitat_ID = ?', [id]);
    if (linkedLocations && linkedLocations.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Referential Integrity Warning: Cannot delete this habitat because ${linkedLocations.count} geographical location(s) currently reference it. Please reassign or delete the locations first.`,
      });
    }

    const habitat = await db.getOne('SELECT Habitat_Name FROM Habitat WHERE Habitat_ID = ?', [id]);
    if (!habitat) {
      return res.status(404).json({ success: false, message: `Habitat #${id} not found.` });
    }

    await db.query('DELETE FROM Habitat WHERE Habitat_ID = ?', [id]);
    res.json({ success: true, message: `Habitat "${habitat.Habitat_Name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete habitat: ' + err.message });
  }
};
