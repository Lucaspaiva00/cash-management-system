const express = require("express");
const routes = express.Router();

const caixa = require("./controller/controlecaixa");
const clientes = require("./controller/ctclientes");
const produtos = require("./controller/ctprodutos");
const proposta = require("./controller/ctpropostas");
const usuario = require("./controller/ctusuario");
const vendas = require("./controller/ctvenda");
const agenda = require("./controller/agenda.controller");
const empresa = require("./controller/empresa.controller");
const configuracaoFiscal = require("./controller/configuracaoFiscal.controller");
const categorias = require("./controller/categoriaFinanceira.controller");
const centrosCusto = require("./controller/centroCusto.controller");
const nfe = require("./controller/nfe.controller");

routes.get("/", (req, res) => {
  res.status(200).json({
    status: "✅ API Financeira Online",
    versao: "2.0.0",
    autor: "Paiva Tech"
  });
});

routes.post("/auth/signup", usuario.signup);

routes.post("/usuarios/login", usuario.login);

routes.route("/usuarios")
  .get(usuario.read)
  .post(usuario.create);

routes.route("/usuarios/:id")
  .put(usuario.update)
  .delete(usuario.remove);

routes.route("/clientes")
  .get(clientes.read)
  .post(clientes.create);

routes.route("/clientes/:id")
  .put(clientes.update)
  .delete(clientes.remove);

routes.route("/produtos")
  .get(produtos.read)
  .post(produtos.create);

routes.route("/produtos/:id")
  .get(produtos.readOne)
  .put(produtos.update)
  .delete(produtos.remove);

routes.route("/propostas")
  .get(proposta.read)
  .post(proposta.create);

routes.route("/propostas/:id")
  .put(proposta.update)
  .delete(proposta.remove);

routes.get("/vendas", vendas.read);
routes.post("/vendas", vendas.create);
routes.delete("/vendas/:id", vendas.remove);
routes.get("/vendas/resumo", vendas.resumo);

routes.route("/categorias")
  .get(categorias.read)
  .post(categorias.create);

routes.route("/categorias/:id")
  .put(categorias.update)
  .delete(categorias.remove);

routes.route("/centros-custo")
  .get(centrosCusto.read)
  .post(centrosCusto.create);

routes.route("/centros-custo/:id")
  .put(centrosCusto.update)
  .delete(centrosCusto.remove);

routes.get("/financeiro/dashboard", caixa.dashboard);
routes.get("/financeiro/resumo", caixa.resumoFinanceiro);

routes.route("/caixa")
  .get(caixa.read)
  .post(caixa.create);

routes.route("/caixa/:id")
  .put(caixa.update)
  .delete(caixa.remove);

routes.put("/caixa/:id/pagar", caixa.marcarComoPaga);
routes.put("/caixa/:id/cancelar", caixa.cancelar);

routes.route("/agenda")
  .get(agenda.read)
  .post(agenda.create);

routes.route("/agenda/:id")
  .get(agenda.readOne)
  .put(agenda.update)
  .delete(agenda.remove);

routes.get(
  "/empresa/:id",
  empresa.readOne
);

routes.put(
  "/empresa/:id",
  empresa.update
);

routes.get(
  "/configuracao-fiscal/:empresaId",
  configuracaoFiscal.readOne
);

routes.put(
  "/configuracao-fiscal/:empresaId",
  configuracaoFiscal.update
);
routes.put("/agenda/:id/status", agenda.updateStatus);

routes.get("/vendas/:id/xml", nfe.gerarXml);

routes.post(
  "/vendas/:id/emitir",
  nfe.emitirNfe
);

module.exports = routes;