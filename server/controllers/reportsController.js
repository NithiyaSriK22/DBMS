const db = require('../config/db');

exports.getReports = async (req, res) => {
  try {
    const { reportType = 'all' } = req.query;
    const results = {};

    // REPORT 1: Species by Conservation Status
    if (reportType === 'all' || reportType === 'status') {
      results.speciesByStatus = await db.query(`
        SELECT 
          Conservation_Status,
          COUNT(*) AS totalSpecies,
          SUM(Population_Estimate) AS totalEstimatedPopulation,
          ROUND(AVG(Population_Estimate), 1) AS avgPopulation,
          MIN(Population_Estimate) AS minPopulation,
          MAX(Population_Estimate) AS maxPopulation
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
    }

    // REPORT 2: Species by Habitat
    if (reportType === 'all' || reportType === 'habitat') {
      results.speciesByHabitat = await db.query(`
        SELECT 
          h.Habitat_ID,
          h.Habitat_Name,
          h.Habitat_Type,
          h.Protection_Status,
          h.Area AS areaSqKm,
          COUNT(sh.Species_ID) AS speciesCount,
          COALESCE(SUM(sh.Population_Estimate), 0) AS totalRecordedPopulation
        FROM Habitat h
        LEFT JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
        GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Protection_Status, h.Area
        ORDER BY speciesCount DESC, totalRecordedPopulation DESC
      `);
    }

    // REPORT 3: Most Threatened Species
    if (reportType === 'all' || reportType === 'threatened') {
      results.mostThreatened = await db.query(`
        SELECT 
          s.Species_ID,
          s.Common_Name,
          s.Scientific_Name,
          s.Species_Type,
          s.Conservation_Status,
          s.Population_Estimate,
          COUNT(st.Threat_ID) AS totalThreatsCount,
          SUM(CASE WHEN st.Impact_Level = 'Critical' THEN 1 ELSE 0 END) AS criticalThreatsCount,
          SUM(CASE WHEN st.Impact_Level = 'High' THEN 1 ELSE 0 END) AS highThreatsCount
        FROM Species s
        JOIN Species_Threat st ON s.Species_ID = st.Species_ID
        GROUP BY s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Conservation_Status, s.Population_Estimate
        ORDER BY criticalThreatsCount DESC, totalThreatsCount DESC, s.Population_Estimate ASC
        LIMIT 15
      `);
    }

    // REPORT 4: Population Trends (Observations by Year/Method)
    if (reportType === 'all' || reportType === 'population_trends') {
      results.populationTrends = await db.query(`
        SELECT 
          strftime('%Y', Observation_Date) AS observationYear,
          Observation_Method,
          COUNT(Observation_ID) AS totalSurveys,
          SUM(Population_Count) AS specimensRecorded
        FROM Species_Observation
        GROUP BY strftime('%Y', Observation_Date), Observation_Method
        ORDER BY observationYear ASC, specimensRecorded DESC
      `);
    }

    // REPORT 5: Threats Affecting Biodiversity
    if (reportType === 'all' || reportType === 'threats') {
      results.threatsImpact = await db.query(`
        SELECT 
          t.Threat_ID,
          t.Threat_Name,
          t.Threat_Type,
          t.Severity,
          COUNT(st.Species_ID) AS affectedSpeciesCount,
          SUM(CASE WHEN s.Conservation_Status IN ('Endangered', 'Critically Endangered') THEN 1 ELSE 0 END) AS endangeredSpeciesAffected
        FROM Threat t
        LEFT JOIN Species_Threat st ON t.Threat_ID = st.Threat_ID
        LEFT JOIN Species s ON st.Species_ID = s.Species_ID
        GROUP BY t.Threat_ID, t.Threat_Name, t.Threat_Type, t.Severity
        ORDER BY affectedSpeciesCount DESC, endangeredSpeciesAffected DESC
      `);
    }

    // REPORT 6: Conservation Programs by Region / State
    if (reportType === 'all' || reportType === 'conservation_region') {
      results.conservationByRegion = await db.query(`
        SELECT 
          l.State AS region,
          COUNT(DISTINCT cp.Program_ID) AS totalPrograms,
          SUM(cp.Budget) AS totalBudgetAllocated,
          SUM(CASE WHEN cp.Status = 'Active' THEN 1 ELSE 0 END) AS activePrograms,
          COUNT(ca.Activity_ID) AS totalExecutedActivities
        FROM Location l
        JOIN Conservation_Program cp ON l.Location_ID = cp.Location_ID
        LEFT JOIN Conservation_Activity ca ON cp.Program_ID = ca.Program_ID
        GROUP BY l.State
        ORDER BY totalBudgetAllocated DESC
      `);
    }

    // REPORT 7: Researcher Observation Count & Impact
    if (reportType === 'all' || reportType === 'researchers') {
      results.researcherActivity = await db.query(`
        SELECT 
          r.Researcher_ID,
          r.Name,
          r.Organization,
          r.Specialization,
          r.Experience_Years,
          COUNT(so.Observation_ID) AS totalSurveysConducted,
          COALESCE(SUM(so.Population_Count), 0) AS totalSpecimensDocumented,
          COUNT(DISTINCT so.Species_ID) AS distinctSpeciesTracked,
          COUNT(DISTINCT so.Location_ID) AS locationsSurveyed
        FROM Researchers r
        LEFT JOIN Species_Observation so ON r.Researcher_ID = so.Researcher_ID
        GROUP BY r.Researcher_ID, r.Name, r.Organization, r.Specialization, r.Experience_Years
        ORDER BY totalSurveysConducted DESC, totalSpecimensDocumented DESC
      `);
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: results,
    });
  } catch (err) {
    console.error('Reports generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate reports: ' + err.message });
  }
};

exports.exportReportCsv = async (req, res) => {
  try {
    const { report } = req.params;
    let data = [];
    let filename = `biodiversity_${report}_report.csv`;

    switch (report) {
      case 'species-status':
        data = await db.query(`
          SELECT 
            Conservation_Status AS "Conservation Status",
            COUNT(*) AS "Total Species",
            SUM(Population_Estimate) AS "Total Population",
            ROUND(AVG(Population_Estimate), 1) AS "Average Population"
          FROM Species
          GROUP BY Conservation_Status
        `);
        break;

      case 'habitats':
        data = await db.query(`
          SELECT 
            h.Habitat_Name AS "Habitat Name",
            h.Habitat_Type AS "Type",
            h.Climate AS "Climate",
            h.Area AS "Area (Sq Km)",
            h.Protection_Status AS "Protection Status",
            COUNT(sh.Species_ID) AS "Species Count"
          FROM Habitat h
          LEFT JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
          GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Climate, h.Area, h.Protection_Status
        `);
        break;

      case 'threats':
        data = await db.query(`
          SELECT 
            t.Threat_Name AS "Threat Name",
            t.Threat_Type AS "Threat Type",
            t.Severity AS "Severity",
            COUNT(st.Species_ID) AS "Affected Species Count"
          FROM Threat t
          LEFT JOIN Species_Threat st ON t.Threat_ID = st.Threat_ID
          GROUP BY t.Threat_ID, t.Threat_Name, t.Threat_Type, t.Severity
        `);
        break;

      case 'observations':
        data = await db.query(`
          SELECT 
            so.Observation_ID AS "ID",
            s.Common_Name AS "Species",
            s.Scientific_Name AS "Scientific Name",
            l.Location_Name AS "Location",
            l.State AS "State",
            r.Name AS "Researcher",
            so.Observation_Date AS "Date",
            so.Population_Count AS "Count",
            so.Observation_Method AS "Method"
          FROM Species_Observation so
          JOIN Species s ON so.Species_ID = s.Species_ID
          JOIN Location l ON so.Location_ID = l.Location_ID
          JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
        `);
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report export type' });
    }

    if (!data || data.length === 0) {
      return res.status(404).send('No data available for export.');
    }

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(fieldName => {
          const val = row[fieldName] !== null && row[fieldName] !== undefined ? String(row[fieldName]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
