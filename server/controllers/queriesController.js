const db = require('../config/db');

const VIVA_QUERIES = [
  {
    id: 1,
    title: 'Query 1: Endangered & Critically Endangered Species',
    concept: 'Filtering (WHERE, IN), Sorting (ORDER BY)',
    description: 'Retrieves all species flagged as Endangered or Critically Endangered, sorted by severity and population.',
    sql: `SELECT 
    Species_ID, Common_Name, Scientific_Name, Species_Type, Family, Conservation_Status, Population_Estimate
FROM Species
WHERE Conservation_Status IN ('Endangered', 'Critically Endangered')
ORDER BY Conservation_Status DESC, Population_Estimate ASC;`,
  },
  {
    id: 2,
    title: 'Query 2: Species in Specific Habitat (Western Ghats)',
    concept: 'Many-to-Many Junction Join (Species -> Species_Habitat -> Habitat)',
    description: 'Finds all species inhabiting the Western Ghats along with their local habitat population estimate.',
    sql: `SELECT 
    s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Conservation_Status,
    h.Habitat_Name, sh.Population_Estimate AS Local_Habitat_Population, sh.Recorded_Date
FROM Species s
JOIN Species_Habitat sh ON s.Species_ID = sh.Species_ID
JOIN Habitat h ON sh.Habitat_ID = h.Habitat_ID
WHERE h.Habitat_Name LIKE '%Western Ghats%'
ORDER BY s.Common_Name ASC;`,
  },
  {
    id: 3,
    title: 'Query 3: Species Count & Population by Habitat',
    concept: 'Aggregation (COUNT, SUM, AVG), GROUP BY, HAVING',
    description: 'Calculates the total species count and aggregate population per habitat with HAVING filter.',
    sql: `SELECT 
    h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Protection_Status,
    COUNT(sh.Species_ID) AS Total_Species_Count,
    COALESCE(SUM(sh.Population_Estimate), 0) AS Total_Recorded_Population,
    ROUND(AVG(sh.Population_Estimate), 2) AS Avg_Species_Population
FROM Habitat h
LEFT JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Protection_Status
HAVING COUNT(sh.Species_ID) > 0
ORDER BY Total_Species_Count DESC;`,
  },
  {
    id: 4,
    title: 'Query 4: Most Frequently Observed Species in the Field',
    concept: 'Multi-table Join, COUNT(), SUM(), MAX()',
    description: 'Ranks species by the number of times they were logged across all field monitoring surveys.',
    sql: `SELECT 
    s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Conservation_Status,
    COUNT(o.Observation_ID) AS Total_Observations,
    SUM(o.Population_Count) AS Total_Observed_Individuals,
    MAX(o.Observation_Date) AS Latest_Observation_Date
FROM Species s
JOIN Species_Observation o ON s.Species_ID = o.Species_ID
GROUP BY s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Conservation_Status
ORDER BY Total_Observations DESC, Total_Observed_Individuals DESC;`,
  },
  {
    id: 5,
    title: 'Query 5: Species Affected by Critical Threats',
    concept: 'Relational M:N Join (Species -> Species_Threat -> Threat), OR Predicate',
    description: 'Identifies all species facing Critical severity threats with impact details.',
    sql: `SELECT 
    s.Species_ID, s.Common_Name, s.Scientific_Name, s.Conservation_Status,
    t.Threat_Name, t.Threat_Type, t.Severity, st.Impact_Level, st.Description AS Threat_Impact_Details
FROM Species s
JOIN Species_Threat st ON s.Species_ID = st.Species_ID
JOIN Threat t ON st.Threat_ID = t.Threat_ID
WHERE t.Severity = 'Critical' OR st.Impact_Level = 'Critical'
ORDER BY s.Common_Name ASC;`,
  },
  {
    id: 6,
    title: 'Query 6: Population Summary Statistics by Species Type',
    concept: 'Aggregate Metrics: COUNT, SUM, AVG, MIN, MAX',
    description: 'Summarizes biodiversity population statistics grouped across biological taxa classes.',
    sql: `SELECT 
    Species_Type,
    COUNT(*) AS Total_Species_Count,
    SUM(Population_Estimate) AS Total_Cumulative_Population,
    ROUND(AVG(Population_Estimate), 2) AS Average_Population,
    MIN(Population_Estimate) AS Smallest_Population,
    MAX(Population_Estimate) AS Largest_Population
FROM Species
GROUP BY Species_Type
ORDER BY Total_Species_Count DESC;`,
  },
  {
    id: 7,
    title: 'Query 7: Field Observations Conducted by Each Researcher',
    concept: 'LEFT JOIN, Aggregation with COALESCE',
    description: 'Analyzes researcher productivity and specimen counts documented during scientific surveys.',
    sql: `SELECT 
    r.Researcher_ID, r.Name AS Researcher_Name, r.Organization, r.Specialization, r.Experience_Years,
    COUNT(o.Observation_ID) AS Total_Observations_Conducted,
    COALESCE(SUM(o.Population_Count), 0) AS Total_Specimens_Recorded
FROM Researchers r
LEFT JOIN Species_Observation o ON r.Researcher_ID = o.Researcher_ID
GROUP BY r.Researcher_ID, r.Name, r.Organization, r.Specialization, r.Experience_Years
ORDER BY Total_Observations_Conducted DESC;`,
  },
  {
    id: 8,
    title: 'Query 8: Active Conservation Programs & Executed Activities',
    concept: '3-Table Join (Program -> Location & Program -> Activity), COUNT()',
    description: 'Evaluates active state conservation initiatives with budget allocation and activities.',
    sql: `SELECT 
    cp.Program_ID, cp.Program_Name, cp.Budget, cp.Status, cp.Start_Date, cp.End_Date,
    l.Location_Name, l.State,
    COUNT(ca.Activity_ID) AS Completed_Activities_Count
FROM Conservation_Program cp
JOIN Location l ON cp.Location_ID = l.Location_ID
LEFT JOIN Conservation_Activity ca ON cp.Program_ID = ca.Program_ID
WHERE cp.Status = 'Active'
GROUP BY cp.Program_ID, cp.Program_Name, cp.Budget, cp.Status, cp.Start_Date, cp.End_Date, l.Location_Name, l.State
ORDER BY cp.Budget DESC;`,
  },
  {
    id: 9,
    title: 'Query 9: Habitats with Highest Endangered Species Count',
    concept: 'Complex 3-Table Join, GROUP BY, In-Clause Filter',
    description: 'Finds top protected areas harboring vulnerable and endangered wildlife.',
    sql: `SELECT 
    h.Habitat_ID, h.Habitat_Name, h.Habitat_Type,
    COUNT(s.Species_ID) AS Endangered_Species_Count
FROM Habitat h
JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
JOIN Species s ON sh.Species_ID = s.Species_ID
WHERE s.Conservation_Status IN ('Endangered', 'Critically Endangered')
GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type
ORDER BY Endangered_Species_Count DESC;`,
  },
  {
    id: 10,
    title: 'Query 10: Multi-Relational Species Comprehensive Summary',
    concept: 'Multiple LEFT JOINs, COUNT(DISTINCT col)',
    description: 'Demonstrates multi-table cross-aggregation for an individual species profile in 3NF.',
    sql: `SELECT 
    s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Family, s.Conservation_Status, s.Population_Estimate,
    COUNT(DISTINCT sh.Habitat_ID) AS Linked_Habitats_Count,
    COUNT(DISTINCT st.Threat_ID) AS Associated_Threats_Count,
    COUNT(DISTINCT so.Observation_ID) AS Recorded_Observations_Count
FROM Species s
LEFT JOIN Species_Habitat sh ON s.Species_ID = sh.Species_ID
LEFT JOIN Species_Threat st ON s.Species_ID = st.Species_ID
LEFT JOIN Species_Observation so ON s.Species_ID = so.Species_ID
WHERE s.Species_ID = 1
GROUP BY s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Family, s.Conservation_Status, s.Population_Estimate;`,
  },
  {
    id: 11,
    title: 'Query 11: Species with Population Above Overall Average',
    concept: 'Scalar Subquery in WHERE Clause',
    description: 'Demonstrates a scalar subquery calculating the global average population and filtering species exceeding it.',
    sql: `SELECT 
    Species_ID, Common_Name, Scientific_Name, Species_Type, Conservation_Status, Population_Estimate
FROM Species
WHERE Population_Estimate > (SELECT AVG(Population_Estimate) FROM Species)
ORDER BY Population_Estimate DESC;`,
  },
  {
    id: 12,
    title: 'Query 12: Researchers with Surveys Exceeding Average Threshold',
    concept: 'Subquery in HAVING Clause & Derived Table',
    description: 'Finds researchers whose total field survey count exceeds the average surveys conducted per researcher.',
    sql: `SELECT 
    r.Researcher_ID, r.Name AS Researcher_Name, r.Organization, r.Specialization,
    COUNT(so.Observation_ID) AS Total_Surveys
FROM Researchers r
JOIN Species_Observation so ON r.Researcher_ID = so.Researcher_ID
GROUP BY r.Researcher_ID, r.Name, r.Organization, r.Specialization
HAVING COUNT(so.Observation_ID) > (
    SELECT AVG(survey_count) FROM (
        SELECT COUNT(Observation_ID) AS survey_count FROM Species_Observation GROUP BY Researcher_ID
    ) AS avg_table
)
ORDER BY Total_Surveys DESC;`,
  },
  {
    id: 13,
    title: 'Query 13: Habitats Containing Multiple Recorded Species',
    concept: 'Subquery with IN & Aggregation Filter',
    description: 'Retrieves all habitats associated with at least 3 distinct recorded species in the junction table.',
    sql: `SELECT 
    Habitat_ID, Habitat_Name, Habitat_Type, Area, Protection_Status
FROM Habitat
WHERE Habitat_ID IN (
    SELECT Habitat_ID
    FROM Species_Habitat
    GROUP BY Habitat_ID
    HAVING COUNT(DISTINCT Species_ID) >= 3
)
ORDER BY Area DESC;`,
  },
  {
    id: 14,
    title: 'Query 14: Species Facing Critical Severity Threats',
    concept: 'Multi-Row Subquery with IN Predicate',
    description: 'Finds species facing Critical threats using a subquery on the Species_Threat junction table.',
    sql: `SELECT 
    Species_ID, Common_Name, Scientific_Name, Conservation_Status, Population_Estimate
FROM Species
WHERE Species_ID IN (
    SELECT st.Species_ID
    FROM Species_Threat st
    JOIN Threat t ON st.Threat_ID = t.Threat_ID
    WHERE t.Severity = 'Critical'
)
ORDER BY Population_Estimate ASC;`,
  },
  {
    id: 15,
    title: 'Query 15: Conservation Programs with Budget Above Average',
    concept: 'Scalar Subquery with Aggregate Function AVG()',
    description: 'Filters programs whose allocated budget is higher than the mean program funding across all initiatives.',
    sql: `SELECT 
    Program_ID, Program_Name, Budget, Status, Start_Date, End_Date
FROM Conservation_Program
WHERE Budget > (SELECT AVG(Budget) FROM Conservation_Program)
ORDER BY Budget DESC;`,
  },
  {
    id: 16,
    title: 'Query 16: Habitats with Zero Critical Threats Recorded',
    concept: 'Correlated Subquery with NOT EXISTS Predicate',
    description: 'Evaluates habitats that currently have no species linked to Critical severity extinction pressures.',
    sql: `SELECT 
    h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Area, h.Protection_Status
FROM Habitat h
WHERE NOT EXISTS (
    SELECT 1 
    FROM Species_Habitat sh
    JOIN Species_Threat st ON sh.Species_ID = st.Species_ID
    JOIN Threat t ON st.Threat_ID = t.Threat_ID
    WHERE sh.Habitat_ID = h.Habitat_ID AND t.Severity = 'Critical'
)
ORDER BY h.Area DESC;`,
  },
];

