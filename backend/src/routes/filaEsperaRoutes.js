const express = require('express');
const router = express.Router();
const filaEsperaController = require('../controllers/filaEsperaController');

router.get('/', filaEsperaController.listar);
router.post('/:id/agendar', filaEsperaController.agendar);
router.delete('/:id', filaEsperaController.remover);

module.exports = router;
