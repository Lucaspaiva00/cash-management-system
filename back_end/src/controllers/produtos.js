const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require("express");

const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const read = async (req, res) => {
  const produtos = await prisma.produtos.findMany();
  return res.json(produtos);
}

const create = async (req, res) => {
  const produto = await prisma.produtos.create({
    data: {
      nomeProduto: req.body.nomeProduto,
      descricaoProduto: req.body.descricaoProduto,
      valorProduto: Number(req.body.valorProduto),
      custoProduto: Number(req.body.custoProduto),
      // Aberta ou Fechada
      statusProduto: req.body.statusProduto,
      quantidadeProduto: Number(req.body.quantidadeProduto)
    },

  });

  if (produto)
    res.redirect("http://127.0.0.1:5500/front_end/produtos.html");
  else
    res.redirect("http://127.0.0.1:5500/front_end/produtos.html");
}

const apagar = async (req, res) => {
  const produto = await prisma.produtos.delete({
    where: {
      id: parseInt(req.params.id)
    }

  });
  res.status(204).json(produto).end();
  console.log("Produto excluído com sucesso");
}

module.exports = {
  read,
  create,
  apagar
};