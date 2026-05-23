const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/*
|--------------------------------------------------------------------------
| CRIAR MOVIMENTAÇÃO
|--------------------------------------------------------------------------
*/

const create = async (req, res) => {

    try {

        const {
            tipoOperacao,
            meioPagamento,
            descricao,
            valor,
            valorPago,
            dataOperacao,
            dataVencimento,
            dataPagamento,
            status,
            empresaId,
            clienteId,
            categoriaId,
            centroCustoId,
            fornecedor,
            recorrente,
            tipoRecorrencia,
            parcelas,
            observacoes,
            jurosMaquina,
            comprovanteUrl
        } = req.body;

        if (
            !tipoOperacao ||
            !valor ||
            !empresaId
        ) {

            return res.status(400).json({
                error: "Campos obrigatórios ausentes."
            });

        }

        const qtdParcelas =
            parseInt(parcelas || 1);

        const valorParcela =
            Number(valor) / qtdParcelas;

        const operacoesCriadas = [];

        for (
            let parcelaAtual = 1;
            parcelaAtual <= qtdParcelas;
            parcelaAtual++
        ) {

            const dataBase =
                dataOperacao
                    ? new Date(dataOperacao)
                    : new Date();

            dataBase.setMonth(
                dataBase.getMonth() +
                (parcelaAtual - 1)
            );

            const operacao =
                await prisma.caixa.create({

                    data: {

                        tipoOperacao,

                        meioPagamento:
                            meioPagamento || null,

                        descricao,

                        valor:
                            parseFloat(
                                valorParcela.toFixed(2)
                            ),

                        valorPago:
                            valorPago
                                ? parseFloat(valorPago)
                                : null,

                        dataOperacao:
                            dataBase,

                        dataVencimento:
                            dataVencimento
                                ? new Date(
                                    dataVencimento
                                )
                                : dataBase,

                        dataPagamento:
                            dataPagamento
                                ? new Date(
                                    dataPagamento
                                )
                                : null,

                        status:
                            status || "PENDENTE",

                        empresaId:
                            parseInt(
                                empresaId
                            ),

                        clienteId:
                            clienteId
                                ? parseInt(
                                    clienteId
                                )
                                : null,

                        categoriaId:
                            categoriaId
                                ? parseInt(
                                    categoriaId
                                )
                                : null,

                        centroCustoId:
                            centroCustoId
                                ? parseInt(
                                    centroCustoId
                                )
                                : null,

                        fornecedor,

                        recorrente:
                            recorrente || false,

                        tipoRecorrencia:
                            tipoRecorrencia ||
                            "NENHUMA",

                        parcelas:
                            qtdParcelas,

                        parcelaAtual,

                        observacoes,

                        jurosMaquina:
                            jurosMaquina
                                ? parseFloat(
                                    jurosMaquina
                                )
                                : 0,

                        comprovanteUrl
                    }
                });

            operacoesCriadas.push(
                operacao
            );
        }

        return res.status(201).json({

            message:
                qtdParcelas > 1
                    ? `${qtdParcelas} parcelas criadas com sucesso.`
                    : "Movimentação criada com sucesso.",

            data:
                operacoesCriadas
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao criar movimentação."
        });

    }

};

/*
|--------------------------------------------------------------------------
| LISTAR MOVIMENTAÇÕES
|--------------------------------------------------------------------------
*/

const read = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const {
            inicio,
            fim,
            status,
            categoriaId,
            centroCustoId
        } = req.query;

        if (!empresaId) {

            return res.status(400).json({
                error:
                    "Informe o ID da empresa."
            });

        }

        const where = {
            empresaId
        };

        if (
            inicio &&
            fim
        ) {

            where.dataOperacao = {

                gte:
                    new Date(
                        inicio
                    ),

                lte:
                    new Date(
                        fim
                    )
            };

        }

        if (status) {

            where.status =
                status;

        }

        if (categoriaId) {

            where.categoriaId =
                parseInt(
                    categoriaId
                );

        }

        if (centroCustoId) {

            where.centroCustoId =
                parseInt(
                    centroCustoId
                );

        }

        const lista =
            await prisma.caixa.findMany({

                where,

                orderBy: {
                    dataOperacao:
                        "desc"
                },

                include: {

                    cliente: true,

                    categoria: true,

                    centroCusto: true
                }
            });

        return res.status(200).json(
            lista
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao listar movimentações."
        });

    }

};

/*
|--------------------------------------------------------------------------
| ATUALIZAR MOVIMENTAÇÃO
|--------------------------------------------------------------------------
*/

