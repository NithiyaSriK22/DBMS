const db = require('../config/db');

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        query: '',
        results: {
          species: [],
          habitats: [],
          locations: [],
          researchers: [],
          threats: [],
        },
      });
    }

    const term = `%${q.trim()}%`;

    // 1. Search Species (Common Name, Scientific Name, Family, Type)
    const species = await db.query(`
      SELECT 
        Species_ID AS id,
        Common_Name AS title,
        Scientific_Name AS subtitle,
        Species_Type AS tag,
        Conservation_Status AS badge,
        'species' AS entityType
      FROM Species
      WHERE Common_Name LIKE ? OR Scientific_Name LIKE ? OR Family LIKE ? OR Species_Type LIKE ?
      LIMIT 6
    `, [term, term, term, term]);

    // 2. Search Habitats
    const habitats = await db.query(`
      SELECT 
        Habitat_ID AS id,
        Habitat_Name AS title,
        Habitat_Type AS subtitle,
        Climate AS tag,
        Protection_Status AS badge,
        'habitat' AS entityType
      FROM Habitat
      WHERE Habitat_Name LIKE ? OR Habitat_Type LIKE ? OR Climate LIKE ?
      LIMIT 6
    `, [term, term, term]);

    // 3. Search Locations
    const locations = await db.query(`
      SELECT 
        Location_ID AS id,
        Location_Name AS title,
        State || ', ' || Country AS subtitle,
        'Location' AS tag,
        'Active' AS badge,
        'location' AS entityType
      FROM Location
      WHERE Location_Name LIKE ? OR State LIKE ? OR Country LIKE ?
      LIMIT 6
    `, [term, term, term]);

    // 4. Search Researchers
    const researchers = await db.query(`
      SELECT 
        Researcher_ID AS id,
        Name AS title,
        Organization AS subtitle,
        Specialization AS tag,
        Experience_Years || ' yrs exp' AS badge,
        'researcher' AS entityType
      FROM Researchers
      WHERE Name LIKE ? OR Organization LIKE ? OR Specialization LIKE ? OR Email LIKE ?
      LIMIT 6
    `, [term, term, term, term]);

    // 5. Search Threats
    const threats = await db.query(`
      SELECT 
        Threat_ID AS id,
        Threat_Name AS title,
        Threat_Type AS subtitle,
        Severity AS tag,
        Severity AS badge,
        'threat' AS entityType
      FROM Threat
      WHERE Threat_Name LIKE ? OR Description LIKE ? OR Threat_Type LIKE ?
      LIMIT 6
    `, [term, term, term]);

    const totalMatches = species.length + habitats.length + locations.length + researchers.length + threats.length;

    res.json({
      success: true,
      query: q,
      totalMatches,
      results: {
        species,
        habitats,
        locations,
        researchers,
        threats,
      },
    });
  } catch (err) {
    console.error('Global search error:', err);
    res.status(500).json({ success: false, message: 'Search execution error: ' + err.message });
  }
};
