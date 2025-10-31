const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        if (!empresaId) return res.status(400).json({ error: "Informe o ID da empresa." });

        const vendas = await prisma.venda.findMany({
            where: { empresaId },
            orderBy: { id: "desc" },
            include: {
                cliente: true,
                itens: { include: { produto: true } },
            },
        });

        return res.status(200).json(vendas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao listar vendas." });
    }
};

const create = async (req, res) => {
    try {
        const { empresaId, clienteId, meioPagamento, itens } = req.body;

        if (!empresaId || !itens?.length)
            return res.status(400).json({ error: "Dados incompletos." });

        // Busca os produtos e valida
        const produtos = await prisma.produto.findMany({
            where: { id: { in: itens.map((i) => i.produtoId) } },
        });

        let total = 0;
        for (const item of itens) {
            const produto = produtos.find((p) => p.id === item.produtoId);
            if (!produto) throw new Error(`Produto ID ${item.produtoId} não encontrado.`);
            if (produto.estoque < item.quantidade)
                throw new Error(`Estoque insuficiente para ${produto.nome}.`);
            total += item.quantidade * produto.precoVenda;
        }

        // Transação: cria venda, baixa estoque e registra no caixa
        const venda = await prisma.$transaction(async (tx) => {
            // Cria a venda com os itens
            const novaVenda = await tx.venda.create({
                data: {
                    empresaId: Number(empresaId),
                    clienteId: clienteId ? Number(clienteId) : null,
                    meioPagamento,
                    total,
                    itens: {
                        create: itens.map((i) => ({
                            produtoId: i.produtoId,
                            quantidade: i.quantidade,
                            precoUnitario: produtos.find((p) => p.id === i.produtoId).precoVenda,
                            subtotal:
                                i.quantidade *
                                produtos.find((p) => p.id === i.produtoId).precoVenda,
                        })),
                    },
                },
                include: { itens: true },
            });

            // Dá baixa no estoque
            for (const item of itens) {
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: { estoque: { decrement: item.quantidade } },
                });
            }

            // Registra a entrada no caixa
            await tx.caixa.create({
                data: {
                    empresaId: Number(empresaId),
                    tipoOperacao: "ENTRADA",
                    meioPagamento,
                    valor: total,
                    descricao: `Venda PDV #${novaVenda.id}`,
                },
            });

            return novaVenda;
        });

        return res.status(201).json({
            message: "✅ Venda registrada com sucesso!",
            data: venda,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message || "Erro ao registrar venda." });
    }
};

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.venda.delete({ where: { id } });
        return res.status(200).json({ message: "Venda excluída com sucesso!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao excluir venda." });
    }
};

module.exports = { create, read, remove };
