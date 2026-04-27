const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Criar cliente
const create = async (req, res) => {
    try {
        const {
            nome,
            cpf,
            cnpj,
            endereco,
            telefone,
            email,
            empresaId,

            // NOVOS CAMPOS
            descricao,
            servico,
            pacoteQuinzenal,
            pacoteMensal,
            porteCachorro
        } = req.body;

        if (!nome || !empresaId) {
            return res.status(400).json({ error: "Nome e empresaId são obrigatórios." });
        }

        const novo = await prisma.cliente.create({
            data: {
                nome,
                cpf,
                cnpj,
                endereco,
                telefone,
                email,
                empresaId: parseInt(empresaId),

                // NOVOS CAMPOS
                descricao,
                servico,
                pacoteQuinzenal: pacoteQuinzenal === true || pacoteQuinzenal === "true",
                pacoteMensal: pacoteMensal === true || pacoteMensal === "true",
                porteCachorro
            },
        });

        return res.status(201).json({
            message: "Cliente cadastrado com sucesso!",
            data: novo
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao cadastrar cliente." });
    }
};

// Listar clientes
const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        if (!empresaId) {
            return res.status(400).json({ error: "Informe o ID da empresa." });
        }

        const lista = await prisma.cliente.findMany({
            where: { empresaId },
            orderBy: { id: "desc" },
        });

        return res.status(200).json(lista);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao listar clientes." });
    }
};

// Atualizar cliente
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const {
            nome,
            cpf,
            cnpj,
            endereco,
            telefone,
            email,

            // NOVOS CAMPOS
            descricao,
            servico,
            pacoteQuinzenal,
            pacoteMensal,
            porteCachorro
        } = req.body;

        const atualizado = await prisma.cliente.update({
            where: { id },
            data: {
                nome,
                cpf,
                cnpj,
                endereco,
                telefone,
                email,

                // NOVOS CAMPOS
                descricao,
                servico,
                pacoteQuinzenal: pacoteQuinzenal === true || pacoteQuinzenal === "true",
                pacoteMensal: pacoteMensal === true || pacoteMensal === "true",
                porteCachorro
            },
        });

        return res.status(200).json({
            message: "Cliente atualizado com sucesso!",
            data: atualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao atualizar cliente." });
    }
};

// Excluir cliente
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.cliente.delete({
            where: { id }
        });

        return res.status(200).json({
            message: "Cliente excluído com sucesso!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao excluir cliente." });
    }
};

module.exports = { create, read, update, remove };