const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const n = value => Number(value || 0);
const date = value => new Date(`${value}T12:00:00`);

async function listarContas(req, res) {
  try {
    const empresaId = Number(req.query.empresaId);
    const status = req.query.status;
    if (!empresaId) return res.status(400).json({ error: "Informe a empresa." });
    await prisma.contaReceber.updateMany({ where: { empresaId, status: { in: ["PENDENTE", "PARCIAL"] }, vencimento: { lt: new Date() } }, data: { status: "VENCIDO" } });
    const where = { empresaId, ...(status ? { status } : {}) };
    const contas = await prisma.contaReceber.findMany({ where, include: { cliente: { select: { id: true, nome: true } }, recebimentos: true }, orderBy: { vencimento: "asc" } });
    // Mantém visíveis as contas cadastradas antes do módulo profissional.
    const caixaLegado = await prisma.caixa.findMany({ where: { empresaId, tipoOperacao: "ENTRADA", status: { in: ["PENDENTE", "ATRASADO", "PAGO"] }, vendaId: null }, include: { cliente: { select: { id: true, nome: true } } } });
    const contasLegadas = caixaLegado.map(c => ({
      id: -c.id, legado: true, descricao: c.descricao || "Recebimento lançado no caixa",
      valorOriginal: c.valor, valorRecebido: c.status === "PAGO" ? (c.valorPago || c.valor) : 0,
      juros: 0, multa: 0, desconto: 0, vencimento: c.dataVencimento || c.dataOperacao,
      status: c.status === "PAGO" ? "RECEBIDO" : (c.status === "ATRASADO" || (c.dataVencimento && c.dataVencimento < new Date()) ? "VENCIDO" : "PENDENTE"),
      parcela: c.parcelaAtual || 1, totalParcelas: c.parcelas || 1, cliente: c.cliente
    })).filter(c => !status || c.status === status);
    res.json([...contas, ...contasLegadas].sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento)));
  } catch (error) { console.error(error); res.status(500).json({ error: "Erro ao listar contas a receber." }); }
}

async function baixarConta(req, res) {
  try {
    const contaId = req.params.id;
    const { valor, juros = 0, multa = 0, desconto = 0, meioPagamento, observacao, empresaId } = req.body;
    if (Number(contaId) < 0) {
      const caixaId = Math.abs(Number(contaId));
      const legado = await prisma.caixa.findFirst({ where: { id: caixaId, empresaId: Number(empresaId), tipoOperacao: "ENTRADA" } });
      if (!legado) return res.status(404).json({ error: "Conta antiga não encontrada." });
      if (n(valor) !== n(legado.valor)) return res.status(400).json({ error: "Contas antigas devem ser recebidas pelo valor total. Para baixa parcial, crie uma nova conta profissional." });
      const atualizada = await prisma.caixa.update({ where: { id: caixaId }, data: { status: "PAGO", valorPago: n(valor), meioPagamento, dataPagamento: new Date(), observacoes: observacao || legado.observacoes } });
      return res.json({ message: "Conta antiga recebida e atualizada no caixa.", data: atualizada });
    }
    const conta = await prisma.contaReceber.findFirst({ where: { id: Number(contaId), empresaId: Number(empresaId) } });
    if (!conta || conta.status === "CANCELADO") return res.status(404).json({ error: "Conta não encontrada ou cancelada." });
    if (!meioPagamento || n(valor) <= 0) return res.status(400).json({ error: "Informe valor e forma de recebimento." });
    const liquido = n(valor) + n(juros) + n(multa) - n(desconto);
    const saldo = conta.valorOriginal + conta.juros + conta.multa - conta.desconto - conta.valorRecebido;
    if (liquido > saldo + 0.01) return res.status(400).json({ error: `Valor superior ao saldo de R$ ${saldo.toFixed(2)}.` });
    const resultado = await prisma.$transaction(async tx => {
      const novoRecebido = conta.valorRecebido + liquido;
      const quitada = novoRecebido >= conta.valorOriginal + conta.juros + conta.multa - conta.desconto - 0.01;
      const atualizada = await tx.contaReceber.update({ where: { id: Number(contaId) }, data: { valorRecebido: novoRecebido, juros: { increment: n(juros) }, multa: { increment: n(multa) }, desconto: { increment: n(desconto) }, recebidaEm: quitada ? new Date() : null, status: quitada ? "RECEBIDO" : "PARCIAL" } });
      await tx.recebimentoConta.create({ data: { contaId: Number(contaId), valor: n(valor), juros: n(juros), multa: n(multa), desconto: n(desconto), meioPagamento, observacao } });
      await tx.caixa.create({ data: { empresaId: conta.empresaId, clienteId: conta.clienteId, tipoOperacao: "ENTRADA", meioPagamento, valor: liquido, valorPago: liquido, descricao: `Recebimento: ${conta.descricao}`, status: "PAGO", dataPagamento: new Date(), dataVencimento: conta.vencimento, observacoes: observacao } });
      return atualizada;
    });
    res.json({ message: "Recebimento registrado com sucesso.", data: resultado });
  } catch (error) { console.error(error); res.status(500).json({ error: "Erro ao baixar conta." }); }
}

