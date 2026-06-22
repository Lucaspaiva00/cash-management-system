import { prisma } from "../database/prisma";

export async function limparBanco(req, res) {
    try {
        await prisma.vendaItem.deleteMany();
        await prisma.venda.deleteMany();
        await prisma.movimentacao.deleteMany();
        await prisma.caixa.deleteMany();
        await prisma.proposta.deleteMany();
        await prisma.produto.deleteMany();
        await prisma.cliente.deleteMany();
        await prisma.usuario.deleteMany();
        await prisma.empresa.deleteMany();

        return res.json({
            sucesso: true,
            mensagem: "Banco limpo com sucesso"
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}