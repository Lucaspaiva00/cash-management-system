const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Criar produto
 */
const create = async (req, res) => {
    try {
        const {
            nome,
            precoVenda,
            precoCompra,
            estoque,
            marca,
            categoria,
            empresaId,
        } = req.body;

        if (!nome || precoVenda === undefined || precoVenda === null) {
            return res
                .status(400)
                .json({ error: "Nome e preço de venda são obrigatórios." });
        }

        const precoVendaNum = parseFloat(precoVenda);
        const precoCompraNum = parseFloat(precoCompra) || 0;
        const estoqueNum = parseInt(estoque) || 0;
        const empresaIdNum = parseInt(empresaId) || 1;

        if (isNaN(precoVendaNum)) {
            return res.status(400).json({ error: "Preço de venda inválido." });
        }

        const novo = await prisma.produto.create({
            data: {
                nome,
                precoVenda: precoVendaNum,
                precoCompra: precoCompraNum,
                estoque: estoqueNum,
                marca: marca || "",
                categoria: categoria || "",
                empresaId: empresaIdNum,
            },
        });

        return res
            .status(201)
            .json({ message: "Produto cadastrado com sucesso!", data: novo });
    } catch (error) {
        console.error("❌ Erro ao cadastrar produto:", error);
        return res.status(500).json({
            error: "Erro interno ao cadastrar produto.",
            detalhes: error.message,
        });
    }
};

/**
 * Listar produtos
 */
const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId) || 1;
        const lista = await prisma.produto.findMany({
            where: { empresaId },
            orderBy: { id: "desc" },
        });
        return res.status(200).json(lista);
    } catch (error) {
        console.error("❌ Erro ao listar produtos:", error);
        return res.status(500).json({ error: "Erro ao listar produtos." });
    }
};

/**
 * Atualizar produto
 */
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const {
            nome,
            precoVenda,
            precoCompra,
            estoque,
            marca,
            categoria,
        } = req.body;

        const atualizado = await prisma.produto.update({
            where: { id },
            data: {
                nome,
                precoVenda: parseFloat(precoVenda) || 0,
                precoCompra: parseFloat(precoCompra) || 0,
                estoque: parseInt(estoque) || 0,
                marca: marca || "",
                categoria: categoria || "",
            },
        });

        return res
            .status(200)
            .json({ message: "Produto atualizado com sucesso!", data: atualizado });
    } catch (error) {
        console.error("❌ Erro ao atualizar produto:", error);
        return res.status(500).json({ error: "Erro ao atualizar produto." });
    }
};

/**
 * Excluir produto
 */
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.produto.delete({ where: { id } });
        return res.status(200).json({ message: "Produto excluído com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao excluir produto:", error);
        return res.status(500).json({ error: "Erro ao excluir produto." });
    }
};

module.exports = { create, read, update, remove };
