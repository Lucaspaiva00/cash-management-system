const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const { clienteId, descricao, valor, status, empresaId } = req.body;

        if (!clienteId || !valor || !empresaId) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes." });
        }

        const nova = await prisma.proposta.create({
            data: {
                clienteId: parseInt(clienteId),
                descricao,
                valor: parseFloat(valor),
                status: status || "PENDENTE",
                empresaId: parseInt(empresaId),
            },
        });

        return res.status(201).json({ message: "Proposta criada com sucesso!", data: nova });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao criar proposta." });
    }
};

const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        if (!empresaId) return res.status(400).json({ error: "Informe o ID da empresa." });

        const lista = await prisma.proposta.findMany({
            where: { empresaId },
            orderBy: { id: "desc" },
            include: { cliente: true },
        });

        return res.status(200).json(lista);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao listar propostas." });
    }
};

const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { descricao, valor, status } = req.body;

        const atualizada = await prisma.proposta.update({
            where: { id },
            data: { descricao, valor: parseFloat(valor), status },
        });

        return res.status(200).json({ message: "Proposta atualizada com sucesso!", data: atualizada });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao atualizar proposta." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.proposta.delete({ where: { id } });
        return res.status(200).json({ message: "Proposta excluída com sucesso!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao excluir proposta." });
    }
};

module.exports = { create, read, update, remove };
