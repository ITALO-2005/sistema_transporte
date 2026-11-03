const express = require('express');
const router = express.Router();
const abastecimentoController = require('../controllers/abastecimentoController');

router.get('/saidas', abastecimentoController.saidas);
router.get('/', abastecimentoController.listar);
router.post('/', abastecimentoController.registrar);

module.exports = router;
