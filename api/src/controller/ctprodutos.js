// api/controller/ctprodutos.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Criar produto
const create = async (req, res) => {
    try {
        const data = req.body;
        const novo = await prisma.produto.create({ data });
        res.status(201).json(novo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar produto." });
    }
};

// Listar produtos
const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        const produtos = await prisma.produto.findMany({ where: { empresaId } });
        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar produtos." });
    }
};

// Atualizar produto
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dados = req.body;
        const atualizado = await prisma.produto.update({ where: { id }, data: dados });
        res.status(200).json(atualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar produto." });
    }
};

// Excluir produto
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.produto.delete({ where: { id } });
        res.status(200).json({ message: "Produto excluído com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir produto." });
    }
};

module.exports = { create, read, update, remove };
