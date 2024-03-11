-- CreateTable
CREATE TABLE `Login` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gerenciamentoDcaixa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataOperacao` VARCHAR(191) NOT NULL,
    `tipoOperacao` VARCHAR(191) NOT NULL,
    `meioPagamento` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeCliente` VARCHAR(191) NOT NULL,
    `cnpjCliente` VARCHAR(191) NOT NULL,
    `cpfCliente` VARCHAR(191) NOT NULL,
    `rgCliente` VARCHAR(191) NOT NULL,
    `enderecoCliente` VARCHAR(191) NOT NULL,
    `telefoneUser` VARCHAR(191) NOT NULL,
    `emailCliente` VARCHAR(191) NOT NULL,
    `cepCliente` VARCHAR(191) NOT NULL,
    `numeroCliente` VARCHAR(191) NOT NULL,
    `complementoCliente` VARCHAR(191) NOT NULL,
    `servicoCliente` VARCHAR(191) NOT NULL,
    `produtoCliente` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Propostas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeProposta` VARCHAR(191) NOT NULL,
    `descricaoProposta` VARCHAR(191) NOT NULL,
    `prazoproposta` VARCHAR(191) NOT NULL,
    `valorProposta` DOUBLE NOT NULL,
    `custoProposta` DOUBLE NOT NULL,
    `statusproposta` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produtos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeProduto` VARCHAR(191) NOT NULL,
    `descricaoProduto` VARCHAR(191) NOT NULL,
    `valorProduto` DOUBLE NOT NULL,
    `custoProduto` DOUBLE NOT NULL,
    `statusProduto` VARCHAR(191) NOT NULL,
    `quantidadeProduto` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
