const express = require('express');
const router = express.Router();
const viagemController = require('../controllers/viagemController');

router.get('/', viagemController.listar);
router.post('/', viagemController.agendar);

module.exports = router;