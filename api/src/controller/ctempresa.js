const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const create = async (req, res) => {
    try {
        const { nome, cnpj, email, telefone, endereco } = req.body;

        if (!nome) {
            return res.status(400).json({ error: "O nome da empresa é obrigatório." });
        }

        // Evita duplicidade de empresa (CNPJ ou e-mail)
        const empresaExistente = await prisma.empresa.findFirst({
            where: {
                OR: [
                    { cnpj: cnpj || undefined },
                    { email: email || undefined }
                ],
            },
        });

        if (empresaExistente) {
            return res.status(409).json({ error: "Já existe uma empresa com este CNPJ ou e-mail." });
        }

        const novaEmpresa = await prisma.empresa.create({
            data: {
                nome,
                cnpj,
                email,
                telefone,
                endereco,
            },
        });

        return res.status(201).json({
            message: "Empresa criada com sucesso!",
            data: novaEmpresa,
        });
    } catch (error) {
        console.error("Erro ao criar empresa:", error);
        return res.status(500).json({ error: "Falha ao criar a empresa." });
    }
};

const read = async (req, res) => {
    try {
        const empresas = await prisma.empresa.findMany({
            orderBy: { nome: "asc" },
        });

        return res.status(200).json(empresas);
    } catch (error) {
        console.error("Erro ao listar empresas:", error);
        return res.status(500).json({ error: "Falha ao listar empresas." });
    }
};

const readById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const empresa = await prisma.empresa.findUnique({
            where: { id },
            include: {
                clientes: true,
                produtos: true,
                propostas: true,
                operacoes: true,
            },
        });

        if (!empresa) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        return res.status(200).json(empresa);
    } catch (error) {
        console.error("Erro ao buscar empresa:", error);
        return res.status(500).json({ error: "Falha ao buscar empresa." });
    }
};

const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, cnpj, email, telefone, endereco } = req.body;

        const empresaExistente = await prisma.empresa.findUnique({ where: { id } });
        if (!empresaExistente) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        const empresaAtualizada = await prisma.empresa.update({
            where: { id },
            data: { nome, cnpj, email, telefone, endereco },
        });

        return res.status(200).json({
            message: "Empresa atualizada com sucesso!",
            data: empresaAtualizada,
        });
    } catch (error) {
        console.error("Erro ao atualizar empresa:", error);
        return res.status(500).json({ error: "Falha ao atualizar empresa." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const empresaExistente = await prisma.empresa.findUnique({ where: { id } });
        if (!empresaExistente) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        await prisma.empresa.delete({ where: { id } });

        return res.status(200).json({ message: "Empresa removida com sucesso!" });
    } catch (error) {
        console.error("Erro ao remover empresa:", error);
        return res.status(500).json({ error: "Falha ao remover empresa." });
    }
};

module.exports = {
    create,
    read,
    readById,
    update,
    remove,
};
