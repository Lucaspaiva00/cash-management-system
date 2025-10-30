const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const { tipoOperacao, meioPagamento, descricao, valor, dataOperacao, empresaId } = req.body;

        if (!tipoOperacao || !meioPagamento || !valor || !empresaId)
            return res.status(400).json({ error: "Campos obrigatórios ausentes." });

        const nova = await prisma.caixa.create({
            data: {
                tipoOperacao,
                meioPagamento,
                descricao,
                valor: parseFloat(valor),
                dataOperacao: dataOperacao ? new Date(dataOperacao) : new Date(),
                empresaId: parseInt(empresaId),
            },
        });

        res.status(201).json({ message: "Operação registrada com sucesso!", data: nova });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar operação." });
    }
};

const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        if (!empresaId) return res.status(400).json({ error: "Informe o ID da empresa." });

        const lista = await prisma.caixa.findMany({
            where: { empresaId },
            orderBy: { id: "desc" },
        });

        res.status(200).json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar operações." });
    }
};

const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dados = req.body;
        const existe = await prisma.caixa.findUnique({ where: { id } });
        if (!existe) return res.status(404).json({ error: "Operação não encontrada." });

        const atualizada = await prisma.caixa.update({
            where: { id },
            data: {
                tipoOperacao: dados.tipoOperacao,
                meioPagamento: dados.meioPagamento,
                descricao: dados.descricao,
                valor: parseFloat(dados.valor),
                dataOperacao: new Date(dados.dataOperacao),
            },
        });

        res.status(200).json({ message: "Operação atualizada com sucesso!", data: atualizada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar operação." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.caixa.delete({ where: { id } });
        res.status(200).json({ message: "Operação excluída com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir operação." });
    }
};

module.exports = { create, read, update, remove };
