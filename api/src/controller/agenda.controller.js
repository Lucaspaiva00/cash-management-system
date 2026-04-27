const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Criar agendamento
 */
const create = async (req, res) => {
    try {
        const {
            clienteId,
            data,
            horario,
            servico,
            observacao,
            empresaId
        } = req.body;

        if (!clienteId || !data || !horario || !empresaId) {
            return res.status(400).json({
                error: "clienteId, data, horario e empresaId são obrigatórios."
            });
        }

        const novo = await prisma.agenda.create({
            data: {
                clienteId: parseInt(clienteId),
                data: new Date(data),
                horario,
                servico,
                observacao,
                empresaId: parseInt(empresaId)
            }
        });

        return res.status(201).json({
            message: "Agendamento criado com sucesso!",
            data: novo
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao criar agendamento."
        });
    }
};

/**
 * Listar agenda
 */
const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        const { dataInicio, dataFim } = req.query;

        if (!empresaId) {
            return res.status(400).json({
                error: "Informe o ID da empresa."
            });
        }

        const where = { empresaId };

        // Filtro por período
        if (dataInicio && dataFim) {
            where.data = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        const lista = await prisma.agenda.findMany({
            where,
            include: {
                cliente: true
            },
            orderBy: [
                { data: "asc" },
                { horario: "asc" }
            ]
        });

        return res.status(200).json(lista);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao listar agenda."
        });
    }
};

/**
 * Buscar agendamento por ID
 */
const readOne = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const agendamento = await prisma.agenda.findUnique({
            where: { id },
            include: {
                cliente: true
            }
        });

        if (!agendamento) {
            return res.status(404).json({
                error: "Agendamento não encontrado."
            });
        }

        return res.status(200).json(agendamento);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao buscar agendamento."
        });
    }
};

/**
 * Atualizar agendamento
 */
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dados = req.body;

        const existe = await prisma.agenda.findUnique({ where: { id } });

        if (!existe) {
            return res.status(404).json({
                error: "Agendamento não encontrado."
            });
        }

        const atualizado = await prisma.agenda.update({
            where: { id },
            data: {
                clienteId: dados.clienteId ? parseInt(dados.clienteId) : undefined,
                data: dados.data ? new Date(dados.data) : undefined,
                horario: dados.horario,
                servico: dados.servico,
                observacao: dados.observacao,
                status: dados.status // AGENDADO | CONCLUIDO | CANCELADO
            }
        });

        return res.status(200).json({
            message: "Agendamento atualizado com sucesso!",
            data: atualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao atualizar agendamento."
        });
    }
};

/**
 * Atualizar apenas status (rápido)
 */
const updateStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: "Status é obrigatório."
            });
        }

        const atualizado = await prisma.agenda.update({
            where: { id },
            data: { status }
        });

        return res.status(200).json({
            message: "Status atualizado com sucesso!",
            data: atualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao atualizar status."
        });
    }
};

/**
 * Excluir agendamento
 */
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const existe = await prisma.agenda.findUnique({ where: { id } });

        if (!existe) {
            return res.status(404).json({
                error: "Agendamento não encontrado."
            });
        }

        await prisma.agenda.delete({
            where: { id }
        });

        return res.status(200).json({
            message: "Agendamento excluído com sucesso!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao excluir agendamento."
        });
    }
};

module.exports = {
    create,
    read,
    readOne,
    update,
    updateStatus,
    remove
};