const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const textoValido = (txt) => typeof txt === "string" && txt.trim().length > 0;

/**
 * Criar proposta
 */
const create = async (req, res) => {
    try {
        const {
            numero,
            descricao,
            valorTotal,
            status,
            data,
            clienteId,
            empresaId,
        } = req.body;

        const _empresaId = parseInt(empresaId);
        const _numero = parseInt(numero);
        const _valorTotal = parseFloat(valorTotal);
        const _clienteId = clienteId ? parseInt(clienteId) : null;

        const proposta = await prisma.proposta.create({
            data: {
                numero: _numero,
                descricao: descricao.trim(),
                valorTotal: _valorTotal,
                status: status?.trim() || "Aberto",
                data: data ? new Date(data) : undefined,
                empresaId: _empresaId,
                clienteId: _clienteId,
            },
            include: {
                cliente: { select: { id: true, nome: true } },
            },
        });

        return res
            .status(201)
            .json({ message: "Proposta criada com sucesso!", data: proposta });
    } catch (error) {
        console.error("❌ Erro ao criar proposta:", error);
        return res
            .status(500)
            .json({ error: "Erro interno ao criar proposta.", detalhes: error.message });
    }
};

/**
 * Listar propostas
 */
const read = async (req, res) => {
    try {
        const empresaId = parseInt(req.query.empresaId);
        const { inicio, fim } = req.query;

        if (!empresaId) {
            return res.status(400).json({ error: "empresaId é obrigatório." });
        }

        const where = { empresaId };

        if (inicio && fim) {
            where.data = {
                gte: new Date(inicio),
                lte: new Date(fim),
            };
        }

        const propostas = await prisma.proposta.findMany({
            where,
            include: { cliente: { select: { id: true, nome: true } } },
            orderBy: { data: "desc" },
        });

        return res.status(200).json(propostas);
    } catch (error) {
        console.error("❌ Erro ao listar propostas:", error);
        return res.status(500).json({
            error: "Erro interno ao listar propostas.",
            detalhes: error.message
        });
    }
};
/**
 * Atualizar proposta
 */
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: "ID inválido." });

        const { numero, descricao, valorTotal, status, data, clienteId } = req.body;

        const atualiza = {};
        if (numero) atualiza.numero = parseInt(numero);
        if (valorTotal) atualiza.valorTotal = parseFloat(valorTotal);
        if (descricao) atualiza.descricao = descricao.trim();
        if (status) atualiza.status = status.trim();
        if (data) atualiza.data = new Date(data);
        if (clienteId !== undefined)
            atualiza.clienteId = clienteId ? parseInt(clienteId) : null;

        const proposta = await prisma.proposta.update({
            where: { id },
            data: atualiza,
            include: { cliente: { select: { id: true, nome: true } } },
        });

        return res
            .status(200)
            .json({ message: "Proposta atualizada com sucesso!", data: proposta });
    } catch (error) {
        console.error("❌ Erro ao atualizar proposta:", error);
        return res
            .status(500)
            .json({ error: "Erro interno ao atualizar proposta.", detalhes: error.message });
    }
};

/**
 * Excluir proposta
 */
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: "ID inválido." });

        await prisma.proposta.delete({ where: { id } });
        return res
            .status(200)
            .json({ message: "Proposta excluída com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao excluir proposta:", error);
        return res
            .status(500)
            .json({ error: "Erro interno ao excluir proposta.", detalhes: error.message });
    }
};

// Aprova e transforma a proposta em lançamento financeiro.
const faturar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { empresaId, statusPagamento = "PENDENTE", meioPagamento, dataVencimento, parcelas = 1 } = req.body;
        const proposta = await prisma.proposta.findFirst({ where: { id, empresaId: parseInt(empresaId) } });
        if (!proposta) return res.status(404).json({ error: "Proposta não encontrada." });

        const jaFaturada = await prisma.caixa.findFirst({
            where: { empresaId: proposta.empresaId, descricao: { startsWith: `Proposta #${proposta.numero} faturada` } }
        });
        if (jaFaturada) return res.status(409).json({ error: "Esta proposta já foi faturada." });

        const totalParcelas = Math.max(1, parseInt(parcelas));
        const vencimentoBase = dataVencimento ? new Date(`${dataVencimento}T12:00:00`) : new Date();
        const resultado = await prisma.$transaction(async tx => {
            await tx.proposta.update({ where: { id }, data: { status: "Fechado" } });
            const caixa = await tx.caixa.create({
                data: { empresaId: proposta.empresaId, clienteId: proposta.clienteId, tipoOperacao: "ENTRADA", meioPagamento: meioPagamento || null, valor: proposta.valorTotal, valorPago: statusPagamento === "PAGO" ? proposta.valorTotal : null, descricao: `Proposta #${proposta.numero} faturada - ${proposta.descricao}`, status: statusPagamento, dataPagamento: statusPagamento === "PAGO" ? new Date() : null, dataVencimento: vencimentoBase, parcelas: totalParcelas, observacoes: `Origem: proposta #${proposta.numero}` }
            });
            if (statusPagamento === "PENDENTE") {
                const valorParcela = Number((proposta.valorTotal / totalParcelas).toFixed(2));
                for (let i = 1; i <= totalParcelas; i++) {
                    const vencimento = new Date(vencimentoBase); vencimento.setMonth(vencimento.getMonth() + i - 1);
                    await tx.contaReceber.create({ data: { empresaId: proposta.empresaId, clienteId: proposta.clienteId, descricao: `Proposta #${proposta.numero} - parcela ${i}/${totalParcelas}`, valorOriginal: i === totalParcelas ? Number((proposta.valorTotal - valorParcela * (totalParcelas - 1)).toFixed(2)) : valorParcela, vencimento, parcela: i, totalParcelas } });
                }
            }
            return caixa;
        });
        res.json({ message: statusPagamento === "PAGO" ? "Proposta aprovada e recebida no caixa." : "Proposta aprovada e enviada para Contas a Receber.", data: resultado });
    } catch (error) { console.error(error); res.status(500).json({ error: "Erro ao faturar proposta.", detalhes: error.message }); }
};

module.exports = { create, read, update, remove, faturar };
