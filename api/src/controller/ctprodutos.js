const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Criar produto
 */
const create = async (req, res) => {
    try {
        const {
            nome,
            precovenda,
            precocompra,
            estoque,
            marca,
            quantidade,
            categoria,
            empresaId,
        } = req.body;

        // --- Validação geral ---
        if (!nome || precovenda === undefined || precovenda === null) {
            return res
                .status(400)
                .json({ error: "Nome e preço de venda são obrigatórios." });
        }

        // --- Conversões seguras ---
        const precoVendaNum = parseFloat(precovenda);
        const precoCompraNum = parseFloat(precocompra) || 0;
        const estoqueNum = parseInt(estoque) || 0;
        const qtdNum = parseInt(quantidade) || 0;
        const empresaIdNum = parseInt(empresaId) || 1; // fallback seguro

        if (isNaN(precoVendaNum)) {
            return res.status(400).json({ error: "Preço de venda inválido." });
        }

        // --- Criação do produto ---
        const novo = await prisma.produto.create({
            data: {
                nome,
                precovenda: precoVendaNum,
                precocompra: precoCompraNum,
                estoque: estoqueNum,
                marca: marca || "",
                quantidade: qtdNum,
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
            precovenda,
            precocompra,
            estoque,
            marca,
            quantidade,
            categoria,
        } = req.body;

        const atualizado = await prisma.produto.update({
            where: { id },
            data: {
                nome,
                precovenda: parseFloat(precovenda) || 0,
                precocompra: parseFloat(precocompra) || 0,
                estoque: parseInt(estoque) || 0,
                marca: marca || "",
                quantidade: parseInt(quantidade) || 0,
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
