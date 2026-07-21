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
            descricao,
            servico,
            pacoteQuinzenal,
            pacoteMensal,
            porteCachorro
        } = req.body;

        if (!nome || !String(nome).trim() || !empresaId) {
            return res.status(400).json({
                error: "Nome e empresaId são obrigatórios."
            });
        }

        const novo = await prisma.cliente.create({
            data: {
                nome: String(nome).trim(),
                cpf: cpf && String(cpf).trim()
                    ? String(cpf).trim()
                    : null,
                cnpj: cnpj && String(cnpj).trim()
                    ? String(cnpj).trim()
                    : null,
                endereco: endereco && String(endereco).trim()
                    ? String(endereco).trim()
                    : null,
                telefone: telefone && String(telefone).trim()
                    ? String(telefone).trim()
                    : null,
                email: email && String(email).trim()
                    ? String(email).trim().toLowerCase()
                    : null,
                empresaId: parseInt(empresaId, 10),
                descricao: descricao && String(descricao).trim()
                    ? String(descricao).trim()
                    : null,
                servico: servico && String(servico).trim()
                    ? String(servico).trim()
                    : null,
                pacoteQuinzenal:
                    pacoteQuinzenal === true ||
                    pacoteQuinzenal === "true",
                pacoteMensal:
                    pacoteMensal === true ||
                    pacoteMensal === "true",
                porteCachorro: porteCachorro && String(porteCachorro).trim()
                    ? String(porteCachorro).trim()
                    : null
            }
        });

        return res.status(201).json({
            message: "Cliente cadastrado com sucesso!",
            data: novo
        });

    } catch (error) {
        console.error(error);

        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Já existe um cliente cadastrado com este CPF, CNPJ ou e-mail."
            });
        }

        return res.status(500).json({
            error: "Erro ao cadastrar cliente."
        });
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
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                error: "ID do cliente inválido."
            });
        }

        const {
            nome,
            cpf,
            cnpj,
            endereco,
            telefone,
            email,
            descricao,
            servico,
            pacoteQuinzenal,
            pacoteMensal,
            porteCachorro
        } = req.body;

        if (!nome || !String(nome).trim()) {
            return res.status(400).json({
                error: "O nome do cliente é obrigatório."
            });
        }

        const atualizado = await prisma.cliente.update({
            where: { id },
            data: {
                nome: String(nome).trim(),
                cpf: cpf && String(cpf).trim()
                    ? String(cpf).trim()
                    : null,
                cnpj: cnpj && String(cnpj).trim()
                    ? String(cnpj).trim()
                    : null,
                endereco: endereco && String(endereco).trim()
                    ? String(endereco).trim()
                    : null,
                telefone: telefone && String(telefone).trim()
                    ? String(telefone).trim()
                    : null,
                email: email && String(email).trim()
                    ? String(email).trim().toLowerCase()
                    : null,
                descricao: descricao && String(descricao).trim()
                    ? String(descricao).trim()
                    : null,
                servico: servico && String(servico).trim()
                    ? String(servico).trim()
                    : null,
                pacoteQuinzenal:
                    pacoteQuinzenal === true ||
                    pacoteQuinzenal === "true",
                pacoteMensal:
                    pacoteMensal === true ||
                    pacoteMensal === "true",
                porteCachorro: porteCachorro && String(porteCachorro).trim()
                    ? String(porteCachorro).trim()
                    : null
            }
        });

        return res.status(200).json({
            message: "Cliente atualizado com sucesso!",
            data: atualizado
        });

    } catch (error) {
        console.error(error);

        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Já existe um cliente cadastrado com este CPF, CNPJ ou e-mail."
            });
        }

        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Cliente não encontrado."
            });
        }

        return res.status(500).json({
            error: "Erro ao atualizar cliente."
        });
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