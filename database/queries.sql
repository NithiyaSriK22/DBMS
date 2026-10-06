-- ============================================================================
-- BIODIVERSITY MANAGEMENT SYSTEM (BMS) - CORE DBMS SQL QUERIES (VIVA & EVALUATION)
-- Features: Joins (Inner, Left, Right), Aggregation (COUNT, SUM, AVG, MIN, MAX),
-- Grouping (GROUP BY, HAVING), Filtering (WHERE, LIKE, IN), Subqueries, Nested Joins
-- ============================================================================

-- Query 1: Find all Endangered and Critically Endangered species with their family and population
SELECT 
    Species_ID,
    Common_Name,
    Scientific_Name,
    Species_Type,
    Family,
    Conservation_Status,
    Population_Estimate
FROM Species
WHERE Conservation_Status IN ('Endangered', 'Critically Endangered')
ORDER BY Conservation_Status DESC, Population_Estimate ASC;

-- Query 2: Find species present in a specific habitat (e.g. 'Western Ghats Tropical Montane Rainforest')
SELECT 
    s.Species_ID,
    s.Common_Name,
    s.Scientific_Name,
    s.Species_Type,
    s.Conservation_Status,
    h.Habitat_Name,
    sh.Population_Estimate AS Local_Habitat_Population,
    sh.Recorded_Date
FROM Species s
JOIN Species_Habitat sh ON s.Species_ID = sh.Species_ID
JOIN Habitat h ON sh.Habitat_ID = h.Habitat_ID
WHERE h.Habitat_Name LIKE '%Western Ghats%'
ORDER BY s.Common_Name ASC;

-- Query 3: Find the number of species and total estimated population in each habitat
SELECT 
    h.Habitat_ID,
    h.Habitat_Name,
    h.Habitat_Type,
    h.Protection_Status,
    COUNT(sh.Species_ID) AS Total_Species_Count,
    COALESCE(SUM(sh.Population_Estimate), 0) AS Total_Recorded_Population,
    ROUND(AVG(sh.Population_Estimate), 2) AS Avg_Species_Population
FROM Habitat h
LEFT JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type, h.Protection_Status
HAVING COUNT(sh.Species_ID) > 0
ORDER BY Total_Species_Count DESC;

-- Query 4: Find the most frequently observed species and their total observed count
SELECT 
    s.Species_ID,
    s.Common_Name,
    s.Scientific_Name,
    s.Species_Type,
    s.Conservation_Status,
    COUNT(o.Observation_ID) AS Total_Observations,
    SUM(o.Population_Count) AS Total_Observed_Individuals,
    MAX(o.Observation_Date) AS Latest_Observation_Date
FROM Species s
JOIN Species_Observation o ON s.Species_ID = o.Species_ID
GROUP BY s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Conservation_Status
ORDER BY Total_Observations DESC, Total_Observed_Individuals DESC;

-- Query 5: Find species affected by Critical severity threats with threat descriptions
SELECT 
    s.Species_ID,
    s.Common_Name,
    s.Scientific_Name,
    s.Conservation_Status,
    t.Threat_Name,
    t.Threat_Type,
    t.Severity,
    st.Impact_Level,
    st.Description AS Threat_Impact_Details
FROM Species s
JOIN Species_Threat st ON s.Species_ID = st.Species_ID
JOIN Threat t ON st.Threat_ID = t.Threat_ID
WHERE t.Severity = 'Critical' OR st.Impact_Level = 'Critical'
ORDER BY s.Common_Name ASC;

-- Query 6: Find average and maximum population count by species type
SELECT 
    Species_Type,
    COUNT(*) AS Total_Species_Count,
    SUM(Population_Estimate) AS Total_Cumulative_Population,
    ROUND(AVG(Population_Estimate), 2) AS Average_Population,
    MIN(Population_Estimate) AS Smallest_Population,
    MAX(Population_Estimate) AS Largest_Population
FROM Species
GROUP BY Species_Type
ORDER BY Total_Species_Count DESC;

-- Query 7: Find the number of field observations made by each researcher along with their specialization
SELECT 
    r.Researcher_ID,
    r.Name AS Researcher_Name,
    r.Organization,
    r.Specialization,
    r.Experience_Years,
    COUNT(o.Observation_ID) AS Total_Observations_Conducted,
    COALESCE(SUM(o.Population_Count), 0) AS Total_Specimens_Recorded
FROM Researchers r
LEFT JOIN Species_Observation o ON r.Researcher_ID = o.Researcher_ID
GROUP BY r.Researcher_ID, r.Name, r.Organization, r.Specialization, r.Experience_Years
ORDER BY Total_Observations_Conducted DESC;

-- Query 8: Find active conservation programs with their location, state, and associated activity count
SELECT 
    cp.Program_ID,
    cp.Program_Name,
    cp.Budget,
    cp.Status,
    cp.Start_Date,
    cp.End_Date,
    l.Location_Name,
    l.State,
    COUNT(ca.Activity_ID) AS Completed_Activities_Count
FROM Conservation_Program cp
JOIN Location l ON cp.Location_ID = l.Location_ID
LEFT JOIN Conservation_Activity ca ON cp.Program_ID = ca.Program_ID
WHERE cp.Status = 'Active'
GROUP BY cp.Program_ID, cp.Program_Name, cp.Budget, cp.Status, cp.Start_Date, cp.End_Date, l.Location_Name, l.State
ORDER BY cp.Budget DESC;

-- Query 9: Habitats containing the highest number of endangered or critically endangered species (Complex Join & Subquery)
SELECT 
    h.Habitat_ID,
    h.Habitat_Name,
    h.Habitat_Type,
    COUNT(s.Species_ID) AS Endangered_Species_Count,
    GROUP_CONCAT(s.Common_Name SEPARATOR ', ') AS Species_List
FROM Habitat h
JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
JOIN Species s ON sh.Species_ID = s.Species_ID
WHERE s.Conservation_Status IN ('Endangered', 'Critically Endangered')
GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type
ORDER BY Endangered_Species_Count DESC;

-- Query 10: Multi-table Comprehensive Species Profile Query (For Detailed Species Page)
SELECT 
    s.Species_ID,
    s.Common_Name,
    s.Scientific_Name,
    s.Species_Type,
    s.Family,
    s.Conservation_Status,
    s.Population_Estimate,
    COUNT(DISTINCT sh.Habitat_ID) AS Linked_Habitats_Count,
    COUNT(DISTINCT st.Threat_ID) AS Associated_Threats_Count,
    COUNT(DISTINCT so.Observation_ID) AS Recorded_Observations_Count
FROM Species s
LEFT JOIN Species_Habitat sh ON s.Species_ID = sh.Species_ID
LEFT JOIN Species_Threat st ON s.Species_ID = st.Species_ID
LEFT JOIN Species_Observation so ON s.Species_ID = so.Species_ID
WHERE s.Species_ID = 1
GROUP BY s.Species_ID, s.Common_Name, s.Scientific_Name, s.Species_Type, s.Family, s.Conservation_Status, s.Population_Estimate;
