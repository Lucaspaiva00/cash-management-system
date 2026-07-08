const { PrismaClient } = require("@prisma/client");
const ExcelJS = require("exceljs");

const prisma = new PrismaClient();


const relatorioEntradas = async (req, res) => {

    try {

        const empresaId = parseInt(req.query.empresaId);

        const {
            inicio,
            fim
        } = req.query;

        if (!empresaId) {

            return res.status(400).json({
                error: "Informe a empresa."
            });

        }

        const where = {

            empresaId,

            tipoOperacao: "ENTRADA"

        };

        if (inicio && fim) {

            where.dataOperacao = {

                gte: new Date(inicio),

                lte: new Date(fim)

            };

        }

        const movimentacoes =
            await prisma.caixa.findMany({

                where,

                include: {

                    cliente: true,

                    categoria: true,

                    centroCusto: true

                },

                orderBy: {

                    dataOperacao: "desc"

                }

            });

        const total =
            movimentacoes.reduce(

                (soma, item) => soma + Number(item.valor),

                0

            );

        return res.status(200).json({

            quantidade:

                movimentacoes.length,

            total,

            movimentacoes

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            error: "Erro ao gerar relatório."

        });

    }

};

const relatorioSaidas = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const {
            inicio,
            fim
        } = req.query;

        if (!empresaId) {

            return res.status(400).json({
                error:
                    "Informe o ID da empresa."
            });

        }

        const where = {

            empresaId,

            tipoOperacao:
                "SAIDA"

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

        const movimentacoes =
            await prisma.caixa.findMany({

                where,

                include: {

                    cliente: true,

                    categoria: true,

                    centroCusto: true

                },

                orderBy: {

                    dataOperacao:
                        "desc"

                }

            });

        const total =
            movimentacoes.reduce(

                (soma, item) =>

                    soma +
                    Number(item.valor),

                0

            );

        return res.status(200).json({

            quantidade:
                movimentacoes.length,

            total,

            movimentacoes

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            error:
                "Erro ao gerar relatório de saídas."

        });

    }

};


const relatorioClientes = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const {
            inicio,
            fim
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

        const movimentacoes =
            await prisma.caixa.findMany({

                where,

                include: {

                    cliente: true,

                    categoria: true,

                    centroCusto: true

                },

                orderBy: {

                    dataOperacao:
                        "desc"

                }

            });

        const clientes = {};

        movimentacoes.forEach(

            movimentacao => {

                const clienteId =
                    movimentacao.cliente?.id || 0;

                const nomeCliente =
                    movimentacao.cliente?.nome ||
                    "Sem cliente";

                if (!clientes[clienteId]) {

                    clientes[clienteId] = {

                        clienteId,

                        nome:

                            nomeCliente,

                        entradas: 0,

                        saidas: 0,

                        saldo: 0,

                        quantidadeMovimentacoes: 0,

                        movimentacoes: []

                    };

                }

                if (
                    movimentacao.tipoOperacao ===
                    "ENTRADA"
                ) {

                    clientes[clienteId].entradas +=
                        Number(
                            movimentacao.valor
                        );

                }

                if (
                    movimentacao.tipoOperacao ===
                    "SAIDA"
                ) {

                    clientes[clienteId].saidas +=
                        Number(
                            movimentacao.valor
                        );

                }

                clientes[clienteId].saldo =
                    clientes[clienteId].entradas -
                    clientes[clienteId].saidas;

                clientes[clienteId].quantidadeMovimentacoes++;

                clientes[clienteId].movimentacoes.push({

                    id:
                        movimentacao.id,

                    dataOperacao:
                        movimentacao.dataOperacao,

                    tipoOperacao:
                        movimentacao.tipoOperacao,

                    descricao:
                        movimentacao.descricao,

                    categoria:
                        movimentacao.categoria,

                    centroCusto:
                        movimentacao.centroCusto,

                    valor:
                        movimentacao.valor,

                    status:
                        movimentacao.status,

                    meioPagamento:
                        movimentacao.meioPagamento

                });

            }

        );

        const resultado =
            Object.values(
                clientes
            );

        resultado.sort(

            (a, b) =>

                a.nome.localeCompare(
                    b.nome
                )

        );

        return res.status(200).json({

            quantidadeClientes:

                resultado.length,

            clientes:

                resultado

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            error:
                "Erro ao gerar relatório por clientes."

        });

    }

};
/*
|--------------------------------------------------------------------------
| EXPORTAR RELATÓRIO DE ENTRADAS
|--------------------------------------------------------------------------
*/

