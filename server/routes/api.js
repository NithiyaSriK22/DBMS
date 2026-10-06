const express = require('express');
const router = express.Router();

const { verifyToken, authorizeRoles } = require('../middleware/auth');

const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const speciesController = require('../controllers/speciesController');
const habitatController = require('../controllers/habitatController');
const locationController = require('../controllers/locationController');
const observationController = require('../controllers/observationController');
const researcherController = require('../controllers/researcherController');
const threatController = require('../controllers/threatController');
const conservationController = require('../controllers/conservationController');
const reportsController = require('../controllers/reportsController');
const searchController = require('../controllers/searchController');
const queriesController = require('../controllers/queriesController');
const userController = require('../controllers/userController');

// 1. AUTHENTICATION ROUTES (Public & Protected)
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', verifyToken, authController.getMe);
router.put('/auth/profile', verifyToken, authController.updateProfile);
router.get('/auth/demo-users', authController.getDemoUsers);

// 2. DASHBOARD ROUTES (All Authenticated Roles)
router.get('/dashboard/stats', verifyToken, dashboardController.getDashboardStats);

// 3. SPECIES MANAGEMENT ROUTES
router.get('/species', verifyToken, speciesController.getAllSpecies);
router.get('/species/:id', verifyToken, speciesController.getSpeciesById);
router.post('/species', verifyToken, authorizeRoles('Admin', 'Researcher'), speciesController.createSpecies);
router.put('/species/:id', verifyToken, authorizeRoles('Admin', 'Researcher'), speciesController.updateSpecies);
router.delete('/species/:id', verifyToken, authorizeRoles('Admin'), speciesController.deleteSpecies);

// 4. HABITAT MANAGEMENT ROUTES
router.get('/habitats', verifyToken, habitatController.getAllHabitats);
router.get('/habitats/:id', verifyToken, habitatController.getHabitatById);
router.post('/habitats', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), habitatController.createHabitat);
router.put('/habitats/:id', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), habitatController.updateHabitat);
router.delete('/habitats/:id', verifyToken, authorizeRoles('Admin'), habitatController.deleteHabitat);

// 5. LOCATION MANAGEMENT ROUTES
router.get('/locations', verifyToken, locationController.getAllLocations);
router.get('/locations/:id', verifyToken, locationController.getLocationById);
router.post('/locations', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), locationController.createLocation);
router.put('/locations/:id', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), locationController.updateLocation);
router.delete('/locations/:id', verifyToken, authorizeRoles('Admin'), locationController.deleteLocation);

// 6. SPECIES OBSERVATION ROUTES
router.get('/observations', verifyToken, observationController.getAllObservations);
router.get('/observations/:id', verifyToken, observationController.getObservationById);
router.post('/observations', verifyToken, authorizeRoles('Admin', 'Researcher'), observationController.createObservation);
router.put('/observations/:id', verifyToken, authorizeRoles('Admin', 'Researcher'), observationController.updateObservation);
router.delete('/observations/:id', verifyToken, authorizeRoles('Admin', 'Researcher'), observationController.deleteObservation);

// 7. RESEARCHER ROUTES
router.get('/researchers', verifyToken, researcherController.getAllResearchers);
router.get('/researchers/:id', verifyToken, researcherController.getResearcherById);
router.post('/researchers', verifyToken, authorizeRoles('Admin'), researcherController.createResearcher);
router.put('/researchers/:id', verifyToken, authorizeRoles('Admin'), researcherController.updateResearcher);
router.delete('/researchers/:id', verifyToken, authorizeRoles('Admin'), researcherController.deleteResearcher);

// 8. THREAT MANAGEMENT ROUTES
router.get('/threats', verifyToken, threatController.getAllThreats);
router.get('/threats/:id', verifyToken, threatController.getThreatById);
router.post('/threats', verifyToken, authorizeRoles('Admin', 'Researcher'), threatController.createThreat);
router.put('/threats/:id', verifyToken, authorizeRoles('Admin', 'Researcher'), threatController.updateThreat);
router.delete('/threats/:id', verifyToken, authorizeRoles('Admin'), threatController.deleteThreat);
router.post('/threats/link', verifyToken, authorizeRoles('Admin', 'Researcher'), threatController.linkSpeciesThreat);
router.delete('/threats/unlink/:speciesId/:threatId', verifyToken, authorizeRoles('Admin', 'Researcher'), threatController.unlinkSpeciesThreat);

// 9. CONSERVATION PROGRAMS & ACTIVITIES
router.get('/conservation-programs', verifyToken, conservationController.getAllPrograms);
router.get('/conservation-programs/:id', verifyToken, conservationController.getProgramById);
router.post('/conservation-programs', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), conservationController.createProgram);
router.put('/conservation-programs/:id', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), conservationController.updateProgram);
router.delete('/conservation-programs/:id', verifyToken, authorizeRoles('Admin'), conservationController.deleteProgram);

router.post('/conservation-activities', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), conservationController.createActivity);
router.delete('/conservation-activities/:id', verifyToken, authorizeRoles('Admin', 'Conservation Officer'), conservationController.deleteActivity);

// 10. REPORTS & ANALYTICS
router.get('/reports', verifyToken, reportsController.getReports);
router.get('/reports/export/:report', verifyToken, reportsController.exportReportCsv);

// 11. GLOBAL SEARCH
router.get('/search', verifyToken, searchController.globalSearch);

// 12. DBMS VIVA & SQL CONSOLE
router.get('/queries/list', verifyToken, queriesController.getQueriesList);
router.post('/queries/execute', verifyToken, queriesController.executeQuery);

// 13. USER MANAGEMENT (Admin Only)
router.get('/users', verifyToken, authorizeRoles('Admin'), userController.getAllUsers);
router.put('/users/:id/role', verifyToken, authorizeRoles('Admin'), userController.updateUserRole);
router.delete('/users/:id', verifyToken, authorizeRoles('Admin'), userController.deleteUser);

module.exports = router;
