const express = require('express');

const router = express.Router();

const caixa = require('./controllers/caixa.js');
const cliente = require('./controllers/cliente.js')

router.get('/', (req, res) => { return res.json("Server Rodando na Porta") });
router.get('/caixa', caixa.read);
router.post('/caixa', caixa.create);
router.put('/caixa', caixa.update);
router.delete('/caixa/:id', caixa.apagar);

router.get('/cliente', cliente.read);
router.post('/cliente', cliente.create);
router.delete('/cliente/:id', cliente.apagar);
router.put('/cliente', cliente.update);

module.exports = router;