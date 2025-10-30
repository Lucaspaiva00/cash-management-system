const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const { numero, descricao, status, valorTotal, clienteId, empresaId } = req.body;

        if (!numero || !descricao || !status || !valorTotal || !empresaId) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes." });
        }

        const novaProposta = await prisma.proposta.create({
            data: {
                numero: parseInt(numero),
                descricao,
                status,
                valorTotal: parseFloat(valorTotal),
                clienteId: clienteId ? parseInt(clienteId) : null,
                empresaId: parseInt(empresaId),
            },
            include: {
                cliente: true,
                empresa: true,
            },
        });

        return res.status(201).json({
            message: "Proposta criada com sucesso!",
            data: novaProposta,
        });
    } catch (error) {
        console.error("Erro ao criar proposta:", error);
        return res.status(500).json({ error: "Falha ao criar proposta." });
    }
};


const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);

        if (!empresaId) {
            return res.status(400).json({ error: "Informe o ID da empresa." });
        }

        const propostas = await prisma.proposta.findMany({
            where: { empresaId },
            include: {
                cliente: {
                    select: { id: true, nome: true, email: true },
                },
            },
            orderBy: { data: "desc" },
        });

        return res.status(200).json(propostas);
    } catch (error) {
        console.error("Erro ao listar propostas:", error);
        return res.status(500).json({ error: "Falha ao listar propostas." });
    }
};


const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { descricao, status, valorTotal, clienteId } = req.body;

        const propostaExistente = await prisma.proposta.findUnique({ where: { id } });
        if (!propostaExistente) {
            return res.status(404).json({ error: "Proposta não encontrada." });
        }

        const propostaAtualizada = await prisma.proposta.update({
            where: { id },
            data: {
                descricao: descricao || propostaExistente.descricao,
                status: status || propostaExistente.status,
                valorTotal: valorTotal ? parseFloat(valorTotal) : propostaExistente.valorTotal,
                clienteId: clienteId ? parseInt(clienteId) : propostaExistente.clienteId,
            },
        });

        return res.status(200).json({
            message: "Proposta atualizada com sucesso!",
            data: propostaAtualizada,
        });
    } catch (error) {
        console.error("Erro ao atualizar proposta:", error);
        return res.status(500).json({ error: "Falha ao atualizar proposta." });
    }
};


const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const propostaExistente = await prisma.proposta.findUnique({ where: { id } });
        if (!propostaExistente) {
            return res.status(404).json({ error: "Proposta não encontrada." });
        }

        await prisma.proposta.delete({ where: { id } });

        return res.status(200).json({ message: "Proposta removida com sucesso!" });
    } catch (error) {
        console.error("Erro ao remover proposta:", error);
        return res.status(500).json({ error: "Falha ao remover proposta." });
    }
};

module.exports = {
    create,
    read,
    update,
    remove,
};