async function abrirCaixa(req, res) {
  try { const { empresaId, usuarioId, valorAbertura, observacao } = req.body; if (!empresaId) return res.status(400).json({ error: "Informe a empresa." }); const aberto = await prisma.sessaoCaixa.findFirst({ where: { empresaId: Number(empresaId), status: "ABERTO" } }); if (aberto) return res.status(409).json({ error: "Já existe um caixa aberto.", data: aberto }); const sessao = await prisma.sessaoCaixa.create({ data: { empresaId: Number(empresaId), usuarioId: usuarioId ? Number(usuarioId) : null, valorAbertura: n(valorAbertura), observacaoAbertura: observacao } }); res.status(201).json({ message: "Caixa aberto.", data: sessao }); } catch (error) { console.error(error); res.status(500).json({ error: "Erro ao abrir caixa." }); }
}

async function statusCaixa(req, res) {
  try {
    const empresaId = Number(req.query.empresaId);
    const sessao = await prisma.sessaoCaixa.findFirst({
      where: { empresaId, status: "ABERTO" }, include: { movimentos: true },
      orderBy: { abertoEm: "desc" }
    });
    res.json({ aberto: Boolean(sessao), data: sessao });
  } catch (error) { console.error(error); res.status(500).json({ error: "Erro ao consultar caixa." }); }
}

async function movimentoCaixa(req, res) {
  try { const { empresaId, tipo, valor, descricao } = req.body; const sessao = await prisma.sessaoCaixa.findFirst({ where: { empresaId: Number(empresaId), status: "ABERTO" } }); if (!sessao) return res.status(409).json({ error: "Abra o caixa antes de registrar sangria ou suprimento." }); const movimento = await prisma.movimentoCaixa.create({ data: { sessaoId: sessao.id, tipo, valor: n(valor), descricao } }); res.status(201).json({ message: "Movimento registrado.", data: movimento }); } catch (error) { console.error(error); res.status(500).json({ error: "Erro no movimento de caixa." }); }
}

async function fecharCaixa(req, res) {
  try { const { empresaId, valorContado, observacao } = req.body; const sessao = await prisma.sessaoCaixa.findFirst({ where: { empresaId: Number(empresaId), status: "ABERTO" }, include: { movimentos: true } }); if (!sessao) return res.status(404).json({ error: "Não há caixa aberto." }); const entradas = await prisma.caixa.aggregate({ where: { empresaId: sessao.empresaId, status: "PAGO", tipoOperacao: "ENTRADA", dataPagamento: { gte: sessao.abertoEm } }, _sum: { valorPago: true } }); const saidas = await prisma.caixa.aggregate({ where: { empresaId: sessao.empresaId, status: "PAGO", tipoOperacao: "SAIDA", dataPagamento: { gte: sessao.abertoEm } }, _sum: { valorPago: true } }); const suprimentos = sessao.movimentos.filter(x => x.tipo === "SUPRIMENTO").reduce((s, x) => s + x.valor, 0); const sangrias = sessao.movimentos.filter(x => x.tipo === "SANGRIA").reduce((s, x) => s + x.valor, 0); const esperado = sessao.valorAbertura + n(entradas._sum.valorPago) - n(saidas._sum.valorPago) + suprimentos - sangrias; const final = await prisma.sessaoCaixa.update({ where: { id: sessao.id }, data: { fechadoEm: new Date(), valorEsperado: esperado, valorContado: n(valorContado), diferenca: n(valorContado) - esperado, observacaoFechamento: observacao, status: "FECHADO" } }); res.json({ message: "Caixa fechado.", data: final }); } catch (error) { console.error(error); res.status(500).json({ error: "Erro ao fechar caixa." }); }
}

