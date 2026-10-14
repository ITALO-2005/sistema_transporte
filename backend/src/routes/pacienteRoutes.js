const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.post('/', pacienteController.cadastrar);
router.get('/', pacienteController.listar);
router.get('/:id', pacienteController.detalhar);
router.get('/:id/historico', pacienteController.historico);

module.exports = router;