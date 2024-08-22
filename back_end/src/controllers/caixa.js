const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require("express");

const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const read = async (req, res) => {
  const lancamentos = await prisma.gerenciamentoDcaixa.findMany();
  return res.json(lancamentos);
}

const create = async (req, res) => {
  const lancamento = await prisma.gerenciamentoDcaixa.create({
    data: {
      dataOperacao: req.body.dataOperacao,
      tipoOperacao: req.body.tipoOperacao,
      meioPagamento: req.body.meioPagamento,
      valor: Number(req.body.valor)
    },

  });

  if (lancamento)
    // res.redirect("http://127.0.0.1:5500/front_end/index.html");
    res.redirect("http://127.0.0.1:5500/credito.html");

  else
    res.redirect("http://127.0.0.1:5500/erro.html");
};

const update = async (req, res) => {
  try {
    const data = req.body;
    let itens = await prisma.gerenciamentoDcaixa.update({
      data: data,
      where: {
        id: parseInt(req.body.id)
      }
    });
    res.status(202).json(itens).end();
  } catch (error) {
    res.status(404).json({ error: error.message }).end();
  }
}


const apagar = async (req, res) => {
  const lancamento = await prisma.gerenciamentoDcaixa.delete({
    where: {
      id: parseInt(req.params.id)
    }

  });
  res.status(204).json(lancamento).end();
  console.log("Lançamento excluído com sucesso");
};

module.exports = {
  read,
  create,
  update,
  apagar
};