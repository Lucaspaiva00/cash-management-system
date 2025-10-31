// api/routes.js
const express = require("express");
const routes = express.Router();

const caixa = require("./controller/controlecaixa");
const clientes = require("./controller/ctclientes");
const produtos = require("./controller/ctprodutos");
const proposta = require("./controller/ctpropostas");
const usuario = require("./controller/ctusuario");
const vendas = require("./controller/ctvenda");

routes.get("/", (req, res) => {
  res.status(200).json({
    status: "✅ API do Sistema de Gerenciamento de Caixa está online!",
    versao: "v1.0.0",
    autor: "Paiva Tech",
  });
});

routes.post("/auth/signup", usuario.signup);

// Usuários
routes.post("/usuarios/login", usuario.login);
routes.route("/usuarios").get(usuario.read).post(usuario.create); // mantém para casos internos quando já existe empresa
routes.route("/usuarios/:id").put(usuario.update).delete(usuario.remove);

// Caixa
routes.route("/caixa").get(caixa.read).post(caixa.create);
routes.route("/caixa/:id").put(caixa.update).delete(caixa.remove);

// Clientes
routes.route("/clientes").get(clientes.read).post(clientes.create);
routes.route("/clientes/:id").put(clientes.update).delete(clientes.remove);

// Produtos
routes.route("/produtos").get(produtos.read).post(produtos.create);
routes.route("/produtos/:id").put(produtos.update).delete(produtos.remove);

// Propostas
routes.route("/propostas").get(proposta.read).post(proposta.create);
routes.route("/propostas/:id").put(proposta.update).delete(proposta.remove);

routes.get("/vendas", vendas.read);
routes.post("/vendas", vendas.create);
routes.delete("/vendas/:id", vendas.remove);

module.exports = routes;
