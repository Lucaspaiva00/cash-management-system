const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Criar empresa
const create = async (req, res) => {
    try {
        const { nome, cnpj, endereco, telefone } = req.body;

        if (!nome || !cnpj) return res.status(400).json({ error: "Nome e CNPJ são obrigatórios." });

        const existe = await prisma.empresa.findUnique({ where: { cnpj } });
        if (existe) return res.status(400).json({ error: "CNPJ já cadastrado." });

        const nova = await prisma.empresa.create({
            data: { nome, cnpj, endereco, telefone },
        });

        return res.status(201).json({ message: "Empresa criada com sucesso!", data: nova });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao criar empresa." });
    }
};

// Listar empresas
const read = async (req, res) => {
    try {
        const lista = await prisma.empresa.findMany({ orderBy: { id: "desc" } });
        return res.status(200).json(lista);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao listar empresas." });
    }
};

// Buscar por ID
const readById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const empresa = await prisma.empresa.findUnique({ where: { id } });
        if (!empresa) return res.status(404).json({ error: "Empresa não encontrada." });
        return res.status(200).json(empresa);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao buscar empresa." });
    }
};

// Atualizar empresa
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dados = req.body;

        const atualizada = await prisma.empresa.update({
            where: { id },
            data: dados,
        });

        return res.status(200).json({ message: "Empresa atualizada com sucesso!", data: atualizada });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao atualizar empresa." });
    }
};

// Excluir empresa
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.empresa.delete({ where: { id } });
        return res.status(200).json({ message: "Empresa excluída com sucesso!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao excluir empresa." });
    }
};

module.exports = { create, read, readById, update, remove };
