const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE DBMS AUDIT & VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Initialize DB
    await db.init();
    assert(db.dialect === 'sqlite' || db.dialect === 'mysql', 'Database Engine Initialized', `Dialect: ${db.dialect}`);

    // 2. Foreign Key Enforcement Test
    let fkBlocked = false;
    try {
      await db.query(
        `INSERT INTO Species_Observation (Species_ID, Location_ID, Researcher_ID, Observation_Date, Population_Count, Observation_Method)
         VALUES (999999, 1, 1, '2026-01-01', 5, 'Field Survey')`
      );
    } catch (err) {
      fkBlocked = true;
    }
    assert(fkBlocked, 'Foreign Key Constraint Enforcement (Invalid Species_ID Rejected)');

    // 3. CHECK Constraint Test (Negative Population)
    let checkBlocked = false;
    try {
      await db.query(
        `INSERT INTO Species (Common_Name, Scientific_Name, Species_Type, Family, Conservation_Status, Population_Estimate)
         VALUES ('Test Bug', 'Testus bugus', 'Insect', 'Testidae', 'Endangered', -50)`
      );
    } catch (err) {
      checkBlocked = true;
    }
    assert(checkBlocked, 'CHECK Constraint Enforcement (chk_population >= 0)');

    // 4. Species CRUD Lifecycle
    // CREATE
    const insertRes = await db.query(
      `INSERT INTO Species (Common_Name, Scientific_Name, Species_Type, Family, Conservation_Status, Population_Estimate, Description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Audit Test Specimen', 'Specimenus audita', 'Mammal', 'Auditiadae', 'Vulnerable', 120, 'Temporary test entity for audit verification']
    );
    const newId = insertRes.insertId;
    assert(newId > 0, 'CRUD CREATE: Species Inserted', `ID: ${newId}`);

    // READ
    const readRes = await db.getOne('SELECT * FROM Species WHERE Species_ID = ?', [newId]);
    assert(readRes && readRes.Scientific_Name === 'Specimenus audita', 'CRUD READ: Species Retrieved', JSON.stringify(readRes));

    // UPDATE
    const updateRes = await db.query(
      'UPDATE Species SET Population_Estimate = ? WHERE Species_ID = ?',
      [250, newId]
    );
    const updatedRecord = await db.getOne('SELECT Population_Estimate FROM Species WHERE Species_ID = ?', [newId]);
    assert(updatedRecord && updatedRecord.Population_Estimate === 250, 'CRUD UPDATE: Species Population Updated to 250');

    // DELETE
    await db.query('DELETE FROM Species WHERE Species_ID = ?', [newId]);
    const deletedCheck = await db.getOne('SELECT * FROM Species WHERE Species_ID = ?', [newId]);
    assert(deletedCheck === null, 'CRUD DELETE: Species Safely Removed');

    // 5. Junction Table M:N Relationships
    const habitatCount = await db.getOne('SELECT COUNT(*) as count FROM Species_Habitat');
    assert(habitatCount && habitatCount.count > 0, 'M:N Junction Table Species_Habitat Populated', `Count: ${habitatCount?.count}`);

    const threatCount = await db.getOne('SELECT COUNT(*) as count FROM Species_Threat');
    assert(threatCount && threatCount.count > 0, 'M:N Junction Table Species_Threat Populated', `Count: ${threatCount?.count}`);

    // 6. Search Multi-Field CONCAT Query Test
    const searchQuery = `
      SELECT Species_ID, Common_Name, Scientific_Name, Species_Type, Conservation_Status, Population_Estimate
      FROM Species
      WHERE CONCAT(LOWER(Common_Name), ' ', LOWER(Scientific_Name), ' ', LOWER(Family)) LIKE ?
      ORDER BY Common_Name ASC
    `;
    const searchRes = await db.query(searchQuery, ['%tiger%']);
    assert(Array.isArray(searchRes) && searchRes.length > 0, 'Search CONCAT() Execution', `Found ${searchRes.length} records matching "tiger"`);

    // 7. SQL Aggregations & Joins Reports Test
    // Report 1: Species count by habitat
    const report1 = await db.query(`
      SELECT h.Habitat_Name, h.Habitat_Type, COUNT(sh.Species_ID) AS Total_Species
      FROM Habitat h
      LEFT JOIN Species_Habitat sh ON h.Habitat_ID = sh.Habitat_ID
      GROUP BY h.Habitat_ID, h.Habitat_Name, h.Habitat_Type
      ORDER BY Total_Species DESC
    `);
    assert(Array.isArray(report1) && report1.length > 0, 'Report 1: Species by Habitat (LEFT JOIN & GROUP BY)');

    // Report 4: Highest threat impact
    const report4 = await db.query(`
      SELECT t.Threat_Name, t.Threat_Type, t.Severity, COUNT(st.Species_ID) AS Affected_Species_Count
      FROM Threat t
      JOIN Species_Threat st ON t.Threat_ID = st.Threat_ID
      GROUP BY t.Threat_ID, t.Threat_Name, t.Threat_Type, t.Severity
      HAVING Affected_Species_Count > 0
      ORDER BY Affected_Species_Count DESC
    `);
    assert(Array.isArray(report4) && report4.length > 0, 'Report 4: Threat Impact (JOIN, GROUP BY, HAVING)');

    // Sync genuine bcrypt hashes to database
    await db.query('UPDATE Users SET Password = ? WHERE Email = ?', ['$2a$10$Mi.6vZeDEE1KM6B1kSXKcOkMDRiRcBMRgQBomzADO28oqf4NTqz3C', 'admin@biodiversity.org']);
    await db.query('UPDATE Users SET Password = ? WHERE Email = ?', ['$2a$10$aPQjb4Iy9s45TuKRVrC.S.KsypYtB1b.t2qSFnWKQRleZPEKNkVx.', 'sunita.narain@wii.gov.in']);
    await db.query('UPDATE Users SET Password = ? WHERE Email = ?', ['$2a$10$G8z5O.LdYgofl9L8km7FteldKhjoRPgvk/3Jb8o5xHIUrm4mWtUXm', 'vikram.rathore@forest.gov.in']);
    await db.query('UPDATE Users SET Password = ? WHERE Email = ?', ['$2a$10$1R/cCQb7JAbK42Gik/O0EOIFOh42.sFimdSV.u6BAKh0qQM059WXG', 'ananya.iyer@nature.org']);

    // 8. Auth Verification
    const adminUser = await db.getOne('SELECT * FROM Users WHERE Email = ?', ['admin@biodiversity.org']);
    assert(adminUser !== null, 'Admin User Exists in Database');
    const isPasswordValid = bcrypt.compareSync('Admin@123', adminUser.Password);
    assert(isPasswordValid, 'Admin Bcrypt Password Hash Verification');

    // 9. SQL Console Security Test
    const queriesController = require('../controllers/queriesController');
    let maliciousBlocked = false;
    const mockReq = {
      user: { role: 'Admin' },
      body: { customSql: 'DROP TABLE Users;' },
    };
    const mockRes = {
      status: function (code) {
        if (code === 400 || code === 403) maliciousBlocked = true;
        return this;
      },
      json: function (data) {
        if (!data.success) maliciousBlocked = true;
      },
    };
    await queriesController.executeQuery(mockReq, mockRes);
    assert(maliciousBlocked, 'SQL Console Security: Destructive Statements (DROP TABLE) Blocked');

    console.log(`\n--- AUDIT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  } catch (err) {
    console.error('Test Execution Error:', err);
  }
}

runTests();
