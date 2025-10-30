const express = require("express");
const routes = express.Router();

const caixa = require("./controller/controlecaixa");
const clientes = require("./controller/ctclientes");
const produtos = require("./controller/ctprodutos");
const proposta = require("./controller/ctpropostas");
const empresa = require("./controller/ctempresa");
const usuario = require("./controller/ctusuario");

routes.get("/", (req, res) => {
    res.status(200).send("✅ API do Sistema de Gerenciamento de Caixa está online!");
});

routes.post("/empresas", empresa.create);
routes.get("/empresas", empresa.read);
routes.get("/empresas/:id", empresa.readById);
routes.put("/empresas/:id", empresa.update);
routes.delete("/empresas/:id", empresa.remove);

routes.post("/usuarios", usuario.create);
routes.post("/usuarios/login", usuario.login);
routes.get("/usuarios", usuario.read);
routes.put("/usuarios/:id", usuario.update);
routes.delete("/usuarios/:id", usuario.remove);

routes.get("/caixa", caixa.read);
routes.post("/caixa", caixa.create);
routes.put("/caixa/:id", caixa.update);
routes.delete("/caixa/:id", caixa.remove);

routes.get("/clientes", clientes.read);
routes.post("/clientes", clientes.create);
routes.put("/clientes/:id", clientes.update);
routes.delete("/clientes/:id", clientes.remove);

routes.get("/produtos", produtos.read);
routes.post("/produtos", produtos.create);
routes.put("/produtos/:id", produtos.update);
routes.delete("/produtos/:id", produtos.remove);

routes.get("/propostas", proposta.read);
routes.post("/propostas", proposta.create);
routes.put("/propostas/:id", proposta.update);
routes.delete("/propostas/:id", proposta.remove);

routes.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada." });
});

module.exports = routes;
