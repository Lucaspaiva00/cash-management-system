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
                lancamentoFinanceiro: {
                    select: {
                        id: true,
                        status: true,
                        dataVencimento: true,
                        dataPagamento: true
                    }
                },
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
            observacoes,
            statusPagamento = "PAGO",
            dataVencimento
        } = req.body;

        if (!empresaId || !itens?.length) {

            return res.status(400).json({
                error: "Dados incompletos."
            });

        }

        if (!["PAGO", "PENDENTE"].includes(statusPagamento)) {
            return res.status(400).json({ error: "Situação de pagamento inválida." });
        }

        if (statusPagamento === "PENDENTE" && !clienteId) {
            return res.status(400).json({ error: "Informe o cliente para registrar uma venda pendente." });
        }

        if (statusPagamento === "PENDENTE" && !dataVencimento) {
            return res.status(400).json({ error: "Informe o vencimento da venda pendente." });
        }

        const vencimento = dataVencimento
            ? new Date(`${dataVencimento}T12:00:00`)
            : new Date();

        if (Number.isNaN(vencimento.getTime())) {
            return res.status(400).json({ error: "Data de vencimento inválida." });
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

                    await tx.movimentoEstoque.create({
                        data: {
                            produtoId: Number(item.produtoId), empresaId: Number(empresaId),
                            tipo: "SAIDA", quantidade: Number(item.quantidade),
                            estoqueAnterior: Number(produtos.find(p => p.id === Number(item.produtoId)).estoque),
                            estoquePosterior: Number(produtos.find(p => p.id === Number(item.produtoId)).estoque) - Number(item.quantidade),
                            custoUnitario: Number(produtos.find(p => p.id === Number(item.produtoId)).precoCompra || 0),
                            motivo: `Venda PDV #${novaVenda.id}`, referencia: `VENDA-${novaVenda.id}`
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

                        vendaId: novaVenda.id,

                        tipoOperacao:
                            "ENTRADA",

                        meioPagamento,

                        valor: total,

                        valorPago:
                            statusPagamento === "PAGO"
                                ? total
                                : null,

                        descricao:
                            montarDescricaoVendaPdv(
                                novaVenda.id,
                                itensResumo
                            ),

                        status: statusPagamento,

                        dataPagamento:
                            statusPagamento === "PAGO"
                                ? new Date()
                                : null,

                        dataVencimento: vencimento,

                        jurosMaquina: 0,

                        observacoes:
                            `lucro=${lucro.toFixed(2)};custo=${custoTotal.toFixed(2)}`

                    }

                });

                if (statusPagamento === "PENDENTE") {
                    const qtdParcelas = Math.max(1, Number(req.body.parcelas || 1));
                    const valorParcela = Number((total / qtdParcelas).toFixed(2));
                    for (let parcela = 1; parcela <= qtdParcelas; parcela++) {
                        const vencimentoParcela = new Date(vencimento);
                        vencimentoParcela.setMonth(vencimentoParcela.getMonth() + (parcela - 1));
                        await tx.contaReceber.create({ data: { empresaId: Number(empresaId), clienteId: Number(clienteId), vendaId: novaVenda.id, descricao: `Venda PDV #${novaVenda.id} - parcela ${parcela}/${qtdParcelas}`, valorOriginal: parcela === qtdParcelas ? Number((total - valorParcela * (qtdParcelas - 1)).toFixed(2)) : valorParcela, vencimento: vencimentoParcela, parcela, totalParcelas: qtdParcelas } });
                    }
                }

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
// RECEBER VENDA PENDENTE
// =====================================================

const marcarComoPaga = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const empresaId = Number(req.body.empresaId);

        if (!id || !empresaId) {
            return res.status(400).json({ error: "Venda e empresa são obrigatórias." });
        }

        const venda = await prisma.venda.findFirst({
            where: { id, empresaId },
            include: { lancamentoFinanceiro: true }
        });

        if (!venda) {
            return res.status(404).json({ error: "Venda não encontrada." });
        }

        if (!venda.lancamentoFinanceiro) {
            return res.status(409).json({
                error: "Esta venda antiga não possui lançamento financeiro vinculado. Receba-a pela tela de movimentações."
            });
        }

        if (venda.lancamentoFinanceiro.status === "PAGO") {
            return res.status(200).json({ message: "Venda já estava paga." });
        }

        const lancamento = await prisma.caixa.update({
            where: { id: venda.lancamentoFinanceiro.id },
            data: {
                status: "PAGO",
                valorPago: venda.total,
                dataPagamento: new Date()
            }
        });

        return res.status(200).json({
            message: "Venda recebida com sucesso!",
            data: lancamento
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao receber venda." });
    }
};

// =====================================================
// EXCLUIR VENDA
// =====================================================

const remove = async (req, res) => {

    try {

        const id = parseInt(req.params.id);
        const empresaId = Number(req.body.empresaId);
        const venda = await prisma.venda.findFirst({ where: { id, empresaId }, include: { itens: true, lancamentoFinanceiro: true } });
        if (!venda) return res.status(404).json({ error: "Venda não encontrada." });
        if (venda.statusNfe === "CANCELADA") return res.status(409).json({ error: "Venda já cancelada." });
        await prisma.$transaction(async tx => {
            for (const item of venda.itens) {
                const produto = await tx.produto.update({ where: { id: item.produtoId }, data: { estoque: { increment: item.quantidade } } });
                await tx.movimentoEstoque.create({ data: { produtoId: item.produtoId, empresaId, tipo: "AJUSTE_ESTORNO", quantidade: item.quantidade, estoqueAnterior: produto.estoque - item.quantidade, estoquePosterior: produto.estoque, custoUnitario: item.custoUnitario, motivo: `Estorno da venda #${id}`, referencia: `VENDA-${id}` } });
            }
            await tx.contaReceber.updateMany({ where: { vendaId: id }, data: { status: "CANCELADO" } });
            if (venda.lancamentoFinanceiro) await tx.caixa.update({ where: { id: venda.lancamentoFinanceiro.id }, data: { status: "CANCELADO", observacoes: `Estornado em ${new Date().toISOString()}` } });
            await tx.venda.update({ where: { id }, data: { statusNfe: "CANCELADA", observacoes: `${venda.observacoes || ""} | Venda cancelada.` } });
        });

        return res.status(200).json({
            message:
                "Venda cancelada, financeiro estornado e estoque devolvido."
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
    resumo,
    marcarComoPaga
};
