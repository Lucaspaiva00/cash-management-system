const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const express = require("express")
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const read = async (req, res) => {
    const proposta = await prisma.propostas.findMany();
    return res.json(proposta);
    console.log(proposta);
}

const create = async (req, res) => {
    const proposta = await prisma.propostas.create({
        data: {
            nomeProposta: req.body.nomeProposta,
            descricaoProposta: req.body.descricaoProposta,
            prazoproposta: req.body.prazoproposta,
            valorProposta: Number(req.body.valorProposta),
            custoProposta: Number(req.body.custoProposta),
            // Aberta ou Fechada
            statusproposta: req.body.statusproposta
        }
    })
    if (proposta)
        res.redirect("http://127.0.0.1:5500/propostas.html")
    else
        res.redirect("http://127.0.0.1:5500/erro.html")
}

const apagar = async (req, res) => {
    const proposta = await prisma.propostas.delete({
        where: {
            id: parseInt(req.params.id)
        }
    });
    res.status(204).json(proposta).end();
    console.log("Proposta Deletada com Sucesso");
}

const update = async (req, res) => {
    const data = req.body;
    let proposta = await prisma.propostas.update({
        data: data,
        where: {
            id: parseInt(req.body.id)
        }
    });
    res.status(202).json(proposta).end();
    console.log("Cliente atualizado com sucesso");
}

module.exports = {
    read,
    create,
    apagar,
    update
}