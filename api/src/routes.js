const express = require('express')
const routes = express.Router()

const caixa = require('./controller/controlecaixa')
const clientes = require('./controller/ctclientes')
const produtos = require('./controller/ctprodutos')
const proposta = require('./controller/ctpropostas')

routes.get('/', function (req, res) {
    res.send('API de Fluxo de Caixa')

})

routes.get('/caixa', caixa.read)
routes.post('/caixa', caixa.create)
routes.put('/caixa/:id', caixa.update)
routes.delete('/caixa/:id', caixa.remove)

routes.get('/clientes', clientes.read)
routes.post('/clientes', clientes.create)
routes.put('/clientes/:id', clientes.update)
routes.delete('/clientes/:id', clientes.remove)

routes.get('/produtos', produtos.read)
routes.post('/produtos', produtos.create)
routes.put('/produtos/:id', produtos.update)
routes.delete('/produtos/:id', produtos.remove)

routes.get('/proposta', proposta.read)
routes.post('/proposta', proposta.create)
routes.put('/proposta/:id', proposta.update)
routes.delete('/proposta/:id', proposta.remove)

module.exports = routes