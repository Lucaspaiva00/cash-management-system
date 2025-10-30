const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const textoValido = (txt) => typeof txt === "string" && txt.trim().length > 0;

/**
 * Criar proposta
 */
const create = async (req, res) => {
    try {
        const {
            numero,
            descricao,
            valorTotal,
            status,
            data,
            clienteId,
            empresaId,
        } = req.body;

        const _empresaId = parseInt(empresaId);
        const _numero = parseInt(numero);
        const _valorTotal = parseFloat(valorTotal);
        const _clienteId = clienteId ? parseInt(clienteId) : null;

        const proposta = await prisma.proposta.create({
            data: {
                numero: _numero,
                descricao: descricao.trim(),
                valorTotal: _valorTotal,
                status: status?.trim() || "Aberto",
                data: data ? new Date(data) : undefined,
                empresaId: _empresaId,
                clienteId: _clienteId,
            },
            include: {
                cliente: { select: { id: true, nome: true } },
            },
        });

        return res
            .status(201)
            .json({ message: "Proposta criada com sucesso!", data: proposta });
    } catch (error) {
        console.error("❌ Erro ao criar proposta:", error);
        return res
            .status(500)
            .json({ error: "Erro interno ao criar proposta.", detalhes: error.message });
    }
};

/**
 * Listar propostas
 */
const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        if (!empresaId)
            return res.status(400).json({ error: "empresaId é obrigatório." });

        const propostas = await prisma.proposta.findMany({
            where: { empresaId },
            include: { cliente: { select: { id: true, nome: true } } },
            orderBy: { data: "desc" },
        });

        return res.status(200).json(propostas);
    } catch (error) {
        console.error("❌ Erro ao listar propostas:", error);
        return res
            .status(500)
            .json({ error: "Erro interno ao listar propostas.", detalhes: error.message });
    }
};

/**
 * Atualizar proposta
 */
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: "ID inválido." });

        const { numero, descricao, valorTotal, status, data, clienteId } = req.body;

        const atualiza = {};
        if (numero) atualiza.numero = parseInt(numero);
        if (valorTotal) atualiza.valorTotal = parseFloat(valorTotal);
        if (descricao) atualiza.descricao = descricao.trim();
        if (status) atualiza.status = status.trim();
        if (data) atualiza.data = new Date(data);
        if (clienteId !== undefined)
            atualiza.clienteId = clienteId ? parseInt(clienteId) : null;

        const proposta = await prisma.proposta.update({
            where: { id },
            data: atualiza,
            include: { cliente: { select: { id: true, nome: true } } },
        });

        return res
            .status(200)
            .json({ message: "Proposta atualizada com sucesso!", data: proposta });
    } catch (error) {
        console.error("❌ Erro ao atualizar proposta:", error);
        return res
            .status(500)
            .json({ error: "Erro interno ao atualizar proposta.", detalhes: error.message });
    }
};

/**
 * Excluir proposta
 */
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: "ID inválido." });

        await prisma.proposta.delete({ where: { id } });
        return res
            .status(200)
            .json({ message: "Proposta excluída com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao excluir proposta:", error);
        return res
            .status(500)
            .json({ error: "Erro interno ao excluir proposta.", detalhes: error.message });
    }
};

module.exports = { create, read, update, remove };
