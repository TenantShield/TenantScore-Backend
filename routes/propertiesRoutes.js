const express = require('express');
const router = express.Router();
const propertiesController = require('../controllers/propertiesController');
const { authenticateUser } = require('../middleware/authMiddleware'); // Ensure user is authenticated
const { checkLandlordRole } = require('../middleware/roleMiddleware'); // Ensure only landlords can modify properties

router.post('/', authenticateUser, checkLandlordRole, propertiesController.createProperty);
router.get('/', authenticateUser, propertiesController.getAllProperties);
router.get('/:id', authenticateUser, propertiesController.getPropertyById);
router.put('/:id', authenticateUser, checkLandlordRole, propertiesController.updateProperty);
router.delete('/:id', authenticateUser, checkLandlordRole, propertiesController.deleteProperty);

module.exports = router;
