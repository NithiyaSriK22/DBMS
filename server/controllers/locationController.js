const db = require('../config/db');

exports.getAllLocations = async (req, res) => {
  try {
    const { search, state, habitatId } = req.query;

    let sql = `
      SELECT 
        l.Location_ID,
        l.Location_Name,
        l.State,
        l.Country,
        l.Latitude,
        l.Longitude,
        l.Habitat_ID,
        h.Habitat_Name,
        h.Habitat_Type,
        h.Protection_Status,
        COUNT(DISTINCT so.Species_ID) AS speciesCount,
        COUNT(DISTINCT so.Observation_ID) AS observationCount,
        COUNT(DISTINCT cp.Program_ID) AS programCount
      FROM Location l
      JOIN Habitat h ON l.Habitat_ID = h.Habitat_ID
      LEFT JOIN Species_Observation so ON l.Location_ID = so.Location_ID
      LEFT JOIN Conservation_Program cp ON l.Location_ID = cp.Location_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (l.Location_Name LIKE ? OR l.State LIKE ? OR h.Habitat_Name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (state && state !== 'All') {
      sql += ` AND l.State = ?`;
      params.push(state);
    }

    if (habitatId && habitatId !== 'All') {
      sql += ` AND l.Habitat_ID = ?`;
      params.push(habitatId);
    }

    sql += ` GROUP BY l.Location_ID, l.Location_Name, l.State, l.Country, l.Latitude, l.Longitude, l.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Protection_Status`;
    sql += ` ORDER BY l.State ASC, l.Location_Name ASC`;

    const locations = await db.query(sql, params);
    res.json({ success: true, count: locations.length, data: locations });
  } catch (err) {
    console.error('Get locations error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve locations: ' + err.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await db.getOne(`
      SELECT 
        l.*,
        h.Habitat_Name,
        h.Habitat_Type,
        h.Climate,
        h.Protection_Status
      FROM Location l
      JOIN Habitat h ON l.Habitat_ID = h.Habitat_ID
      WHERE l.Location_ID = ?
    `, [id]);

    if (!location) {
      return res.status(404).json({ success: false, message: `Location #${id} not found.` });
    }

    // Observations at this location
    const observations = await db.query(`
      SELECT 
        so.Observation_ID,
        so.Observation_Date,
        so.Population_Count,
        so.Observation_Method,
        s.Common_Name AS speciesName,
        s.Scientific_Name,
        s.Conservation_Status,
        r.Name AS researcherName
      FROM Species_Observation so
      JOIN Species s ON so.Species_ID = s.Species_ID
      JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
      WHERE so.Location_ID = ?
      ORDER BY so.Observation_Date DESC
    `, [id]);

    // Programs at this location
    const programs = await db.query(`
      SELECT * FROM Conservation_Program WHERE Location_ID = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...location,
        observations,
        programs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { locationName, state, country, latitude, longitude, habitatId } = req.body;

    if (!locationName || !state || !latitude || !longitude || !habitatId) {
      return res.status(400).json({
        success: false,
        message: 'Location name, state, latitude, longitude, and habitat are required.',
      });
    }

    // Verify foreign key habitat exists
    const habitat = await db.getOne('SELECT Habitat_ID FROM Habitat WHERE Habitat_ID = ?', [habitatId]);
    if (!habitat) {
      return res.status(400).json({ success: false, message: `Foreign Key Violation: Habitat #${habitatId} does not exist.` });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const result = await db.query(`
      INSERT INTO Location (Location_Name, State, Country, Latitude, Longitude, Habitat_ID)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      locationName.trim(),
      state.trim(),
      country ? country.trim() : 'India',
      lat,
      lng,
      habitatId,
    ]);

    res.status(201).json({
      success: true,
      message: `Location "${locationName}" created successfully.`,
      locationId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create location: ' + err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, state, country, latitude, longitude, habitatId } = req.body;

    const existing = await db.getOne('SELECT * FROM Location WHERE Location_ID = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Location #${id} not found.` });
    }

    if (habitatId) {
      const habitat = await db.getOne('SELECT Habitat_ID FROM Habitat WHERE Habitat_ID = ?', [habitatId]);
      if (!habitat) {
        return res.status(400).json({ success: false, message: `Foreign Key Violation: Habitat #${habitatId} does not exist.` });
      }
    }

    await db.query(`
      UPDATE Location SET
        Location_Name = ?,
        State = ?,
        Country = ?,
        Latitude = ?,
        Longitude = ?,
        Habitat_ID = ?
      WHERE Location_ID = ?
    `, [
      locationName.trim(),
      state.trim(),
      country ? country.trim() : 'India',
      parseFloat(latitude),
      parseFloat(longitude),
      habitatId || existing.Habitat_ID,
      id,
    ]);

    res.json({ success: true, message: `Location "${locationName}" updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update location: ' + err.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Referential integrity: Check observations & programs
    const obsCount = await db.getOne('SELECT COUNT(*) AS count FROM Species_Observation WHERE Location_ID = ?', [id]);
    if (obsCount && obsCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Referential Integrity Constraint: Cannot delete location because it is referenced by ${obsCount.count} species observation record(s).`,
      });
    }

    const progCount = await db.getOne('SELECT COUNT(*) AS count FROM Conservation_Program WHERE Location_ID = ?', [id]);
    if (progCount && progCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Referential Integrity Constraint: Cannot delete location because ${progCount.count} active conservation program(s) are established here.`,
      });
    }

    await db.query('DELETE FROM Location WHERE Location_ID = ?', [id]);
    res.json({ success: true, message: 'Location deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete location: ' + err.message });
  }
};
