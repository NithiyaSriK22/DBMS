const db = require('../config/db');

exports.getAllResearchers = async (req, res) => {
  try {
    const { search, specialization } = req.query;

    let sql = `
      SELECT 
        r.Researcher_ID,
        r.Name,
        r.Email,
        r.Phone,
        r.Organization,
        r.Specialization,
        r.Experience_Years,
        COUNT(so.Observation_ID) AS observationCount,
        COALESCE(SUM(so.Population_Count), 0) AS totalSpecimensCount,
        MAX(so.Observation_Date) AS latestObservationDate
      FROM Researchers r
      LEFT JOIN Species_Observation so ON r.Researcher_ID = so.Researcher_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (r.Name LIKE ? OR r.Organization LIKE ? OR r.Specialization LIKE ? OR r.Email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (specialization && specialization !== 'All') {
      sql += ` AND r.Specialization = ?`;
      params.push(specialization);
    }

    sql += ` GROUP BY r.Researcher_ID, r.Name, r.Email, r.Phone, r.Organization, r.Specialization, r.Experience_Years`;
    sql += ` ORDER BY observationCount DESC, r.Experience_Years DESC`;

    const researchers = await db.query(sql, params);
    res.json({ success: true, count: researchers.length, data: researchers });
  } catch (err) {
    console.error('Get researchers error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve researchers: ' + err.message });
  }
};

exports.getResearcherById = async (req, res) => {
  try {
    const { id } = req.params;
    const researcher = await db.getOne('SELECT * FROM Researchers WHERE Researcher_ID = ?', [id]);

    if (!researcher) {
      return res.status(404).json({ success: false, message: `Researcher #${id} not found.` });
    }

    const observations = await db.query(`
      SELECT 
        so.Observation_ID,
        so.Observation_Date,
        so.Population_Count,
        so.Observation_Method,
        s.Common_Name,
        s.Scientific_Name,
        s.Conservation_Status,
        l.Location_Name,
        l.State
      FROM Species_Observation so
      JOIN Species s ON so.Species_ID = s.Species_ID
      JOIN Location l ON so.Location_ID = l.Location_ID
      WHERE so.Researcher_ID = ?
      ORDER BY so.Observation_Date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...researcher,
        observations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createResearcher = async (req, res) => {
  try {
    const { name, email, phone, organization, specialization, experienceYears } = req.body;

    if (!name || !email || !organization || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, organization, and specialization are required.',
      });
    }

    const exp = parseInt(experienceYears || 0);
    if (isNaN(exp) || exp < 0) {
      return res.status(400).json({ success: false, message: 'Experience years cannot be negative.' });
    }

    // Unique email check
    const existing = await db.getOne('SELECT Researcher_ID FROM Researchers WHERE LOWER(Email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: `Researcher with email "${email}" is already registered.` });
    }

    const result = await db.query(`
      INSERT INTO Researchers (Name, Email, Phone, Organization, Specialization, Experience_Years)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      name.trim(),
      email.trim(),
      phone || null,
      organization.trim(),
      specialization.trim(),
      exp,
    ]);

    res.status(201).json({
      success: true,
      message: `Researcher "${name}" added to the faculty registry.`,
      researcherId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create researcher: ' + err.message });
  }
};

exports.updateResearcher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, organization, specialization, experienceYears } = req.body;

    const existing = await db.getOne('SELECT * FROM Researchers WHERE Researcher_ID = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Researcher #${id} not found.` });
    }

    const exp = parseInt(experienceYears || 0);
    if (isNaN(exp) || exp < 0) {
      return res.status(400).json({ success: false, message: 'Experience years cannot be negative.' });
    }

    // Check unique email on other rows
    const duplicate = await db.getOne('SELECT Researcher_ID FROM Researchers WHERE LOWER(Email) = LOWER(?) AND Researcher_ID != ?', [email.trim(), id]);
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Another researcher is registered with email "${email}".` });
    }

    await db.query(`
      UPDATE Researchers SET
        Name = ?,
        Email = ?,
        Phone = ?,
        Organization = ?,
        Specialization = ?,
        Experience_Years = ?
      WHERE Researcher_ID = ?
    `, [
      name.trim(),
      email.trim(),
      phone,
      organization.trim(),
      specialization.trim(),
      exp,
      id,
    ]);

    res.json({ success: true, message: `Researcher "${name}" updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update researcher: ' + err.message });
  }
};

exports.deleteResearcher = async (req, res) => {
  try {
    const { id } = req.params;

    // Referential integrity: Check observations
    const obsCount = await db.getOne('SELECT COUNT(*) AS count FROM Species_Observation WHERE Researcher_ID = ?', [id]);
    if (obsCount && obsCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Referential Integrity Constraint: Cannot delete researcher because they have logged ${obsCount.count} species observation(s).`,
      });
    }

    const researcher = await db.getOne('SELECT Name FROM Researchers WHERE Researcher_ID = ?', [id]);
    await db.query('DELETE FROM Researchers WHERE Researcher_ID = ?', [id]);

    res.json({ success: true, message: `Researcher "${researcher?.Name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete researcher: ' + err.message });
  }
};
