-- CreateEnum
CREATE TYPE "AmbienteFiscal" AS ENUM ('HOMOLOGACAO', 'PRODUCAO');

-- CreateTable
CREATE TABLE "ConfiguracaoFiscal" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "ambiente" "AmbienteFiscal" NOT NULL DEFAULT 'HOMOLOGACAO',
    "serieNfe" INTEGER NOT NULL DEFAULT 1,
    "serieNfce" INTEGER NOT NULL DEFAULT 1,
    "proximoNumeroNfe" INTEGER NOT NULL DEFAULT 1,
    "proximoNumeroNfce" INTEGER NOT NULL DEFAULT 1,
    "certificadoPfx" VARCHAR(255),
    "senhaCertificado" VARCHAR(255),
    "tokenApi" VARCHAR(255),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoFiscal_empresaId_key" ON "ConfiguracaoFiscal"("empresaId");

-- AddForeignKey
ALTER TABLE "ConfiguracaoFiscal" ADD CONSTRAINT "ConfiguracaoFiscal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
