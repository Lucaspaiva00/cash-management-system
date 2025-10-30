// controller/ctpropostas.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * ✅ Criar nova proposta
 */
const create = async (req, res) => {
    try {
        const { descricao, valor, status, empresaId, numero, clienteId } = req.body;

        if (!descricao || !valor || !empresaId) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes." });
        }

        const nova = await prisma.proposta.create({
            data: {
                numero: parseInt(numero) || 0,
                descricao,
                valorTotal: parseFloat(valor),
                status: status || "Aberto",
                empresaId: parseInt(empresaId),
                clienteId: clienteId ? parseInt(clienteId) : null,
            },
        });

        return res
            .status(201)
            .json({ message: "Proposta criada com sucesso!", data: nova });
    } catch (error) {
        console.error("❌ Erro ao criar proposta:", error);
        return res.status(500).json({ error: "Erro ao criar proposta." });
    }
};

/**
 * ✅ Listar propostas de uma empresa
 */
const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        if (!empresaId)
            return res.status(400).json({ error: "Informe o ID da empresa." });

        const lista = await prisma.proposta.findMany({
            where: { empresaId },
            orderBy: { id: "desc" },
        });

        return res.status(200).json(lista);
    } catch (error) {
        console.error("❌ Erro ao listar propostas:", error);
        return res.status(500).json({ error: "Erro ao listar propostas." });
    }
};

/**
 * ✅ Atualizar proposta (editar status, valor, descrição, etc)
 */
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { descricao, valor, status, numero } = req.body;

        const proposta = await prisma.proposta.findUnique({ where: { id } });
        if (!proposta) {
            return res.status(404).json({ error: "Proposta não encontrada." });
        }

        const atualizada = await prisma.proposta.update({
            where: { id },
            data: {
                descricao: descricao || proposta.descricao,
                valorTotal: valor ? parseFloat(valor) : proposta.valorTotal,
                status: status || proposta.status,
                numero: numero ? parseInt(numero) : proposta.numero,
            },
        });

        return res
            .status(200)
            .json({ message: "Proposta atualizada com sucesso!", data: atualizada });
    } catch (error) {
        console.error("❌ Erro ao atualizar proposta:", error);
        return res.status(500).json({ error: "Erro ao atualizar proposta." });
    }
};

/**
 * ✅ Remover proposta
 */
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.proposta.delete({ where: { id } });
        return res.status(200).json({ message: "Proposta excluída com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao excluir proposta:", error);
        return res.status(500).json({ error: "Erro ao excluir proposta." });
    }
};

module.exports = { create, read, update, remove };
