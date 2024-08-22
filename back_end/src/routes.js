const express = require('express');

const router = express.Router();

const caixa = require('./controllers/caixa.js');
const cliente = require('./controllers/cliente.js')
const proposta = require('./controllers/proposta.js')
const produtos = require('./controllers/produtos.js')

router.get('/', (req, res) => { return res.json("Server Rodando na Porta") });
router.get('/caixa', caixa.read);
router.post('/caixa', caixa.create);
router.put('/caixa', caixa.update);
router.delete('/caixa/:id', caixa.apagar);

router.get('/cliente', cliente.read);
router.post('/cliente', cliente.create);
router.delete('/cliente/:id', cliente.apagar);
router.put('/cliente', cliente.update);

router.get('/proposta', proposta.read);
router.post('/proposta', proposta.create);
router.delete('/proposta/:id', proposta.apagar);
router.put('/proposta', proposta.update);

router.get('/produtos', produtos.read);
router.post('/produtos', produtos.create);
router.delete('/produtos/:id', produtos.apagar);
router.put('/produtos', produtos.update);



module.exports = router;