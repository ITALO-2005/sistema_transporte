const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');

router.post('/', veiculoController.cadastrar);
router.get('/', veiculoController.listar);

module.exports = router;