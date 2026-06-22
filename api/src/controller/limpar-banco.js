const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const limparBanco = async (req, res) => {
    try {

        await prisma.vendaItem.deleteMany();
        await prisma.venda.deleteMany();

        await prisma.caixa.deleteMany();

        await prisma.agenda.deleteMany();

        await prisma.proposta.deleteMany();

        await prisma.produto.deleteMany();

        await prisma.cliente.deleteMany();

        await prisma.configuracaoFiscal.deleteMany();

        await prisma.categoriaFinanceira.deleteMany();

        await prisma.centroCusto.deleteMany();

        await prisma.usuario.deleteMany();

        await prisma.empresa.deleteMany();

        return res.status(200).json({
            message: "Banco limpo com sucesso!"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    limparBanco
};