const db = require('../config/db');

exports.getReports = async (req, res) => {
  try {
    const { reportType = 'all' } = req.query;
    const results = {};

    // REPORT 1: Species by Conservation Status (GROUP BY Conservation_Status)
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

    // REPORT 2: Species by Taxonomic Group (GROUP BY Species_Type)
    if (reportType === 'all' || reportType === 'taxa') {
      results.speciesByTaxa = await db.query(`
        SELECT 
          Species_Type AS taxonomicGroup,
          COUNT(*) AS totalSpecies,
          SUM(Population_Estimate) AS totalEstimatedPopulation,
          ROUND(AVG(Population_Estimate), 1) AS avgPopulation,
          MIN(Population_Estimate) AS minPopulation,
          MAX(Population_Estimate) AS maxPopulation
        FROM Species
        GROUP BY Species_Type
        ORDER BY totalSpecies DESC
      `);
    }

    // REPORT 3: Observations by Habitat (Joins between Habitat, Location, Observation)
    if (reportType === 'all' || reportType === 'habitat_observations') {
      results.observationsByHabitat = await db.query(`
        SELECT 
          h.Habitat_ID,
          h.Habitat_Name,
          h.Habitat_Type,
          h.Protection_Status,
          COUNT(so.Observation_ID) AS totalObservations,
          COALESCE(SUM(so.Population_Count), 0) AS totalSpecimensCount,
          COUNT(DISTINCT so.Species_ID) AS uniqueSpeciesObserved
        FROM Habitat h
        JOIN Location l ON h.Habitat_ID = l.Habitat_ID
        LEFT JOIN Species_Observation so ON l.Location_ID = so.Location_ID
        GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Protection_Status
        ORDER BY totalObservations DESC
      `);
    }

    // REPORT 4: Researcher Activity Summary (Observations and specimens recorded)
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

    // REPORT 5: Threats Associated with Species (Join Species, Species_Threat, Threat)
    if (reportType === 'all' || reportType === 'threats') {
      results.speciesThreats = await db.query(`
        SELECT 
          s.Species_ID,
          s.Common_Name,
          s.Scientific_Name,
          s.Conservation_Status,
          t.Threat_Name,
          t.Threat_Type,
          t.Severity,
          st.Impact_Level
        FROM Species s
        JOIN Species_Threat st ON s.Species_ID = st.Species_ID
        JOIN Threat t ON st.Threat_ID = t.Threat_ID
        ORDER BY 
          CASE t.Severity
            WHEN 'Critical' THEN 1
            WHEN 'High' THEN 2
            WHEN 'Medium' THEN 3
            ELSE 4
          END,
          s.Common_Name ASC
        LIMIT 25
      `);
    }

    // REPORT 6: Conservation Program Summary (GROUP BY Status, Budgets & Activities)
    if (reportType === 'all' || reportType === 'programs') {
      results.programSummary = await db.query(`
        SELECT 
          cp.Status AS programStatus,
          COUNT(DISTINCT cp.Program_ID) AS totalPrograms,
          SUM(cp.Budget) AS totalBudgetAllocated,
          ROUND(AVG(cp.Budget), 2) AS avgBudget,
          COUNT(ca.Activity_ID) AS totalExecutedActivities
        FROM Conservation_Program cp
        LEFT JOIN Conservation_Activity ca ON cp.Program_ID = ca.Program_ID
        GROUP BY cp.Status
        ORDER BY totalBudgetAllocated DESC
      `);
    }

    // REPORT 7: Recent Observations Log (Multi-table join across 4 relational entities)
    if (reportType === 'all' || reportType === 'recent_observations') {
      results.recentObservations = await db.query(`
        SELECT 
          so.Observation_ID,
          so.Observation_Date,
          s.Common_Name AS speciesName,
          s.Scientific_Name,
          s.Conservation_Status,
          h.Habitat_Name,
          l.Location_Name,
          l.State,
          r.Name AS researcherName,
          so.Population_Count,
          so.Observation_Method
        FROM Species_Observation so
        JOIN Species s ON so.Species_ID = s.Species_ID
        JOIN Location l ON so.Location_ID = l.Location_ID
        JOIN Habitat h ON l.Habitat_ID = h.Habitat_ID
        JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
        ORDER BY so.Observation_Date DESC, so.Observation_ID DESC
        LIMIT 20
      `);
    }

    // REPORT 8: Endangered & Threatened Species (Critically Endangered, Endangered, Vulnerable)
    if (reportType === 'all' || reportType === 'endangered') {
      results.endangeredSpecies = await db.query(`
        SELECT 
          s.Species_ID,
          s.Common_Name,
          s.Scientific_Name,
          s.Species_Type,
          s.Family,
          s.Conservation_Status,
          s.Population_Estimate
        FROM Species s
        WHERE s.Conservation_Status IN ('Critically Endangered', 'Endangered', 'Vulnerable')
        ORDER BY 
          CASE s.Conservation_Status
            WHEN 'Critically Endangered' THEN 1
            WHEN 'Endangered' THEN 2
            WHEN 'Vulnerable' THEN 3
            ELSE 4
          END,
          s.Population_Estimate ASC
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
    let filename = `bms_${report}_report.csv`;

    switch (report) {
      case 'species-status':
        data = await db.query(`
          SELECT 
            Conservation_Status AS "Conservation Status",
            COUNT(*) AS "Total Species",
            SUM(Population_Estimate) AS "Total Population",
            ROUND(AVG(Population_Estimate), 1) AS "Average Population",
            MIN(Population_Estimate) AS "Min Population",
            MAX(Population_Estimate) AS "Max Population"
          FROM Species
          GROUP BY Conservation_Status
        `);
        break;

      case 'species-taxa':
        data = await db.query(`
          SELECT 
            Species_Type AS "Taxonomic Group",
            COUNT(*) AS "Total Species",
            SUM(Population_Estimate) AS "Total Population",
            ROUND(AVG(Population_Estimate), 1) AS "Average Population"
          FROM Species
          GROUP BY Species_Type
        `);
        break;

      case 'observations-habitat':
        data = await db.query(`
          SELECT 
            h.Habitat_Name AS "Habitat",
            h.Habitat_Type AS "Type",
            COUNT(so.Observation_ID) AS "Total Surveys",
            COALESCE(SUM(so.Population_Count), 0) AS "Total Specimens Logged",
            COUNT(DISTINCT so.Species_ID) AS "Unique Species"
          FROM Habitat h
          JOIN Location l ON h.Habitat_ID = l.Habitat_ID
          LEFT JOIN Species_Observation so ON l.Location_ID = so.Location_ID
          GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type
        `);
        break;

      case 'researchers':
        data = await db.query(`
          SELECT 
            r.Name AS "Researcher Name",
            r.Organization AS "Organization",
            r.Specialization AS "Specialization",
            COUNT(so.Observation_ID) AS "Surveys Conducted",
            COALESCE(SUM(so.Population_Count), 0) AS "Specimens Documented",
            COUNT(DISTINCT so.Species_ID) AS "Distinct Species"
          FROM Researchers r
          LEFT JOIN Species_Observation so ON r.Researcher_ID = so.Researcher_ID
          GROUP BY r.Researcher_ID, r.Name, r.Organization, r.Specialization
        `);
        break;

      case 'threats':
        data = await db.query(`
          SELECT 
            s.Common_Name AS "Species",
            s.Scientific_Name AS "Scientific Name",
            s.Conservation_Status AS "Status",
            t.Threat_Name AS "Threat Name",
            t.Threat_Type AS "Threat Type",
            t.Severity AS "Severity",
            st.Impact_Level AS "Impact Level"
          FROM Species s
          JOIN Species_Threat st ON s.Species_ID = st.Species_ID
          JOIN Threat t ON st.Threat_ID = t.Threat_ID
        `);
        break;

      case 'programs':
        data = await db.query(`
          SELECT 
            cp.Status AS "Program Status",
            COUNT(DISTINCT cp.Program_ID) AS "Total Programs",
            SUM(cp.Budget) AS "Total Budget (INR)",
            ROUND(AVG(cp.Budget), 2) AS "Average Budget (INR)",
            COUNT(ca.Activity_ID) AS "Total Activities Executed"
          FROM Conservation_Program cp
          LEFT JOIN Conservation_Activity ca ON cp.Program_ID = ca.Program_ID
          GROUP BY cp.Status
        `);
        break;

      case 'recent-observations':
        data = await db.query(`
          SELECT 
            so.Observation_ID AS "Survey ID",
            so.Observation_Date AS "Date",
            s.Common_Name AS "Species",
            s.Scientific_Name AS "Scientific Name",
            h.Habitat_Name AS "Habitat",
            l.Location_Name AS "Location",
            l.State AS "State",
            r.Name AS "Researcher",
            so.Population_Count AS "Count",
            so.Observation_Method AS "Method"
          FROM Species_Observation so
          JOIN Species s ON so.Species_ID = s.Species_ID
          JOIN Location l ON so.Location_ID = l.Location_ID
          JOIN Habitat h ON l.Habitat_ID = h.Habitat_ID
          JOIN Researchers r ON so.Researcher_ID = r.Researcher_ID
        `);
        break;

      case 'endangered-species':
        data = await db.query(`
          SELECT 
            s.Common_Name AS "Common Name",
            s.Scientific_Name AS "Scientific Name",
            s.Species_Type AS "Class",
            s.Family AS "Family",
            s.Conservation_Status AS "IUCN Status",
            s.Population_Estimate AS "Population Estimate"
          FROM Species s
          WHERE s.Conservation_Status IN ('Critically Endangered', 'Endangered', 'Vulnerable')
          ORDER BY s.Population_Estimate ASC
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
