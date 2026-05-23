/*
  Warnings:

  - Made the column `jurosMaquina` on table `Caixa` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StatusFinanceiro" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoRecorrencia" AS ENUM ('NENHUMA', 'SEMANAL', 'MENSAL', 'ANUAL');

-- AlterTable
ALTER TABLE "Caixa" ADD COLUMN     "categoriaId" INTEGER,
ADD COLUMN     "centroCustoId" INTEGER,
ADD COLUMN     "comprovanteUrl" VARCHAR(255),
ADD COLUMN     "dataPagamento" TIMESTAMP(3),
ADD COLUMN     "dataVencimento" TIMESTAMP(3),
ADD COLUMN     "fornecedor" VARCHAR(150),
ADD COLUMN     "observacoes" VARCHAR(500),
ADD COLUMN     "parcelaAtual" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "parcelas" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "recorrente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "StatusFinanceiro" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "tipoRecorrencia" "TipoRecorrencia" NOT NULL DEFAULT 'NENHUMA',
ADD COLUMN     "valorPago" DOUBLE PRECISION,
ALTER COLUMN "meioPagamento" DROP NOT NULL,
ALTER COLUMN "jurosMaquina" SET NOT NULL;

-- CreateTable
CREATE TABLE "CategoriaFinanceira" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "tipo" "TipoOperacao" NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CentroCusto" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CentroCusto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Caixa" ADD CONSTRAINT "Caixa_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaFinanceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caixa" ADD CONSTRAINT "Caixa_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "CentroCusto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaFinanceira" ADD CONSTRAINT "CategoriaFinanceira_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CentroCusto" ADD CONSTRAINT "CentroCusto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
