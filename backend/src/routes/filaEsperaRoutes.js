const express = require('express');
const router = express.Router();
const filaEsperaController = require('../controllers/filaEsperaController');

router.get('/', filaEsperaController.listar);
router.delete('/:id', filaEsperaController.remover);

module.exports = router;