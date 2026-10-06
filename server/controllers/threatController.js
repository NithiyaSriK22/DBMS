const db = require('../config/db');

exports.getAllThreats = async (req, res) => {
  try {
    const { search, type, severity } = req.query;

    let sql = `
      SELECT 
        t.Threat_ID,
        t.Threat_Name,
        t.Threat_Type,
        t.Severity,
        t.Description,
        COUNT(DISTINCT st.Species_ID) AS affectedSpeciesCount
      FROM Threat t
      LEFT JOIN Species_Threat st ON t.Threat_ID = st.Threat_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (t.Threat_Name LIKE ? OR t.Description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type && type !== 'All') {
      sql += ` AND t.Threat_Type = ?`;
      params.push(type);
    }

    if (severity && severity !== 'All') {
      sql += ` AND t.Severity = ?`;
      params.push(severity);
    }

    sql += ` GROUP BY t.Threat_ID, t.Threat_Name, t.Threat_Type, t.Severity, t.Description`;
    sql += ` ORDER BY 
      CASE t.Severity
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        WHEN 'Medium' THEN 3
        ELSE 4
      END, affectedSpeciesCount DESC`;

    const threats = await db.query(sql, params);
    res.json({ success: true, count: threats.length, data: threats });
  } catch (err) {
    console.error('Get threats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve threats: ' + err.message });
  }
};

exports.getThreatById = async (req, res) => {
  try {
    const { id } = req.params;
    const threat = await db.getOne('SELECT * FROM Threat WHERE Threat_ID = ?', [id]);

    if (!threat) {
      return res.status(404).json({ success: false, message: `Threat #${id} not found.` });
    }

    // Species affected by this threat
    const affectedSpecies = await db.query(`
      SELECT 
        s.Species_ID,
        s.Common_Name,
        s.Scientific_Name,
        s.Species_Type,
        s.Conservation_Status,
        s.Population_Estimate,
        st.Impact_Level,
        st.Recorded_Date,
        st.Description AS impactDescription
      FROM Species_Threat st
      JOIN Species s ON st.Species_ID = s.Species_ID
      WHERE st.Threat_ID = ?
      ORDER BY 
        CASE st.Impact_Level
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          ELSE 4
        END
    `, [id]);

    res.json({
      success: true,
      data: {
        ...threat,
        affectedSpecies,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createThreat = async (req, res) => {
  try {
    const { threatName, threatType, severity, description } = req.body;

    if (!threatName || !threatType || !severity) {
      return res.status(400).json({ success: false, message: 'Threat name, threat type, and severity are required.' });
    }

    const validTypes = ['Natural', 'Human', 'Environmental', 'Climate-related'];
    if (!validTypes.includes(threatType)) {
      return res.status(400).json({ success: false, message: `Invalid threat type. Allowed: ${validTypes.join(', ')}` });
    }

    const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ success: false, message: `Invalid severity. Allowed: ${validSeverities.join(', ')}` });
    }

    const existing = await db.getOne('SELECT Threat_ID FROM Threat WHERE LOWER(Threat_Name) = LOWER(?)', [threatName.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: `Threat "${threatName}" already exists in database.` });
    }

    const result = await db.query(`
      INSERT INTO Threat (Threat_Name, Threat_Type, Severity, Description)
      VALUES (?, ?, ?, ?)
    `, [
      threatName.trim(),
      threatType,
      severity,
      description || null,
    ]);

    res.status(201).json({
      success: true,
      message: `Threat factor "${threatName}" registered.`,
      threatId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create threat: ' + err.message });
  }
};

exports.updateThreat = async (req, res) => {
  try {
    const { id } = req.params;
    const { threatName, threatType, severity, description } = req.body;

    const existing = await db.getOne('SELECT * FROM Threat WHERE Threat_ID = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Threat #${id} not found.` });
    }

    const duplicate = await db.getOne('SELECT Threat_ID FROM Threat WHERE LOWER(Threat_Name) = LOWER(?) AND Threat_ID != ?', [threatName.trim(), id]);
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Another threat is already named "${threatName}".` });
    }

    await db.query(`
      UPDATE Threat SET
        Threat_Name = ?,
        Threat_Type = ?,
        Severity = ?,
        Description = ?
      WHERE Threat_ID = ?
    `, [
      threatName.trim(),
      threatType,
      severity,
      description,
      id,
    ]);

    res.json({ success: true, message: `Threat "${threatName}" updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update threat: ' + err.message });
  }
};

exports.deleteThreat = async (req, res) => {
  try {
    const { id } = req.params;
    const threat = await db.getOne('SELECT Threat_Name FROM Threat WHERE Threat_ID = ?', [id]);
    if (!threat) {
      return res.status(404).json({ success: false, message: `Threat #${id} not found.` });
    }

    // Cascade delete handles Species_Threat junction table
    await db.query('DELETE FROM Threat WHERE Threat_ID = ?', [id]);
    res.json({ success: true, message: `Threat "${threat.Threat_Name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete threat: ' + err.message });
  }
};

// Junction Table Endpoints (Species_Threat)
exports.linkSpeciesThreat = async (req, res) => {
  try {
    const { speciesId, threatId, impactLevel, description } = req.body;

    if (!speciesId || !threatId) {
      return res.status(400).json({ success: false, message: 'Species ID and Threat ID are required.' });
    }

    await db.query(`
      INSERT OR REPLACE INTO Species_Threat (Species_ID, Threat_ID, Impact_Level, Recorded_Date, Description)
      VALUES (?, ?, ?, CURRENT_DATE, ?)
    `, [speciesId, threatId, impactLevel || 'High', description || null]);

    res.json({ success: true, message: 'Threat linked to species successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to link threat: ' + err.message });
  }
};

exports.unlinkSpeciesThreat = async (req, res) => {
  try {
    const { speciesId, threatId } = req.params;
    await db.query('DELETE FROM Species_Threat WHERE Species_ID = ? AND Threat_ID = ?', [speciesId, threatId]);
    res.json({ success: true, message: 'Threat link removed from species.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to unlink threat: ' + err.message });
  }
};