const update = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        const existe =
            await prisma.caixa.findUnique({

                where: {
                    id
                }
            });

        if (!existe) {

            return res.status(404).json({
                error:
                    "Movimentação não encontrada."
            });

        }

        const dados =
            req.body;

        const atualizada =
            await prisma.caixa.update({

                where: {
                    id
                },

                data: {

                    tipoOperacao:
                        dados.tipoOperacao,

                    meioPagamento:
                        dados.meioPagamento,

                    descricao:
                        dados.descricao ?? undefined,

                    valor:
                        parseFloat(
                            dados.valor
                        ),

                    valorPago:
                        dados.valorPago
                            ? parseFloat(
                                dados.valorPago
                            )
                            : null,

                    dataOperacao:
                        dados.dataOperacao
                            ? new Date(
                                dados.dataOperacao
                            )
                            : undefined,

                    dataVencimento:
                        dados.dataVencimento
                            ? new Date(
                                dados.dataVencimento
                            )
                            : null,

                    dataPagamento:
                        dados.dataPagamento
                            ? new Date(
                                dados.dataPagamento
                            )
                            : null,

                    status:
                        dados.status,

                    clienteId:
                        dados.clienteId !== undefined
                            ? (
                                dados.clienteId
                                    ? parseInt(dados.clienteId)
                                    : null
                            )
                            : undefined,

                    categoriaId:
                        dados.categoriaId !== undefined
                            ? (
                                dados.categoriaId
                                    ? parseInt(dados.categoriaId)
                                    : null
                            )
                            : undefined,

                    centroCustoId:
                        dados.centroCustoId !== undefined
                            ? (
                                dados.centroCustoId
                                    ? parseInt(dados.centroCustoId)
                                    : null
                            )
                            : undefined,

                    fornecedor:
                        dados.fornecedor ?? undefined,

                    recorrente:
                        dados.recorrente,

                    tipoRecorrencia:
                        dados.tipoRecorrencia,

                    observacoes:
                        dados.observacoes ?? undefined,

                    jurosMaquina:
                        dados.jurosMaquina
                            ? parseFloat(
                                dados.jurosMaquina
                            )
                            : 0,

                    comprovanteUrl:
                        dados.comprovanteUrl
                }
            });

        return res.status(200).json({

            message:
                "Movimentação atualizada com sucesso.",

            data:
                atualizada
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao atualizar movimentação."
        });

    }

};

/*
|--------------------------------------------------------------------------
| EXCLUIR MOVIMENTAÇÃO
|--------------------------------------------------------------------------
*/

const remove = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        await prisma.caixa.delete({

            where: {
                id
            }
        });

        return res.status(200).json({

            message:
                "Movimentação excluída com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao excluir movimentação."
        });

    }

};

const marcarComoPaga = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        const operacao =
            await prisma.caixa.update({

                where: {
                    id
                },

                data: {

                    status: "PAGO",

                    dataPagamento:
                        new Date()
                }
            });

        return res.status(200).json({

            message:
                "Conta marcada como paga.",

            data:
                operacao
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao marcar conta como paga."
        });

    }

};

const cancelar = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        const operacao =
            await prisma.caixa.update({

                where: {
                    id
                },

                data: {

                    status:
                        "CANCELADO"
                }
            });

        return res.status(200).json({

            message:
                "Lançamento cancelado.",

            data:
                operacao
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao cancelar lançamento."
        });

    }

};

const resumoFinanceiro = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const operacoes =
            await prisma.caixa.findMany({

                where: {
                    empresaId
                }
            });

        const entradas =
            operacoes
                .filter(
                    o =>
                        o.tipoOperacao ===
                        "ENTRADA"
                )
                .reduce(
                    (a, b) =>
                        a + b.valor,
                    0
                );

        const saidas =
            operacoes
                .filter(
                    o =>
                        o.tipoOperacao ===
                        "SAIDA"
                )
                .reduce(
                    (a, b) =>
                        a + b.valor,
                    0
                );

        return res.status(200).json({

            entradas,

            saidas,

            saldo:
                entradas -
                saidas
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao gerar resumo financeiro."
        });

    }

};

const dashboard = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const operacoes =
            await prisma.caixa.findMany({

                where: {
                    empresaId
                }
            });

        const totalEntradas =
            operacoes
                .filter(
                    x =>
                        x.tipoOperacao ===
                        "ENTRADA"
                )
                .reduce(
                    (a, b) =>
                        a + b.valor,
                    0
                );

        const totalSaidas =
            operacoes
                .filter(
                    x =>
                        x.tipoOperacao ===
                        "SAIDA"
                )
                .reduce(
                    (a, b) =>
                        a + b.valor,
                    0
                );

        const pendentes =
            operacoes.filter(
                x =>
                    x.status ===
                    "PENDENTE"
            ).length;

        const atrasadas =
            operacoes.filter(
                x =>
                    x.status ===
                    "ATRASADO"
            ).length;

        return res.status(200).json({

            totalEntradas,

            totalSaidas,

            saldo:
                totalEntradas -
                totalSaidas,

            pendentes,

            atrasadas
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao gerar dashboard."
        });

    }

};

module.exports = {
    create,
    read,
    update,
    remove,
    marcarComoPaga,
    cancelar,
    resumoFinanceiro,
    dashboard
};