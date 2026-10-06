const db = require('../config/db');

exports.getAllObservations = async (req, res) => {
  try {
    const { search, speciesId, locationId, researcherId, method, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT 
        so.Observation_ID,
        so.Observation_Date,
        so.Population_Count,
        so.Observation_Method,
        so.Notes,
        s.Species_ID,
        s.Common_Name AS speciesName,
        s.Scientific_Name,
        s.Species_Type,
        s.Conservation_Status,
        l.Location_ID,
        l.Location_Name,
        l.State,
        h.Habitat_Name,
        r.Researcher_ID,
        r.Name AS researcherName,
        r.Organization
      FROM Species_Observation so
      JOIN Species s ON so.Species_ID = s.Species_ID
      JOIN Location l ON so.Location_ID = l.Location_ID
      JOIN Habitat h ON l.Habitat_ID = h.Habitat_ID
      JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (s.Common_Name LIKE ? OR s.Scientific_Name LIKE ? OR l.Location_Name LIKE ? OR r.Name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (speciesId && speciesId !== 'All') {
      sql += ` AND so.Species_ID = ?`;
      params.push(speciesId);
    }

    if (locationId && locationId !== 'All') {
      sql += ` AND so.Location_ID = ?`;
      params.push(locationId);
    }

    if (researcherId && researcherId !== 'All') {
      sql += ` AND so.Researcher_ID = ?`;
      params.push(researcherId);
    }

    if (method && method !== 'All') {
      sql += ` AND so.Observation_Method = ?`;
      params.push(method);
    }

    if (startDate) {
      sql += ` AND so.Observation_Date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND so.Observation_Date <= ?`;
      params.push(endDate);
    }

    sql += ` ORDER BY so.Observation_Date DESC, so.Observation_ID DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const observations = await db.query(sql, params);
    const countRes = await db.getOne('SELECT COUNT(*) AS total, SUM(Population_Count) AS totalIndividuals FROM Species_Observation');

    res.json({
      success: true,
      total: countRes?.total || 0,
      totalIndividuals: countRes?.totalIndividuals || 0,
      count: observations.length,
      data: observations,
    });
  } catch (err) {
    console.error('Get observations error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve observations: ' + err.message });
  }
};

exports.getObservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const observation = await db.getOne(`
      SELECT 
        so.*,
        s.Common_Name,
        s.Scientific_Name,
        s.Species_Type,
        s.Conservation_Status,
        l.Location_Name,
        l.State,
        l.Latitude,
        l.Longitude,
        r.Name AS researcherName,
        r.Organization,
        r.Specialization
      FROM Species_Observation so
      JOIN Species s ON so.Species_ID = s.Species_ID
      JOIN Location l ON so.Location_ID = l.Location_ID
      JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
      WHERE so.Observation_ID = ?
    `, [id]);

    if (!observation) {
      return res.status(404).json({ success: false, message: `Observation #${id} not found.` });
    }

    res.json({ success: true, data: observation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createObservation = async (req, res) => {
  try {
    const {
      speciesId,
      locationId,
      researcherId,
      observationDate,
      populationCount,
      observationMethod,
      notes,
    } = req.body;

    if (!speciesId || !locationId || !researcherId || !observationDate || !observationMethod) {
      return res.status(400).json({
        success: false,
        message: 'Species, Location, Researcher, Observation Date, and Observation Method are required.',
      });
    }

    const validMethods = ['Camera Trap', 'Field Survey', 'Drone Survey', 'GPS Tracking', 'Direct Observation', 'Environmental DNA'];
    if (!validMethods.includes(observationMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid observation method. Allowed methods: ${validMethods.join(', ')}`,
      });
    }

    const count = parseInt(populationCount || 1);
    if (isNaN(count) || count < 0) {
      return res.status(400).json({ success: false, message: 'Population count cannot be negative.' });
    }

    // Verify foreign keys exist
    const species = await db.getOne('SELECT Species_ID FROM Species WHERE Species_ID = ?', [speciesId]);
    if (!species) return res.status(400).json({ success: false, message: `Foreign Key Violation: Species #${speciesId} does not exist.` });

    const location = await db.getOne('SELECT Location_ID FROM Location WHERE Location_ID = ?', [locationId]);
    if (!location) return res.status(400).json({ success: false, message: `Foreign Key Violation: Location #${locationId} does not exist.` });

    const researcher = await db.getOne('SELECT Researcher_ID FROM Researchers WHERE Researcher_ID = ?', [researcherId]);
    if (!researcher) return res.status(400).json({ success: false, message: `Foreign Key Violation: Researcher #${researcherId} does not exist.` });

    const result = await db.query(`
      INSERT INTO Species_Observation (
        Species_ID, Location_ID, Researcher_ID, Observation_Date, 
        Population_Count, Observation_Method, Notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      speciesId,
      locationId,
      researcherId,
      observationDate,
      count,
      observationMethod,
      notes || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Species field observation recorded successfully.',
      observationId: result.insertId,
    });
  } catch (err) {
    console.error('Create observation error:', err);
    res.status(500).json({ success: false, message: 'Failed to record observation: ' + err.message });
  }
};

exports.updateObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      speciesId,
      locationId,
      researcherId,
      observationDate,
      populationCount,
      observationMethod,
      notes,
    } = req.body;

    const existing = await db.getOne('SELECT * FROM Species_Observation WHERE Observation_ID = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Observation #${id} not found.` });
    }

    const count = parseInt(populationCount || 1);
    if (isNaN(count) || count < 0) {
      return res.status(400).json({ success: false, message: 'Population count cannot be negative.' });
    }

    await db.query(`
      UPDATE Species_Observation SET
        Species_ID = ?,
        Location_ID = ?,
        Researcher_ID = ?,
        Observation_Date = ?,
        Population_Count = ?,
        Observation_Method = ?,
        Notes = ?
      WHERE Observation_ID = ?
    `, [
      speciesId || existing.Species_ID,
      locationId || existing.Location_ID,
      researcherId || existing.Researcher_ID,
      observationDate || existing.Observation_Date,
      count,
      observationMethod || existing.Observation_Method,
      notes,
      id,
    ]);

    res.json({ success: true, message: 'Observation record updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update observation: ' + err.message });
  }
};

exports.deleteObservation = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Species_Observation WHERE Observation_ID = ?', [id]);
    res.json({ success: true, message: `Observation #${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete observation: ' + err.message });
  }
};
