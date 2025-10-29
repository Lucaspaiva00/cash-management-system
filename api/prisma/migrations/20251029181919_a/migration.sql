-- CreateTable
CREATE TABLE "login" (
    "id" SERIAL NOT NULL,
    "cpf" TEXT NOT NULL,
    "senha" VARCHAR(255) NOT NULL,

    CONSTRAINT "login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gerenciamentocaixa" (
    "id" SERIAL NOT NULL,
    "dataOperacao" TEXT NOT NULL,
    "tipoOperacao" VARCHAR(100) NOT NULL,
    "meioPagamento" VARCHAR(100) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "gerenciamentocaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cpf" TEXT NOT NULL,
    "cnpj" VARCHAR(100),
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" VARCHAR(255) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposta" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "descricao" VARCHAR(252) NOT NULL,
    "status" VARCHAR(100) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "proposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "precovenda" DOUBLE PRECISION NOT NULL,
    "precocompra" DOUBLE PRECISION NOT NULL,
    "estoque" INTEGER NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "imagem" VARCHAR(255),

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_cpf_key" ON "login"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cpf_key" ON "cliente"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_telefone_key" ON "cliente"("telefone");
