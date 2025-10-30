const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const { nome, email, senha, empresaId } = req.body;

        if (!nome || !email || !senha || !empresaId) {
            return res.status(400).json({ error: "Nome, e-mail, senha e empresaId são obrigatórios." });
        }

        const existente = await prisma.usuario.findUnique({ where: { email } });
        if (existente) {
            return res.status(409).json({ error: "Já existe um usuário com este e-mail." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                empresaId: parseInt(empresaId),
            },
            include: { empresa: true },
        });

        return res.status(201).json({
            message: "Usuário criado com sucesso!",
            data: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                empresa: novoUsuario.empresa,
            },
        });
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return res.status(500).json({ error: "Falha ao criar usuário." });
    }
};

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { empresa: true },
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        // Login bem-sucedido → retorna dados básicos
        return res.status(200).json({
            message: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                empresaId: usuario.empresaId,
                empresaNome: usuario.empresa.nome,
            },
        });
    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ error: "Falha ao realizar login." });
    }
};

const read = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            include: { empresa: true },
            orderBy: { nome: "asc" },
        });
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return res.status(500).json({ error: "Falha ao listar usuários." });
    }
};
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, senha } = req.body;

        const usuario = await prisma.usuario.findUnique({ where: { id } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        let senhaHash = usuario.senha;
        if (senha) senhaHash = await bcrypt.hash(senha, 10);

        const atualizado = await prisma.usuario.update({
            where: { id },
            data: { nome, email, senha: senhaHash },
        });

        return res.status(200).json({
            message: "Usuário atualizado com sucesso!",
            data: atualizado,
        });
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return res.status(500).json({ error: "Falha ao atualizar usuário." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const usuario = await prisma.usuario.findUnique({ where: { id } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        await prisma.usuario.delete({ where: { id } });

        return res.status(200).json({ message: "Usuário removido com sucesso!" });
    } catch (error) {
        console.error("Erro ao remover usuário:", error);
        return res.status(500).json({ error: "Falha ao remover usuário." });
    }
};

module.exports = {
    create,
    login,
    read,
    update,
    remove,
};
