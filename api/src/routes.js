const express = require("express");
const routes = express.Router();

// Controllers
const caixa = require("./controller/controlecaixa");
const clientes = require("./controller/ctclientes");
const produtos = require("./controller/ctprodutos");
const proposta = require("./controller/ctpropostas");
const empresa = require("./controller/ctempresa");
const usuario = require("./controller/ctusuario");


routes.get("/", (req, res) => {
    res.status(200).json({
        status: "✅ API do Sistema de Gerenciamento de Caixa está online!",
        versao: "v1.0.0",
        autor: "Paiva Tech",
        endpoints: [
            "/empresas",
            "/usuarios",
            "/caixa",
            "/clientes",
            "/produtos",
            "/propostas",
        ],
    });
});


routes
    .route("/empresas")
    .get(empresa.read)       // Lista todas as empresas
    .post(empresa.create);   // Cria nova empresa

routes
    .route("/empresas/:id")
    .get(empresa.readById)   // Busca uma empresa específica
    .put(empresa.update)     // Atualiza empresa
    .delete(empresa.remove); // Exclui empresa


routes.post("/usuarios/login", usuario.login); // Login do usuário
routes
    .route("/usuarios")
    .get(usuario.read)       // Lista usuários
    .post(usuario.create);   // Cria usuário

routes
    .route("/usuarios/:id")
    .put(usuario.update)     // Atualiza usuário
    .delete(usuario.remove); // Remove usuário


routes
    .route("/caixa")
    .get(caixa.read)         // Lista movimentações
    .post(caixa.create);     // Cria nova operação

routes
    .route("/caixa/:id")
    .put(caixa.update)       // Atualiza operação
    .delete(caixa.remove);   // Remove operação


routes
    .route("/clientes")
    .get(clientes.read)      // Lista clientes
    .post(clientes.create);  // Cria cliente

routes
    .route("/clientes/:id")
    .put(clientes.update)    // Atualiza cliente
    .delete(clientes.remove);// Remove cliente


routes
    .route("/produtos")
    .get(produtos.read)      // Lista produtos
    .post(produtos.create);  // Cria produto

routes
    .route("/produtos/:id")
    .put(produtos.update)    // Atualiza produto
    .delete(produtos.remove);// Exclui produto


routes
    .route("/propostas")
    .get(proposta.read)      // Lista propostas
    .post(proposta.create);  // Cria proposta

routes
    .route("/propostas/:id")
    .put(proposta.update)    // Atualiza proposta
    .delete(proposta.remove);// Exclui proposta

routes.use((req, res) => {
    res.status(404).json({
        error: "❌ Rota não encontrada.",
        dica: "Verifique o endpoint ou o método HTTP utilizado.",
    });
});

module.exports = routes;
