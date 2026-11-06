/**
 * Importação controlada de novembro/2026 — PAIVA TECH.
 * Execução segura:
 *   DATABASE_URL=... TARGET_EMPRESA_ID=123 node api/scripts/importar-novembro-paiva.js
 *   DATABASE_URL=... TARGET_EMPRESA_ID=123 node api/scripts/importar-novembro-paiva.js --apply
 *
 * Nunca apaga empresa, usuários, vendas, clientes, históricos ou lançamentos existentes.
 * A importação bloqueia duplicidades pela referência única na descrição e pela empresaId.
 * O valor de R$ 9.000 é META e NÃO é lançado como entrada.
 * Oportunidades Adubos/Daniel não são caixa recebido.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const id = Number(process.env.TARGET_EMPRESA_ID);
const apply = process.argv.includes("--apply");
const ref = "IMPORT-NOV-2026-PAIVATECH";
const entries = [
  ["2026-11-06", "SBA — Cláudio e Luiz", 2000, "PAGO", "PIX", "VENDA_NOVA", "Antecipação 4x R$500: nov/26 a fev/27; retorno mar/27"],
  ["2026-11-10", "Juliano — Itália", 4000, "PENDENTE", null, "CONTRATO_EXISTENTE", "Parcela do contrato (9x)"],
  ["2026-11-10", "Cauã", 80, "PENDENTE", null, "CONTRATO_EXISTENTE", "Pagamento previsto"],
  ["2026-11-10", "Rodrigo / Digão", 400, "PENDENTE", null, "CONTRATO_EXISTENTE", "Pagamento previsto"],
  ["2026-11-10", "RM Motos", 650, "PENDENTE", null, "RENOVACAO_ANUAL", "Servidor anual"],
  ["2026-11-10", "Elétrica T", 650, "PENDENTE", null, "RENOVACAO_ANUAL", "Servidor anual"],
  ["2026-11-15", "Eliseu", 400, "PENDENTE", null, "CONTRATO_EXISTENTE", "Parcela (3x)"],
  ["2026-11-15", "Cláudio", 500, "PENDENTE", null, "CONTRATO_EXISTENTE", "Pagamento previsto"],
  ["2026-11-15", "Bruno", 400, "PENDENTE", null, "CONTRATO_EXISTENTE", "Parcela (9x)"],
  ["2026-11-25", "Integrada", 500, "PENDENTE", null, "CONTRATO_EXISTENTE", "Pagamento previsto"],
  ["2026-11-25", "Gleiser", 100, "PENDENTE", null, "CONTRATO_EXISTENTE", "Pagamento previsto"],
  ["2026-11-25", "André", 1000, "PENDENTE", null, "CONTRATO_EXISTENTE", "Pagamento previsto"],
  ["2026-11-25", "Elizeu Servidor", 200, "PENDENTE", null, "CONTRATO_EXISTENTE", "Parcela (2x)"],
  ["2026-11-30", "Jackson", 200, "PENDENTE", null, "CONTRATO_EXISTENTE", "Pagamento previsto"]
];
const opportunity = [
  ["Poços de Caldas", 7400, 3790],
  ["Leme", 8400, 4203]
];
const atNoonUTC = date => new Date(date+"T15:00:00.000Z");
(async () => {
  if (!Number.isInteger(id) || id <= 0) throw new Error("TARGET_EMPRESA_ID obrigatório; não escolher a empresa por suposição.");
  const empresa = await prisma.empresa.findUnique({ where: { id }, select: { id: true, nome: true, cnpj: true } });
  if (!empresa || !/paiva/i.test(empresa.nome)) throw new Error("Empresa alvo não confirmada como Paiva Tech.");
  const total = entries.reduce((s,x)=>s+x[2],0);
  if (total !== 11080) throw new Error("Total diverge da planilha.");
  const existentes = await prisma.caixa.findMany({where:{empresaId:id,tipoOperacao:"ENTRADA",dataOperacao:{gte:atNoonUTC("2026-11-01"),lt:atNoonUTC("2026-12-01")}},select:{id:true,descricao:true,valor:true,status:true}});
  console.log(JSON.stringify({empresa,modo:apply?"APLICAR":"SOMENTE SIMULAÇÃO",existentesNoMes:existentes,linhasParaImportar:entries.length,totalDaPlanilha:total,propostasAdubos:opportunity,metaLiquidaNaoLancada:9000},null,2));
  if (!apply) return;
  if (existentes.some(c=>!(c.descricao||"").includes(ref))) throw new Error("Existem registros financeiros anteriores em novembro. Revisar/conciliar manualmente antes de importar para evitar duplicidade. Nenhum dado foi apagado.");
  await prisma.$transaction(async tx=>{
    const categories={};
    for (const [key,name] of [["VENDA_NOVA","Venda nova"],["CONTRATO_EXISTENTE","Contrato existente"],["RENOVACAO_ANUAL","Renovação anual"]]) {
      const category=await tx.categoriaFinanceira.findFirst({where:{empresaId:id,nome:name,tipo:"ENTRADA"}})
      categories[key]=category?.id||(await tx.categoriaFinanceira.create({data:{empresaId:id,nome,tipo:"ENTRADA"}})).id;
    }
    for (const [day,cliente,valor,status,meio,tipo,obs] of entries) {
      const descricao=`${ref} | ${day} | ${cliente}`;
      const found=await tx.caixa.findFirst({where:{empresaId:id,descricao}});
      if(found) continue;
      await tx.caixa.create({data:{
        empresaId:id,tipoOperacao:"ENTRADA",descricao,valor,
        valorPago:status==="PAGO"?valor:null,status,meioPagamento:meio,
        dataOperacao:atNoonUTC(day),dataVencimento:atNoonUTC(day),
        dataPagamento:status==="PAGO"?atNoonUTC(day):null,
        categoriaId:categories[tipo],recorrente:tipo==="CONTRATO_EXISTENTE",
        tipoRecorrencia:"NENHUMA",observacoes:obs
      }});
    }
  });
  console.log("Importação idempotente concluída, sem exclusões.");
})().catch(e=>{ console.error(e.message);process.exitCode=1 }).finally(()=>prisma.$disconnect());
