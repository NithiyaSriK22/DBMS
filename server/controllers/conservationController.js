const db = require('../config/db');

// ============================================================================
// CONSERVATION PROGRAMS
// ============================================================================

exports.getAllPrograms = async (req, res) => {
  try {
    const { search, status, locationId } = req.query;

    let sql = `
      SELECT 
        cp.Program_ID,
        cp.Program_Name,
        cp.Objective,
        cp.Start_Date,
        cp.End_Date,
        cp.Budget,
        cp.Status,
        cp.Location_ID,
        l.Location_Name,
        l.State,
        h.Habitat_Name,
        COUNT(DISTINCT ca.Activity_ID) AS activityCount
      FROM Conservation_Program cp
      JOIN Location l ON cp.Location_ID = l.Location_ID
      JOIN Habitat h ON l.Habitat_ID = h.Habitat_ID
      LEFT JOIN Conservation_Activity ca ON cp.Program_ID = ca.Program_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (cp.Program_Name LIKE ? OR cp.Objective LIKE ? OR l.Location_Name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'All') {
      sql += ` AND cp.Status = ?`;
      params.push(status);
    }

    if (locationId && locationId !== 'All') {
      sql += ` AND cp.Location_ID = ?`;
      params.push(locationId);
    }

    sql += ` GROUP BY cp.Program_ID, cp.Program_Name, cp.Objective, cp.Start_Date, cp.End_Date, cp.Budget, cp.Status, cp.Location_ID, l.Location_Name, l.State, h.Habitat_Name`;
    sql += ` ORDER BY cp.Status ASC, cp.Budget DESC`;

    const programs = await db.query(sql, params);
    const statsRes = await db.getOne(`
      SELECT 
        COUNT(*) AS totalPrograms,
        COALESCE(SUM(Budget), 0) AS totalBudget,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activePrograms
      FROM Conservation_Program
    `);

    res.json({
      success: true,
      stats: {
        totalPrograms: statsRes?.totalPrograms || 0,
        totalBudget: statsRes?.totalBudget || 0,
        activePrograms: statsRes?.activePrograms || 0,
      },
      count: programs.length,
      data: programs,
    });
  } catch (err) {
    console.error('Get conservation programs error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve conservation programs: ' + err.message });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await db.getOne(`
      SELECT 
        cp.*,
        l.Location_Name,
        l.State,
        l.Country,
        h.Habitat_Name,
        h.Habitat_Type
      FROM Conservation_Program cp
      JOIN Location l ON cp.Location_ID = l.Location_ID
      JOIN Habitat h ON l.Habitat_ID = h.Habitat_ID
      WHERE cp.Program_ID = ?
    `, [id]);

    if (!program) {
      return res.status(404).json({ success: false, message: `Conservation Program #${id} not found.` });
    }

    // Associated field activities
    const activities = await db.query(`
      SELECT * FROM Conservation_Activity 
      WHERE Program_ID = ? 
      ORDER BY Activity_Date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...program,
        activities,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { programName, objective, startDate, endDate, budget, status, locationId } = req.body;

    if (!programName || !objective || !startDate || !locationId) {
      return res.status(400).json({
        success: false,
        message: 'Program name, objective, start date, and location are required.',
      });
    }

    const validStatuses = ['Planned', 'Active', 'Completed', 'Suspended'];
    const assignedStatus = validStatuses.includes(status) ? status : 'Planned';

    const b = parseFloat(budget || 0);
    if (isNaN(b) || b < 0) {
      return res.status(400).json({ success: false, message: 'Budget must be a non-negative number.' });
    }

    // Check FK
    const loc = await db.getOne('SELECT Location_ID FROM Location WHERE Location_ID = ?', [locationId]);
    if (!loc) {
      return res.status(400).json({ success: false, message: `Foreign Key Violation: Location #${locationId} does not exist.` });
    }

    const result = await db.query(`
      INSERT INTO Conservation_Program (Program_Name, Objective, Start_Date, End_Date, Budget, Status, Location_ID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      programName.trim(),
      objective.trim(),
      startDate,
      endDate || null,
      b,
      assignedStatus,
      locationId,
    ]);

    res.status(201).json({
      success: true,
      message: `Conservation Program "${programName}" initiated successfully.`,
      programId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create program: ' + err.message });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { programName, objective, startDate, endDate, budget, status, locationId } = req.body;

    const existing = await db.getOne('SELECT * FROM Conservation_Program WHERE Program_ID = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Program #${id} not found.` });
    }

    const b = parseFloat(budget || 0);
    if (isNaN(b) || b < 0) {
      return res.status(400).json({ success: false, message: 'Budget cannot be negative.' });
    }

    await db.query(`
      UPDATE Conservation_Program SET
        Program_Name = ?,
        Objective = ?,
        Start_Date = ?,
        End_Date = ?,
        Budget = ?,
        Status = ?,
        Location_ID = ?
      WHERE Program_ID = ?
    `, [
      programName.trim(),
      objective.trim(),
      startDate || existing.Start_Date,
      endDate,
      b,
      status || existing.Status,
      locationId || existing.Location_ID,
      id,
    ]);

    res.json({ success: true, message: `Program "${programName}" updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update program: ' + err.message });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const prog = await db.getOne('SELECT Program_Name FROM Conservation_Program WHERE Program_ID = ?', [id]);
    if (!prog) {
      return res.status(404).json({ success: false, message: `Program #${id} not found.` });
    }

    // Cascade delete automatically cleans up child activities
    await db.query('DELETE FROM Conservation_Program WHERE Program_ID = ?', [id]);
    res.json({ success: true, message: `Program "${prog.Program_Name}" and all activities deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete program: ' + err.message });
  }
};

// ============================================================================
// CONSERVATION ACTIVITIES
// ============================================================================

exports.createActivity = async (req, res) => {
  try {
    const { programId, activityName, activityDate, responsiblePerson, description, outcome } = req.body;

    if (!programId || !activityName || !activityDate || !responsiblePerson) {
      return res.status(400).json({
        success: false,
        message: 'Program ID, Activity Name, Date, and Responsible Person are required.',
      });
    }

    const prog = await db.getOne('SELECT Program_ID FROM Conservation_Program WHERE Program_ID = ?', [programId]);
    if (!prog) {
      return res.status(400).json({ success: false, message: `Foreign Key Violation: Program #${programId} does not exist.` });
    }

    const result = await db.query(`
      INSERT INTO Conservation_Activity (Program_ID, Activity_Name, Activity_Date, Responsible_Person, Description, Outcome)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      programId,
      activityName.trim(),
      activityDate,
      responsiblePerson.trim(),
      description || null,
      outcome || null,
    ]);

    res.status(201).json({
      success: true,
      message: `Conservation activity "${activityName}" recorded.`,
      activityId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add activity: ' + err.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Conservation_Activity WHERE Activity_ID = ?', [id]);
    res.json({ success: true, message: 'Conservation activity removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete activity: ' + err.message });
  }
};
