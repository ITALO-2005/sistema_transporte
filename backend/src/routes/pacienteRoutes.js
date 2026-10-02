const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.post('/', pacienteController.cadastrar);
router.get('/', pacienteController.listar);

module.exports = router;