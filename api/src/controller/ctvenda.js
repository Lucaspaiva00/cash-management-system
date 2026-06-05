const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// =====================================================
// LISTAR VENDAS
// =====================================================

const read = async (req, res) => {
    try {

        const empresaId = parseInt(req.query.empresaId);

        const { inicio, fim } = req.query;

        if (!empresaId) {
            return res.status(400).json({
                error: "Informe o ID da empresa."
            });
        }

        const where = {
            empresaId
        };

        if (inicio && fim) {

            where.data = {
                gte: new Date(inicio),
                lte: new Date(fim)
            };

        }

        const vendas = await prisma.venda.findMany({
            where,
            orderBy: {
                id: "desc"
            },
            select: {
                id: true,
                total: true,
                statusNfe: true
            }
        });

        return res.status(200).json(vendas);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao listar vendas."
        });

    }
};

// =====================================================
// CRIAR VENDA
// =====================================================

const create = async (req, res) => {

    try {

        const {
            empresaId,
            clienteId,
            meioPagamento,
            itens,

            desconto = 0,
            frete = 0,
            seguro = 0,
            outrasDespesas = 0,

            observacoes
        } = req.body;

        if (!empresaId || !itens?.length) {

            return res.status(400).json({
                error: "Dados incompletos."
            });

        }

        const produtos = await prisma.produto.findMany({
            where: {
                id: {
                    in: itens.map(i => Number(i.produtoId))
                }
            }
        });

        let totalItens = 0;

        const itensProcessados = [];

        for (const item of itens) {

            const produto = produtos.find(
                p => p.id === Number(item.produtoId)
            );

            if (!produto) {

                throw new Error(
                    `Produto ID ${item.produtoId} não encontrado.`
                );

            }

            if (produto.estoque < item.quantidade) {

                throw new Error(
                    `Estoque insuficiente para ${produto.nome}.`
                );

            }

            const subtotal =
                Number(item.quantidade) *
                Number(produto.precoVenda);

            totalItens += subtotal;

            itensProcessados.push({

                produtoId: produto.id,

                quantidade: Number(item.quantidade),

                precoUnitario: Number(produto.precoVenda),

                subtotal,

                desconto: 0,

                acrescimo: 0,

                ncm: produto.ncm,

                cest: produto.cest,

                cfop: produto.cfop,

                aliquotaIcms: produto.aliquotaIcms,

                aliquotaPis: produto.aliquotaPis,

                aliquotaCofins: produto.aliquotaCofins,

                aliquotaIpi: produto.aliquotaIpi
            });

        }

        const total =
            totalItens -
            Number(desconto) +
            Number(frete) +
            Number(seguro) +
            Number(outrasDespesas);

        const venda = await prisma.$transaction(

            async (tx) => {

                const novaVenda =
                    await tx.venda.create({

                        data: {

                            empresaId:
                                Number(empresaId),

                            clienteId:
                                clienteId
                                    ? Number(clienteId)
                                    : null,

                            meioPagamento,

                            total,

                            desconto:
                                Number(desconto),

                            frete:
                                Number(frete),

                            seguro:
                                Number(seguro),

                            outrasDespesas:
                                Number(outrasDespesas),

                            observacoes,

                            statusNfe:
                                "PENDENTE",

                            itens: {
                                create:
                                    itensProcessados
                            }

                        },

                        include: {
                            cliente: true,
                            itens: true
                        }

                    });

                for (const item of itens) {

                    await tx.produto.update({

                        where: {
                            id:
                                Number(
                                    item.produtoId
                                )
                        },

                        data: {

                            estoque: {
                                decrement:
                                    Number(
                                        item.quantidade
                                    )
                            }

                        }

                    });

                }

                await tx.caixa.create({

                    data: {

                        empresaId:
                            Number(empresaId),

                        tipoOperacao:
                            "ENTRADA",

                        meioPagamento,

                        valor: total,

                        descricao:
                            `Venda PDV #${novaVenda.id}`

                    }

                });

                return novaVenda;

            }

        );

        return res.status(201).json({

            message:
                "✅ Venda registrada com sucesso!",

            data: venda

        });

    } catch (error) {

        console.error(error);

        return res.status(400).json({

            error:
                error.message ||
                "Erro ao registrar venda."

        });

    }

};

// =====================================================
// EXCLUIR VENDA
// =====================================================

const remove = async (req, res) => {

    try {

        const id =
            parseInt(req.params.id);

        await prisma.venda.delete({
            where: { id }
        });

        return res.status(200).json({
            message:
                "Venda excluída com sucesso!"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao excluir venda."
        });

    }

};

// =====================================================
// RESUMO
// =====================================================

const resumo = async (req, res) => {

    try {

        const empresaId =
            parseInt(req.query.empresaId);

        if (!empresaId) {

            return res.status(400).json({
                error:
                    "Informe o ID da empresa."
            });

        }

        const agora = new Date();

        const inicioDia =
            new Date(
                agora.getFullYear(),
                agora.getMonth(),
                agora.getDate(),
                0, 0, 0
            );

        const fimDia =
            new Date(
                agora.getFullYear(),
                agora.getMonth(),
                agora.getDate(),
                23, 59, 59
            );

        const inicioMes =
            new Date(
                agora.getFullYear(),
                agora.getMonth(),
                1
            );

        const fimMes =
            new Date(
                agora.getFullYear(),
                agora.getMonth() + 1,
                0,
                23, 59, 59
            );

        const inicioAno =
            new Date(
                agora.getFullYear(),
                0,
                1
            );

        const fimAno =
            new Date(
                agora.getFullYear(),
                11,
                31,
                23, 59, 59
            );

        const [dia, mes, ano] =
            await Promise.all([

                prisma.venda.aggregate({
                    where: {
                        empresaId,
                        data: {
                            gte: inicioDia,
                            lte: fimDia
                        }
                    },
                    _sum: {
                        total: true
                    },
                    _count: {
                        id: true
                    }
                }),

                prisma.venda.aggregate({
                    where: {
                        empresaId,
                        data: {
                            gte: inicioMes,
                            lte: fimMes
                        }
                    },
                    _sum: {
                        total: true
                    },
                    _count: {
                        id: true
                    }
                }),

                prisma.venda.aggregate({
                    where: {
                        empresaId,
                        data: {
                            gte: inicioAno,
                            lte: fimAno
                        }
                    },
                    _sum: {
                        total: true
                    },
                    _count: {
                        id: true
                    }
                })

            ]);

        res.status(200).json({
            dia,
            mes,
            ano
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Erro ao gerar resumo de vendas."
        });

    }

};

module.exports = {
    create,
    read,
    remove,
    resumo
};