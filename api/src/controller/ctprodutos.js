const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const prod = await prisma.produtos.create({
            data: req.body
        })
        res.status(201).json(prod).end()
    } catch (error) {
        res.status(400).end()
    }
}

const read = async (req, res) => {
    const prod = await prisma.produtos.findMany()
    return res.json(prod)
}

const update = async (req, res) => {
    try {
        const prod = await prisma.produtos.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        })
        res.status(201).json(prod).end()
    } catch (error) {
        res.status(400).end()
    }
}

const remove = async (req, res) => {
    try {
        const prod = await prisma.produtos.delete({
            where: { id: parseInt(req.params.id) }
        })
        res.status(201).json(prod).end()
    } catch (error) {
        res.status(400).end()
    }
}

module.exports = {
    create,
    read,
    update,
    remove
}