const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const { nome, preco, descricao, empresaId } = req.body;

        if (!nome || !preco || !empresaId) {
            return res.status(400).json({ error: "Nome, preço e empresaId são obrigatórios." });
        }

        const novo = await prisma.produto.create({
            data: {
                nome,
                preco: parseFloat(preco),
                descricao,
                empresaId: parseInt(empresaId),
            },
        });

        return res.status(201).json({ message: "Produto cadastrado com sucesso!", data: novo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao cadastrar produto." });
    }
};

const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        if (!empresaId) return res.status(400).json({ error: "Informe o ID da empresa." });

        const lista = await prisma.produto.findMany({
            where: { empresaId },
            orderBy: { id: "desc" },
        });

        return res.status(200).json(lista);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao listar produtos." });
    }
};

const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, preco, descricao } = req.body;

        const atualizado = await prisma.produto.update({
            where: { id },
            data: { nome, preco: parseFloat(preco), descricao },
        });

        return res.status(200).json({ message: "Produto atualizado com sucesso!", data: atualizado });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao atualizar produto." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.produto.delete({ where: { id } });
        return res.status(200).json({ message: "Produto excluído com sucesso!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao excluir produto." });
    }
};

module.exports = { create, read, update, remove };