const exportarEntradas = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const {
            inicio,
            fim
        } = req.query;

        if (!empresaId) {

            return res.status(400).json({
                error:
                    "Informe o ID da empresa."
            });

        }

        const where = {

            empresaId,

            tipoOperacao:
                "ENTRADA"

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

        const movimentacoes =
            await prisma.caixa.findMany({

                where,

                include: {

                    cliente: true,

                    categoria: true,

                    centroCusto: true

                },

                orderBy: {

                    dataOperacao:
                        "desc"

                }

            });

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "Paiva Tech";

        workbook.created =
            new Date();

        const worksheet =
            workbook.addWorksheet(
                "Relatório de Entradas"
            );

        worksheet.columns = [

            {
                header: "Data",
                key: "data",
                width: 18
            },

            {
                header: "Descrição",
                key: "descricao",
                width: 40
            },

            {
                header: "Cliente",
                key: "cliente",
                width: 30
            },

            {
                header: "Categoria",
                key: "categoria",
                width: 25
            },

            {
                header: "Centro de Custo",
                key: "centro",
                width: 25
            },

            {
                header: "Forma Pagamento",
                key: "pagamento",
                width: 20
            },

            {
                header: "Status",
                key: "status",
                width: 18
            },

            {
                header: "Valor",
                key: "valor",
                width: 18
            }

        ];

        worksheet.getRow(1).font = {

            bold: true,

            color: {
                argb: "FFFFFFFF"
            }

        };

        worksheet.getRow(1).fill = {

            type: "pattern",

            pattern: "solid",

            fgColor: {
                argb: "1F4E78"
            }

        };

        let total = 0;

        movimentacoes.forEach(

            item => {

                total +=
                    Number(
                        item.valor
                    );

                worksheet.addRow({

                    data:

                        item.dataOperacao
                            ? new Date(item.dataOperacao)
                                .toLocaleDateString("pt-BR")
                            : "",

                    descricao:

                        item.descricao ||

                        "",

                    cliente:

                        item.cliente?.nome ||

                        "-",

                    categoria:

                        item.categoria?.nome ||

                        "-",

                    centro:

                        item.centroCusto?.nome ||

                        "-",

                    pagamento:

                        item.meioPagamento ||

                        "-",

                    status:

                        item.status ||

                        "-",

                    valor:

                        Number(
                            item.valor
                        )

                });

            }

        );

        worksheet.addRow([]);

        const totalRow =
            worksheet.addRow({

                status:
                    "TOTAL",

                valor:
                    total

            });

        totalRow.font = {

            bold: true

        };

        worksheet.getColumn("valor").numFmt =
            '"R$" #,##0.00';

        res.setHeader(

            "Content-Type",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        );

        res.setHeader(

            "Content-Disposition",

            'attachment; filename="relatorio-entradas.xlsx"'

        );

        await workbook.xlsx.write(res);

        return res.end();

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            error:

                "Erro ao exportar relatório."

        });

    }

};

/*
|--------------------------------------------------------------------------
| EXPORTAR RELATÓRIO DE SAÍDAS
|--------------------------------------------------------------------------
*/

const exportarSaidas = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const {
            inicio,
            fim
        } = req.query;

        if (!empresaId) {

            return res.status(400).json({
                error:
                    "Informe o ID da empresa."
            });

        }

        const where = {

            empresaId,

            tipoOperacao:
                "SAIDA"

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

        const movimentacoes =
            await prisma.caixa.findMany({

                where,

                include: {

                    cliente: true,

                    categoria: true,

                    centroCusto: true

                },

                orderBy: {

                    dataOperacao:
                        "desc"

                }

            });

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "Paiva Tech";

        workbook.created =
            new Date();

        const worksheet =
            workbook.addWorksheet(
                "Relatório de Saídas"
            );

        worksheet.columns = [

            {
                header: "Data",
                key: "data",
                width: 18
            },

            {
                header: "Descrição",
                key: "descricao",
                width: 40
            },

            {
                header: "Cliente",
                key: "cliente",
                width: 30
            },

            {
                header: "Categoria",
                key: "categoria",
                width: 25
            },

            {
                header: "Centro de Custo",
                key: "centro",
                width: 25
            },

            {
                header: "Forma Pagamento",
                key: "pagamento",
                width: 20
            },

            {
                header: "Status",
                key: "status",
                width: 18
            },

            {
                header: "Valor",
                key: "valor",
                width: 18
            }

        ];

        worksheet.getRow(1).font = {

            bold: true,

            color: {
                argb: "FFFFFFFF"
            }

        };

        worksheet.getRow(1).fill = {

            type: "pattern",

            pattern: "solid",

            fgColor: {
                argb: "C00000"
            }

        };

        let total = 0;

        movimentacoes.forEach(

            item => {

                total +=
                    Number(
                        item.valor
                    );

                worksheet.addRow({

                    data:

                        item.dataOperacao
                            ? new Date(item.dataOperacao)
                                .toLocaleDateString("pt-BR")
                            : "",

                    descricao:

                        item.descricao ||

                        "",

                    cliente:

                        item.cliente?.nome ||

                        "-",

                    categoria:

                        item.categoria?.nome ||

                        "-",

                    centro:

                        item.centroCusto?.nome ||

                        "-",

                    pagamento:

                        item.meioPagamento ||

                        "-",

                    status:

                        item.status ||

                        "-",

                    valor:

                        Number(
                            item.valor
                        )

                });

            }

        );

        worksheet.addRow([]);

        const totalRow =
            worksheet.addRow({

                status:
                    "TOTAL",

                valor:
                    total

            });

        totalRow.font = {

            bold: true

        };

        worksheet.getColumn("valor").numFmt =
            '"R$" #,##0.00';

        res.setHeader(

            "Content-Type",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        );

        res.setHeader(

            "Content-Disposition",

            'attachment; filename="relatorio-saidas.xlsx"'

        );

        await workbook.xlsx.write(res);

        return res.end();

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            error:

                "Erro ao exportar relatório."

        });

    }

};


