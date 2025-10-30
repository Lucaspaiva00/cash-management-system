// api/controller/ctusuario.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

/**
 * SIGNUP: cria Empresa + Usuário admin numa única transação.
 * Body:
 * {
 *   nome, email, senha,
 *   empresa: { nome, cnpj?, email?, telefone?, endereco? }
 * }
 */
const signup = async (req, res) => {
    try {
        const { nome, email, senha, empresa } = req.body;

        if (!nome || !email || !senha || !empresa?.nome) {
            return res.status(400).json({ error: "Campos obrigatórios faltando (nome, email, senha, empresa.nome)." });
        }

        const existente = await prisma.usuario.findUnique({ where: { email } });
        if (existente) {
            return res.status(409).json({ error: "Já existe um usuário com este e-mail." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await prisma.$transaction(async (tx) => {
            // Se já existir empresa com mesmo CNPJ ou e-mail, reutiliza (opcional)
            let empresaDb = null;
            if (empresa.cnpj) {
                empresaDb = await tx.empresa.findUnique({ where: { cnpj: empresa.cnpj } }).catch(() => null);
            }
            if (!empresaDb && empresa.email) {
                empresaDb = await tx.empresa.findUnique({ where: { email: empresa.email } }).catch(() => null);
            }

            if (!empresaDb) {
                empresaDb = await tx.empresa.create({
                    data: {
                        nome: empresa.nome,
                        cnpj: empresa.cnpj || null,
                        email: empresa.email || null,
                        telefone: empresa.telefone || null,
                        endereco: empresa.endereco || null,
                    },
                });
            }

            const usuarioDb = await tx.usuario.create({
                data: {
                    nome,
                    email,
                    senha: senhaHash,
                    empresaId: empresaDb.id,
                },
            });

            return { empresaDb, usuarioDb };
        });

        return res.status(201).json({
            message: "Conta criada com sucesso!",
            usuario: {
                id: resultado.usuarioDb.id,
                nome: resultado.usuarioDb.nome,
                email: resultado.usuarioDb.email,
                empresaId: resultado.empresaDb.id,
                empresaNome: resultado.empresaDb.nome,
            },
        });
    } catch (error) {
        console.error("Erro no signup:", error);
        return res.status(500).json({ error: "Falha ao criar conta." });
    }
};

// Mantém o create para casos onde já existe empresaId (uso interno)
const create = async (req, res) => {
    try {
        const { nome, email, senha, empresaId } = req.body;
        if (!nome || !email || !senha || !empresaId) {
            return res.status(400).json({ error: "Nome, e-mail, senha e empresaId são obrigatórios." });
        }
        const existente = await prisma.usuario.findUnique({ where: { email } });
        if (existente) return res.status(409).json({ error: "Já existe um usuário com este e-mail." });

        const senhaHash = await bcrypt.hash(senha, 10);
        const novo = await prisma.usuario.create({
            data: { nome, email, senha: senhaHash, empresaId: parseInt(empresaId) },
        });

        return res.status(201).json({
            message: "Usuário criado com sucesso!",
            data: { id: novo.id, nome: novo.nome, email: novo.email, empresaId: novo.empresaId },
        });
    } catch (e) {
        console.error("Erro ao criar usuário:", e);
        return res.status(500).json({ error: "Falha ao criar usuário." });
    }
};

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(400).json({ error: "E-mail e senha são obrigatórios." });

        const usuario = await prisma.usuario.findUnique({ where: { email }, include: { empresa: true } });
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

        const ok = await bcrypt.compare(senha, usuario.senha);
        if (!ok) return res.status(401).json({ error: "Senha incorreta." });

        return res.status(200).json({
            message: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                empresaId: usuario.empresaId,
                empresaNome: usuario.empresa?.nome || "",
            },
        });
    } catch (e) {
        console.error("Erro no login:", e);
        return res.status(500).json({ error: "Falha ao realizar login." });
    }
};

const read = async (_req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({ include: { empresa: true }, orderBy: { nome: "asc" } });
        return res.status(200).json(usuarios);
    } catch (e) {
        console.error("Erro ao listar usuários:", e);
        return res.status(500).json({ error: "Falha ao listar usuários." });
    }
};

const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, senha } = req.body;

        const u = await prisma.usuario.findUnique({ where: { id } });
        if (!u) return res.status(404).json({ error: "Usuário não encontrado." });

        const senhaHash = senha ? await bcrypt.hash(senha, 10) : u.senha;
        const atualizado = await prisma.usuario.update({ where: { id }, data: { nome, email, senha: senhaHash } });

        return res.status(200).json({ message: "Usuário atualizado com sucesso!", data: atualizado });
    } catch (e) {
        console.error("Erro ao atualizar usuário:", e);
        return res.status(500).json({ error: "Falha ao atualizar usuário." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const u = await prisma.usuario.findUnique({ where: { id } });
        if (!u) return res.status(404).json({ error: "Usuário não encontrado." });

        await prisma.usuario.delete({ where: { id } });
        return res.status(200).json({ message: "Usuário removido com sucesso!" });
    } catch (e) {
        console.error("Erro ao remover usuário:", e);
        return res.status(500).json({ error: "Falha ao remover usuário." });
    }
};

module.exports = { signup, create, login, read, update, remove };
