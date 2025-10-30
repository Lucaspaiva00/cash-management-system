const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const { tipoOperacao, meioPagamento, descricao, valor, empresaId } = req.body;

        if (!tipoOperacao || !meioPagamento || !valor || !empresaId) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes." });
        }

        const novaOperacao = await prisma.caixa.create({
            data: {
                tipoOperacao,
                meioPagamento,
                descricao,
                valor: parseFloat(valor),
                empresaId: parseInt(empresaId),
            },
        });

        return res.status(201).json({
            message: "Operação registrada com sucesso.",
            data: novaOperacao,
        });
    } catch (error) {
        console.error("Erro ao criar operação:", error);
        return res.status(500).json({ error: "Erro ao registrar operação de caixa." });
    }
};

const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);

        if (!empresaId) {
            return res.status(400).json({ error: "Informe o ID da empresa." });
        }

        const operacoes = await prisma.caixa.findMany({
            where: { empresaId },
            orderBy: { dataOperacao: "desc" },
        });

        return res.status(200).json(operacoes);
    } catch (error) {
        console.error("Erro ao listar operações:", error);
        return res.status(500).json({ error: "Erro ao listar as operações do caixa." });
    }
};

const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { tipoOperacao, meioPagamento, descricao, valor } = req.body;

        const existe = await prisma.caixa.findUnique({ where: { id } });
        if (!existe) return res.status(404).json({ error: "Operação não encontrada." });

        const atualizada = await prisma.caixa.update({
            where: { id },
            data: { tipoOperacao, meioPagamento, descricao, valor },
        });

        return res.status(200).json({
            message: "Operação atualizada com sucesso.",
            data: atualizada,
        });
    } catch (error) {
        console.error("Erro ao atualizar operação:", error);
        return res.status(500).json({ error: "Erro ao atualizar operação." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existe = await prisma.caixa.findUnique({ where: { id } });

        if (!existe) return res.status(404).json({ error: "Operação não encontrada." });

        await prisma.caixa.delete({ where: { id } });

        return res.status(200).json({ message: "Operação removida com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir operação:", error);
        return res.status(500).json({ error: "Erro ao excluir operação." });
    }
};

module.exports = {
    create,
    read,
    update,
    remove,
};
