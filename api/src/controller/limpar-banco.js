//Usar somente quando necessario fazer um delete geral, caso contrario, usar os deletes especificos de cada controller, 
//pois o delete geral pode causar perda de dados importantes, como por exemplo, a empresa cadastrada, que é necessaria para o funcionamento do sistema.

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