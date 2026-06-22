const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const limparBanco = async (req, res) => {
    try {
        await prisma.venda.deleteMany();
        await prisma.proposta.deleteMany();
        await prisma.produto.deleteMany();
        await prisma.cliente.deleteMany();
        await prisma.usuario.deleteMany();

        return res.status(200).json({
            message: "Banco de dados limpo com sucesso!"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao limpar o banco de dados."
        });
    }
}

module.exports = {
    limparBanco
};