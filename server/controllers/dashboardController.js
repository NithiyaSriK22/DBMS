const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. STATISTIC CARDS (Real SQL aggregations)
    const totalSpeciesRes = await db.getOne('SELECT COUNT(*) AS count FROM Species');
    const protectedSpeciesRes = await db.getOne("SELECT COUNT(*) AS count FROM Species WHERE Conservation_Status != 'Least Concern'");
    const totalHabitatsRes = await db.getOne('SELECT COUNT(*) AS count FROM Habitat');
    const endangeredSpeciesRes = await db.getOne("SELECT COUNT(*) AS count FROM Species WHERE Conservation_Status IN ('Endangered', 'Critically Endangered')");
    const activeProgramsRes = await db.getOne("SELECT COUNT(*) AS count FROM Conservation_Program WHERE Status = 'Active'");
    const totalObservationsRes = await db.getOne('SELECT COUNT(*) AS count, COALESCE(SUM(Population_Count), 0) AS totalIndividuals FROM Species_Observation');
    const totalResearchersRes = await db.getOne('SELECT COUNT(*) AS count FROM Researchers');
    const totalThreatsRes = await db.getOne('SELECT COUNT(*) AS count FROM Threat');

    // 2. CHART 1: Species by Category
    const speciesByCategory = await db.query(`
      SELECT 
        Species_Type AS category,
        COUNT(*) AS count
      FROM Species
      GROUP BY Species_Type
      ORDER BY count DESC
    `);

    // 3. CHART 2: Species by Conservation Status
    const speciesByStatus = await db.query(`
      SELECT 
        Conservation_Status AS status,
        COUNT(*) AS count
      FROM Species
      GROUP BY Conservation_Status
      ORDER BY 
        CASE Conservation_Status
          WHEN 'Critically Endangered' THEN 1
          WHEN 'Endangered' THEN 2
          WHEN 'Vulnerable' THEN 3
          WHEN 'Near Threatened' THEN 4
          WHEN 'Least Concern' THEN 5
          ELSE 6
        END
    `);

    // 4. CHART 3: Species Distribution by Location / Region (Top Locations)
    const speciesByRegion = await db.query(`
      SELECT 
        l.State AS region,
        l.Location_Name AS locationName,
        COUNT(DISTINCT so.Species_ID) AS speciesCount,
        COUNT(so.Observation_ID) AS observationCount
      FROM Location l
      LEFT JOIN Species_Observation so ON l.Location_ID = so.Location_ID
      GROUP BY l.Location_ID, l.State, l.Location_Name
      ORDER BY speciesCount DESC, observationCount DESC
      LIMIT 8
    `);

    // 5. CHART 4: Population Trend (Observations Count & Specimens by Year/Period)
    const populationTrend = await db.query(`
      SELECT 
        strftime('%Y-%m', Observation_Date) AS period,
        COUNT(Observation_ID) AS observationCount,
        SUM(Population_Count) AS individualCount
      FROM Species_Observation
      GROUP BY strftime('%Y-%m', Observation_Date)
      ORDER BY period ASC
    `);

    // 6. CHART 5: Major Threats (Number of species affected by each threat)
    const majorThreats = await db.query(`
      SELECT 
        t.Threat_Name AS threatName,
        t.Threat_Type AS threatType,
        t.Severity AS severity,
        COUNT(st.Species_ID) AS affectedSpeciesCount
      FROM Threat t
      LEFT JOIN Species_Threat st ON t.Threat_ID = st.Threat_ID
      GROUP BY t.Threat_ID, t.Threat_Name, t.Threat_Type, t.Severity
      ORDER BY affectedSpeciesCount DESC, 
        CASE t.Severity
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          ELSE 4
        END
      LIMIT 8
    `);

    // 7. RECENT OBSERVATIONS STREAM (Multi-table join)
    const recentObservations = await db.query(`
      SELECT 
        so.Observation_ID,
        so.Observation_Date,
        so.Population_Count,
        so.Observation_Method,
        s.Common_Name AS speciesName,
        s.Scientific_Name,
        s.Conservation_Status,
        s.Species_Type,
        l.Location_Name,
        l.State,
        r.Name AS researcherName,
        r.Organization
      FROM Species_Observation so
      JOIN Species s ON so.Species_ID = s.Species_ID
      JOIN Location l ON so.Location_ID = l.Location_ID
      JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
      ORDER BY so.Observation_Date DESC, so.Observation_ID DESC
      LIMIT 6
    `);

    // 8. ACTIVE CONSERVATION SPOTLIGHT
    const activePrograms = await db.query(`
      SELECT 
        cp.Program_ID,
        cp.Program_Name,
        cp.Budget,
        cp.Status,
        l.Location_Name,
        l.State,
        COUNT(ca.Activity_ID) AS activityCount
      FROM Conservation_Program cp
      JOIN Location l ON cp.Location_ID = l.Location_ID
      LEFT JOIN Conservation_Activity ca ON cp.Program_ID = ca.Program_ID
      WHERE cp.Status = 'Active'
      GROUP BY cp.Program_ID, cp.Program_Name, cp.Budget, cp.Status, l.Location_Name, l.State
      LIMIT 4
    `);

    res.json({
      success: true,
      data: {
        cards: {
          totalSpecies: Number(totalSpeciesRes?.count || 0),
          protectedSpecies: Number(protectedSpeciesRes?.count || 0),
          totalHabitats: Number(totalHabitatsRes?.count || 0),
          endangeredSpecies: Number(endangeredSpeciesRes?.count || 0),
          activePrograms: Number(activeProgramsRes?.count || 0),
          recordedObservations: Number(totalObservationsRes?.count || 0),
          totalIndividuals: Number(totalObservationsRes?.totalIndividuals || 0),
          totalResearchers: Number(totalResearchersRes?.count || 0),
          totalThreats: Number(totalThreatsRes?.count || 0),
        },
        charts: {
          speciesByCategory,
          speciesByStatus,
          speciesByRegion,
          populationTrend,
          majorThreats,
        },
        recentObservations,
        activePrograms,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics: ' + err.message });
  }
};