async function ajustarEstoque(req, res) {
  try { const produtoId = Number(req.params.id), { empresaId, tipo, quantidade, motivo, custoUnitario } = req.body; const produto = await prisma.produto.findFirst({ where: { id: produtoId, empresaId: Number(empresaId) } }); if (!produto || !motivo || n(quantidade) <= 0) return res.status(400).json({ error: "Produto, quantidade e motivo são obrigatórios." }); const delta = tipo === "ENTRADA" ? n(quantidade) : -n(quantidade); if (produto.estoque + delta < 0) return res.status(400).json({ error: "Estoque não pode ficar negativo." }); const novo = produto.estoque + delta; const result = await prisma.$transaction([prisma.produto.update({ where: { id: produtoId }, data: { estoque: novo, ...(custoUnitario ? { precoCompra: n(custoUnitario) } : {}) } }), prisma.movimentoEstoque.create({ data: { produtoId, empresaId: Number(empresaId), tipo: tipo || "AJUSTE_ESTORNO", quantidade: n(quantidade), estoqueAnterior: produto.estoque, estoquePosterior: novo, custoUnitario: custoUnitario ? n(custoUnitario) : null, motivo } })]); res.json({ message: "Estoque ajustado.", data: result[0] }); } catch (error) { console.error(error); res.status(500).json({ error: "Erro ao ajustar estoque." }); }
}

async function dashboardGerencial(req, res) { try { const empresaId = Number(req.query.empresaId), hoje = new Date(), em30 = new Date(); em30.setDate(hoje.getDate() + 30); const [vendas, recebidas, despesas, contas] = await Promise.all([prisma.venda.aggregate({ where: { empresaId, statusNfe: { not: "CANCELADA" } }, _sum: { total: true, lucro: true } }), prisma.caixa.aggregate({ where: { empresaId, tipoOperacao: "ENTRADA", status: "PAGO" }, _sum: { valorPago: true } }), prisma.caixa.aggregate({ where: { empresaId, tipoOperacao: "SAIDA", status: "PAGO" }, _sum: { valorPago: true } }), prisma.contaReceber.findMany({ where: { empresaId, status: { in: ["PENDENTE", "PARCIAL", "VENCIDO"] } }, select: { valorOriginal: true, valorRecebido: true, vencimento: true } })]); const saldoPendente = contas.reduce((s,c)=>s+c.valorOriginal-c.valorRecebido,0), vencidas=contas.filter(c=>c.vencimento<hoje).reduce((s,c)=>s+c.valorOriginal-c.valorRecebido,0), previsao=contas.filter(c=>c.vencimento<=em30).reduce((s,c)=>s+c.valorOriginal-c.valorRecebido,0); res.json({ faturamento:n(vendas._sum.total), entradasRecebidas:n(recebidas._sum.valorPago), despesas:n(despesas._sum.valorPago), lucro:n(vendas._sum.lucro), contasVencidas:vencidas, contasAVencer:saldoPendente-vencidas, previsaoEntradas30Dias:previsao, previsaoSaldo30Dias:n(recebidas._sum.valorPago)-n(despesas._sum.valorPago)+previsao }); } catch(error) { console.error(error); res.status(500).json({ error:"Erro no dashboard gerencial." }); } }

module.exports = { listarContas, baixarConta, abrirCaixa, statusCaixa, movimentoCaixa, fecharCaixa, ajustarEstoque, dashboardGerencial };
