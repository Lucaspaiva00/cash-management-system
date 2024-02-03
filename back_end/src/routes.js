const express = require('express');

const router = express.Router();

const caixa = require('./controllers/caixa.js');

router.get('/', (req, res) => { return res.json("Server Rodando na Porta") });
router.get('/caixa', caixa.read);
router.post('/caixa', caixa.create);

module.exports = router;