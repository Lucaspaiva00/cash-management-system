/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,cpf]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,cnpj]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,email]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Cliente_cnpj_key";

-- DropIndex
DROP INDEX "Cliente_cpf_key";

-- DropIndex
DROP INDEX "Cliente_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_empresaId_cpf_key" ON "Cliente"("empresaId", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_empresaId_cnpj_key" ON "Cliente"("empresaId", "cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_empresaId_email_key" ON "Cliente"("empresaId", "email");