exports.getQueriesList = (req, res) => {
  res.json({
    success: true,
    count: VIVA_QUERIES.length,
    queries: VIVA_QUERIES,
  });
};

exports.executeQuery = async (req, res) => {
  try {
    const { queryId, customSql } = req.body;
    let sqlToRun = '';
    let queryMeta = null;

    if (queryId) {
      const found = VIVA_QUERIES.find(q => q.id === parseInt(queryId));
      if (!found) {
        return res.status(404).json({ success: false, message: 'Predefined query not found.' });
      }
      sqlToRun = found.sql;
      queryMeta = found;
    } else if (customSql) {
      sqlToRun = customSql.trim();
      // Educational SQL Console: Strictly enforce read-only statements (SELECT, EXPLAIN, WITH)
      const isReadOnly = /^(SELECT|EXPLAIN|WITH)\b/i.test(sqlToRun);
      const isDestructive = /\b(DROP|TRUNCATE|ALTER|DELETE|UPDATE|INSERT)\b/i.test(sqlToRun);
      if (!isReadOnly || isDestructive) {
        return res.status(403).json({ success: false, message: 'Educational SQL console is strictly restricted to read-only analytical queries (SELECT, EXPLAIN, WITH). Destructive operations are prohibited.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Query ID or SQL string required.' });
    }

    const startTime = process.hrtime();
    const rows = await db.query(sqlToRun);
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    // Redact password hashes if Users table is queried
    if (Array.isArray(rows)) {
      rows.forEach(r => {
        if (r && typeof r === 'object' && 'Password' in r) {
          r.Password = '[PROTECTED_HASH]';
        }
      });
    }

    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    res.json({
      success: true,
      meta: queryMeta,
      sql: sqlToRun,
      executionTimeMs: `${executionTimeMs} ms`,
      rowCount: rows.length,
      columns,
      data: rows,
    });
  } catch (err) {
    console.error('SQL Execution error:', err);
    res.status(500).json({ success: false, message: 'SQL Error: ' + err.message });
  }
};
