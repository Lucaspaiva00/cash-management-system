const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const {
            tipoOperacao,
            meioPagamento,
            descricao,
            valor,
            dataOperacao,
            empresaId,

            // NOVOS CAMPOS
            jurosMaquina,
            clienteId
        } = req.body;

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

                // NOVOS CAMPOS
                jurosMaquina: jurosMaquina ? parseFloat(jurosMaquina) : 0,
                clienteId: clienteId ? parseInt(clienteId) : null
            },
        });

        res.status(201).json({
            message: "Operação registrada com sucesso!",
            data: nova
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar operação." });
    }
};

const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        const { inicio, fim } = req.query;

        if (!empresaId) {
            return res.status(400).json({ error: "Informe o ID da empresa." });
        }

        const where = { empresaId };

        if (inicio && fim) {
            where.dataOperacao = {
                gte: new Date(inicio),
                lte: new Date(fim),
            };
        }

        const lista = await prisma.caixa.findMany({
            where,
            orderBy: { dataOperacao: "desc" },

            // 🔥 AQUI TRAZ O CLIENTE
            include: {
                cliente: true
            }
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
                dataOperacao: dados.dataOperacao ? new Date(dados.dataOperacao) : new Date(),

                // NOVOS CAMPOS
                jurosMaquina: dados.jurosMaquina ? parseFloat(dados.jurosMaquina) : 0,
                clienteId: dados.clienteId ? parseInt(dados.clienteId) : null
            },
        });

        res.status(200).json({
            message: "Operação atualizada com sucesso!",
            data: atualizada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar operação." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.caixa.delete({ where: { id } });

        res.status(200).json({
            message: "Operação excluída com sucesso!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir operação." });
    }
};

module.exports = { create, read, update, remove };