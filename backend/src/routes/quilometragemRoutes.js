const express = require('express');
const router = express.Router();
const quilometragemController = require('../controllers/quilometragemController');

router.get('/', quilometragemController.listar);
router.post('/:viagemId/inicial', quilometragemController.registrarInicial);

module.exports = router;