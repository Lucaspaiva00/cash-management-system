-- CreateTable
CREATE TABLE `gerenciamentoDcaixa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataOperacao` VARCHAR(191) NOT NULL,
    `tipoOperacao` VARCHAR(191) NOT NULL,
    `meioPagamento` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
