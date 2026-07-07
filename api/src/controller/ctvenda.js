const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function montarDescricaoVendaPdv(vendaId, itensResumo) {

    const partes = itensResumo.map(item =>
        item.quantidade > 1
            ? `${item.nome} x${item.quantidade}`
            : item.nome
    );

    let produtos = partes.join(", ");

    if (produtos.length > 200) {
        produtos = `${produtos.slice(0, 197)}...`;
    }

    return produtos
        ? `Venda PDV #${vendaId} - ${produtos}`
        : `Venda PDV #${vendaId}`;

}

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
                data: true,
                total: true,
                custoTotal: true,
                lucro: true,
                meioPagamento: true,
                statusNfe: true,
                numeroNota: true,
                serieNota: true,
                chaveNfe: true,
                protocoloNfe: true,
                cliente: {
                    select: {
                        id: true,
                        nome: true
                    }
                },
                itens: {
                    select: {
                        quantidade: true,
                        produto: {
                            select: {
                                nome: true
                            }
                        }
                    }
                }
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
        let custoTotal = 0;

        const itensProcessados = [];
        const itensResumo = [];

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

            const quantidade = Number(item.quantidade);
            const precoVenda = Number(produto.precoVenda);
            const custoUnitario = Number(produto.precoCompra || 0);

            const subtotal = quantidade * precoVenda;

            totalItens += subtotal;
            custoTotal += quantidade * custoUnitario;

            itensProcessados.push({

                produtoId: produto.id,

                quantidade,

                precoUnitario: precoVenda,

                custoUnitario,

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

            itensResumo.push({
                nome: produto.nome,
                quantidade
            });

        }

        const total =
            totalItens -
            Number(desconto) +
            Number(frete) +
            Number(seguro) +
            Number(outrasDespesas);

        const lucro = total - custoTotal;

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

                            custoTotal,

                            lucro,

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

                        clienteId:
                            clienteId
                                ? Number(clienteId)
                                : null,

                        tipoOperacao:
                            "ENTRADA",

                        meioPagamento,

                        valor: total,

                        descricao:
                            montarDescricaoVendaPdv(
                                novaVenda.id,
                                itensResumo
                            ),

                        status: "PAGO",

                        dataPagamento: new Date(),

                        dataVencimento: new Date(),

                        jurosMaquina: 0,

                        observacoes:
                            `lucro=${lucro.toFixed(2)};custo=${custoTotal.toFixed(2)}`

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
                        total: true,
                        lucro: true,
                        custoTotal: true
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
                        total: true,
                        lucro: true,
                        custoTotal: true
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
                        total: true,
                        lucro: true,
                        custoTotal: true
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