const exportarClientes = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const {
            inicio,
            fim
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

        const movimentacoes =
            await prisma.caixa.findMany({

                where,

                include: {

                    cliente: true

                },

                orderBy: {

                    dataOperacao:
                        "desc"

                }

            });

        const clientes = {};

        movimentacoes.forEach(

            movimentacao => {

                const clienteId =
                    movimentacao.cliente?.id || 0;

                const nomeCliente =
                    movimentacao.cliente?.nome ||
                    "Sem cliente";

                if (!clientes[clienteId]) {

                    clientes[clienteId] = {

                        clienteId,

                        nome:
                            nomeCliente,

                        entradas: 0,

                        saidas: 0,

                        saldo: 0,

                        quantidadeMovimentacoes: 0

                    };

                }

                if (
                    movimentacao.tipoOperacao ===
                    "ENTRADA"
                ) {

                    clientes[clienteId].entradas +=
                        Number(
                            movimentacao.valor
                        );

                }

                if (
                    movimentacao.tipoOperacao ===
                    "SAIDA"
                ) {

                    clientes[clienteId].saidas +=
                        Number(
                            movimentacao.valor
                        );

                }

                clientes[clienteId].saldo =
                    clientes[clienteId].entradas -
                    clientes[clienteId].saidas;

                clientes[clienteId].quantidadeMovimentacoes++;

            }

        );

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "Paiva Tech";

        workbook.created =
            new Date();

        const worksheet =
            workbook.addWorksheet(
                "Relatório de Clientes"
            );

        worksheet.columns = [

            {
                header: "Cliente",
                key: "cliente",
                width: 35
            },

            {
                header: "Entradas",
                key: "entradas",
                width: 18
            },

            {
                header: "Saídas",
                key: "saidas",
                width: 18
            },

            {
                header: "Saldo",
                key: "saldo",
                width: 18
            },

            {
                header: "Movimentações",
                key: "movimentacoes",
                width: 18
            }

        ];

        worksheet.getRow(1).font = {

            bold: true,

            color: {
                argb: "FFFFFFFF"
            }

        };

        worksheet.getRow(1).fill = {

            type: "pattern",

            pattern: "solid",

            fgColor: {
                argb: "1F4E78"
            }

        };

        Object.values(clientes)

            .sort(

                (a, b) =>

                    a.nome.localeCompare(
                        b.nome
                    )

            )

            .forEach(

                cliente => {

                    worksheet.addRow({

                        cliente:
                            cliente.nome,

                        entradas:
                            cliente.entradas,

                        saidas:
                            cliente.saidas,

                        saldo:
                            cliente.saldo,

                        movimentacoes:
                            cliente.quantidadeMovimentacoes

                    });

                }

            );

        worksheet.getColumn("entradas").numFmt =
            '"R$" #,##0.00';

        worksheet.getColumn("saidas").numFmt =
            '"R$" #,##0.00';

        worksheet.getColumn("saldo").numFmt =
            '"R$" #,##0.00';

        res.setHeader(

            "Content-Type",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        );

        res.setHeader(

            "Content-Disposition",

            'attachment; filename="relatorio-clientes.xlsx"'

        );

        await workbook.xlsx.write(res);

        return res.end();

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            error:
                "Erro ao exportar relatório."

        });

    }

};

module.exports = {

    relatorioEntradas,

    relatorioSaidas,

    relatorioClientes,

    exportarEntradas,

    exportarSaidas,

    exportarClientes

};