-- CreateEnum
CREATE TYPE "StatusAgenda" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Caixa" ADD COLUMN     "clienteId" INTEGER,
ADD COLUMN     "jurosMaquina" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "descricao" VARCHAR(255),
ADD COLUMN     "pacoteMensal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pacoteQuinzenal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "porteCachorro" VARCHAR(50),
ADD COLUMN     "servico" VARCHAR(100);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horario" VARCHAR(20) NOT NULL,
    "servico" VARCHAR(100),
    "observacao" VARCHAR(255),
    "status" "StatusAgenda" NOT NULL DEFAULT 'AGENDADO',
    "clienteId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Caixa" ADD CONSTRAINT "Caixa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
