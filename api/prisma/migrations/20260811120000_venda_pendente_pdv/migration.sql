-- Vincula cada venda do PDV ao respectivo lançamento financeiro.
-- Nullable para preservar as vendas e movimentações já existentes.
ALTER TABLE "Caixa" ADD COLUMN "vendaId" INTEGER;

CREATE UNIQUE INDEX "Caixa_vendaId_key" ON "Caixa"("vendaId");

ALTER TABLE "Caixa"
ADD CONSTRAINT "Caixa_vendaId_fkey"
FOREIGN KEY ("vendaId") REFERENCES "Venda"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
