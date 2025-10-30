const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const { nome, marca, categoria, precoVenda, precoCompra, estoque, imagem, empresaId } = req.body;

        if (!nome || !precoVenda || !empresaId) {
            return res.status(400).json({ error: "Nome, preço de venda e empresaId são obrigatórios." });
        }

        const novoProduto = await prisma.produto.create({
            data: {
                nome,
                marca,
                categoria,
                precoVenda: parseFloat(precoVenda),
                precoCompra: precoCompra ? parseFloat(precoCompra) : null,
                estoque: estoque ? parseInt(estoque) : 0,
                imagem,
                empresaId: parseInt(empresaId),
            },
        });

        return res.status(201).json({
            message: "Produto cadastrado com sucesso!",
            data: novoProduto,
        });
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        return res.status(500).json({ error: "Falha ao cadastrar produto." });
    }
};

const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);

        if (!empresaId) {
            return res.status(400).json({ error: "Informe o ID da empresa." });
        }

        const produtos = await prisma.produto.findMany({
            where: { empresaId },
            orderBy: { nome: "asc" },
        });

        return res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        return res.status(500).json({ error: "Falha ao listar produtos." });
    }
};

const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, marca, categoria, precoVenda, precoCompra, estoque, imagem } = req.body;

        const produtoExistente = await prisma.produto.findUnique({ where: { id } });
        if (!produtoExistente) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        const produtoAtualizado = await prisma.produto.update({
            where: { id },
            data: {
                nome,
                marca,
                categoria,
                precoVenda: precoVenda ? parseFloat(precoVenda) : produtoExistente.precoVenda,
                precoCompra: precoCompra ? parseFloat(precoCompra) : produtoExistente.precoCompra,
                estoque: estoque ? parseInt(estoque) : produtoExistente.estoque,
                imagem,
            },
        });

        return res.status(200).json({
            message: "Produto atualizado com sucesso!",
            data: produtoAtualizado,
        });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        return res.status(500).json({ error: "Falha ao atualizar produto." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const produtoExistente = await prisma.produto.findUnique({ where: { id } });
        if (!produtoExistente) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        await prisma.produto.delete({ where: { id } });

        return res.status(200).json({ message: "Produto removido com sucesso!" });
    } catch (error) {
        console.error("Erro ao remover produto:", error);
        return res.status(500).json({ error: "Falha ao remover produto." });
    }
};

module.exports = {
    create,
    read,
    update,
    remove,
};
