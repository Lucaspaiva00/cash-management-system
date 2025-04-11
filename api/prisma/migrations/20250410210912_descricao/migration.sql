-- CreateTable
CREATE TABLE `login` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cpf` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `login_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gerenciamentocaixa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataOperacao` VARCHAR(191) NOT NULL,
    `tipoOperacao` VARCHAR(100) NOT NULL,
    `meioPagamento` VARCHAR(100) NOT NULL,
    `valor` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(100) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `cliente_cpf_key`(`cpf`),
    UNIQUE INDEX `cliente_email_key`(`email`),
    UNIQUE INDEX `cliente_telefone_key`(`telefone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `data` DATE NOT NULL,
    `descricao` VARCHAR(252) NOT NULL,
    `status` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `precovenda` DOUBLE NOT NULL,
    `precocompra` DOUBLE NOT NULL,
    `estoque` INTEGER NOT NULL,
    `marca` VARCHAR(100) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `categoria` VARCHAR(100) NOT NULL,
    `imagem` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
