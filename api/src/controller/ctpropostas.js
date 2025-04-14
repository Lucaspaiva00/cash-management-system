const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const create = async (req, res) => {
    try {
        const prop = await prisma.proposta.create({
            data: req.body
        })

        res.status(201).json(prop).end()
    } catch (error) {
        console.log(error);

        res.status(400).end()
    }
}

const read = async (req, res) => {
    const prop = await prisma.proposta.findMany()
    return res.json(prop)
}

const update = async (req, res) => {
    try {
        const prop = await prisma.proposta.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        })
        return res.status(201).json(prop).end()
    } catch (error) {
        return res.status(400).json(prop)
    }
}

const remove = async (req, res) => {
    try {
        const prop = await prisma.proposta.delete({
            where: { id: parseInt(req.params.id) }
        })
        return res.status(201).json(prop).end()
    } catch (error) {
        return res.status(400).json(prop)
    }
}

module.exports = {
    create,
    read,
    update,
    remove
}