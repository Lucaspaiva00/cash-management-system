-- CreateEnum
CREATE TYPE "OrigemMercadoria" AS ENUM ('NACIONAL', 'ESTRANGEIRA_IMPORTACAO_DIRETA', 'ESTRANGEIRA_MERCADO_INTERNO');

-- CreateEnum
CREATE TYPE "RegimeTributario" AS ENUM ('SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "bairro" VARCHAR(100),
ADD COLUMN     "cep" VARCHAR(20),
ADD COLUMN     "cidade" VARCHAR(100),
ADD COLUMN     "complemento" VARCHAR(100),
ADD COLUMN     "estado" VARCHAR(2),
ADD COLUMN     "inscricaoEstadual" VARCHAR(30),
ADD COLUMN     "numero" VARCHAR(20);

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "bairro" VARCHAR(100),
ADD COLUMN     "cep" VARCHAR(20),
ADD COLUMN     "cidade" VARCHAR(100),
ADD COLUMN     "complemento" VARCHAR(100),
ADD COLUMN     "estado" VARCHAR(2),
ADD COLUMN     "inscricaoEstadual" VARCHAR(30),
ADD COLUMN     "inscricaoMunicipal" VARCHAR(30),
ADD COLUMN     "numero" VARCHAR(20),
ADD COLUMN     "regimeTributario" "RegimeTributario";

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "aliquotaCofins" DOUBLE PRECISION,
ADD COLUMN     "aliquotaIcms" DOUBLE PRECISION,
ADD COLUMN     "aliquotaIpi" DOUBLE PRECISION,
ADD COLUMN     "aliquotaPis" DOUBLE PRECISION,
ADD COLUMN     "altura" DOUBLE PRECISION,
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cest" VARCHAR(20),
ADD COLUMN     "cfop" VARCHAR(10),
ADD COLUMN     "codigoBarras" VARCHAR(50),
ADD COLUMN     "comprimento" DOUBLE PRECISION,
ADD COLUMN     "descricao" VARCHAR(500),
ADD COLUMN     "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "largura" DOUBLE PRECISION,
ADD COLUMN     "ncm" VARCHAR(20),
ADD COLUMN     "origem" "OrigemMercadoria" NOT NULL DEFAULT 'NACIONAL',
ADD COLUMN     "pesoBruto" DOUBLE PRECISION,
ADD COLUMN     "pesoLiquido" DOUBLE PRECISION,
ADD COLUMN     "sku" VARCHAR(50),
ADD COLUMN     "unidade" VARCHAR(10) NOT NULL DEFAULT 'UN',
ALTER COLUMN "nome" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "chaveNfe" VARCHAR(60),
ADD COLUMN     "numeroNota" VARCHAR(50),
ADD COLUMN     "pdfDanfe" VARCHAR(255),
ADD COLUMN     "protocoloNfe" VARCHAR(100),
ADD COLUMN     "xmlNfe" VARCHAR(255);

-- AlterTable
ALTER TABLE "VendaItem" ADD COLUMN     "acrescimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "aliquotaCofins" DOUBLE PRECISION,
ADD COLUMN     "aliquotaIcms" DOUBLE PRECISION,
ADD COLUMN     "aliquotaIpi" DOUBLE PRECISION,
ADD COLUMN     "aliquotaPis" DOUBLE PRECISION,
ADD COLUMN     "cest" TEXT,
ADD COLUMN     "cfop" TEXT,
ADD COLUMN     "desconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ncm" TEXT;
