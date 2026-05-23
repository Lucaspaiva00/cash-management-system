// api/controller/ctprodutos.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/*
|--------------------------------------------------------------------------
| CRIAR PRODUTO
|--------------------------------------------------------------------------
*/

const create = async (req, res) => {

    try {

        const {
            nome,
            descricao,
            sku,
            codigoBarras,
            marca,
            categoria,
            unidade,
            ncm,
            cest,
            cfop,
            origem,
            aliquotaIcms,
            aliquotaPis,
            aliquotaCofins,
            aliquotaIpi,
            precoVenda,
            precoCompra,
            estoque,
            estoqueMinimo,
            pesoLiquido,
            pesoBruto,
            largura,
            altura,
            comprimento,
            imagem,
            ativo,
            empresaId
        } = req.body;

        if (
            !nome ||
            !precoVenda ||
            !empresaId
        ) {

            return res.status(400).json({
                error:
                    "Nome, preço de venda e empresa são obrigatórios."
            });

        }

        if (sku) {

            const skuExistente =
                await prisma.produto.findFirst({

                    where: {
                        sku,
                        empresaId: parseInt(empresaId)
                    }

                });

            if (skuExistente) {

                return res.status(400).json({
                    error:
                        "Já existe um produto com este SKU."
                });

            }

        }

        const novoProduto =
            await prisma.produto.create({

                data: {

                    nome,

                    descricao:
                        descricao || null,

                    sku:
                        sku || null,

                    codigoBarras:
                        codigoBarras || null,

                    marca:
                        marca || null,

                    categoria:
                        categoria || null,

                    unidade:
                        unidade || "UN",

                    ncm:
                        ncm || null,

                    cest:
                        cest || null,

                    cfop:
                        cfop || null,

                    origem:
                        origem || "NACIONAL",

                    aliquotaIcms:
                        aliquotaIcms
                            ? parseFloat(aliquotaIcms)
                            : null,

                    aliquotaPis:
                        aliquotaPis
                            ? parseFloat(aliquotaPis)
                            : null,

                    aliquotaCofins:
                        aliquotaCofins
                            ? parseFloat(aliquotaCofins)
                            : null,

                    aliquotaIpi:
                        aliquotaIpi
                            ? parseFloat(aliquotaIpi)
                            : null,

                    precoVenda:
                        parseFloat(precoVenda),

                    precoCompra:
                        precoCompra
                            ? parseFloat(precoCompra)
                            : null,

                    estoque:
                        parseInt(estoque || 0),

                    estoqueMinimo:
                        parseInt(estoqueMinimo || 0),

                    pesoLiquido:
                        pesoLiquido
                            ? parseFloat(pesoLiquido)
                            : null,

                    pesoBruto:
                        pesoBruto
                            ? parseFloat(pesoBruto)
                            : null,

                    largura:
                        largura
                            ? parseFloat(largura)
                            : null,

                    altura:
                        altura
                            ? parseFloat(altura)
                            : null,

                    comprimento:
                        comprimento
                            ? parseFloat(comprimento)
                            : null,

                    imagem:
                        imagem || null,

                    ativo:
                        ativo !== undefined
                            ? Boolean(ativo)
                            : true,

                    empresaId:
                        parseInt(empresaId)

                }

            });

        return res.status(201).json({

            message:
                "Produto criado com sucesso.",

            data:
                novoProduto

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao criar produto."
        });

    }

};

/*
|--------------------------------------------------------------------------
| LISTAR PRODUTOS
|--------------------------------------------------------------------------
*/

const read = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        if (!empresaId) {

            return res.status(400).json({
                error:
                    "Informe a empresa."
            });

        }

        const produtos =
            await prisma.produto.findMany({

                where: {
                    empresaId
                },

                orderBy: {
                    nome: "asc"
                }

            });

        return res.status(200).json(
            produtos
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao listar produtos."
        });

    }

};

/*
|--------------------------------------------------------------------------
| BUSCAR PRODUTO POR ID
|--------------------------------------------------------------------------
*/

const readOne = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        const produto =
            await prisma.produto.findUnique({

                where: {
                    id
                }

            });

        if (!produto) {

            return res.status(404).json({
                error:
                    "Produto não encontrado."
            });

        }

        return res.status(200).json(
            produto
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao buscar produto."
        });

    }

};

/*
|--------------------------------------------------------------------------
| ATUALIZAR PRODUTO
|--------------------------------------------------------------------------
*/

const update = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        const existe =
            await prisma.produto.findUnique({

                where: {
                    id
                }

            });

        if (!existe) {

            return res.status(404).json({
                error:
                    "Produto não encontrado."
            });

        }

        const dados =
            req.body;

        const atualizado =
            await prisma.produto.update({

                where: {
                    id
                },

                data: {

                    nome:
                        dados.nome,

                    descricao:
                        dados.descricao || null,

                    sku:
                        dados.sku || null,

                    codigoBarras:
                        dados.codigoBarras || null,

                    marca:
                        dados.marca || null,

                    categoria:
                        dados.categoria || null,

                    unidade:
                        dados.unidade || "UN",

                    ncm:
                        dados.ncm || null,

                    cest:
                        dados.cest || null,

                    cfop:
                        dados.cfop || null,

                    origem:
                        dados.origem || "NACIONAL",

                    aliquotaIcms:
                        dados.aliquotaIcms
                            ? parseFloat(dados.aliquotaIcms)
                            : null,

                    aliquotaPis:
                        dados.aliquotaPis
                            ? parseFloat(dados.aliquotaPis)
                            : null,

                    aliquotaCofins:
                        dados.aliquotaCofins
                            ? parseFloat(dados.aliquotaCofins)
                            : null,

                    aliquotaIpi:
                        dados.aliquotaIpi
                            ? parseFloat(dados.aliquotaIpi)
                            : null,

                    precoVenda:
                        parseFloat(dados.precoVenda),

                    precoCompra:
                        dados.precoCompra
                            ? parseFloat(dados.precoCompra)
                            : null,

                    estoque:
                        parseInt(dados.estoque || 0),

                    estoqueMinimo:
                        parseInt(dados.estoqueMinimo || 0),

                    pesoLiquido:
                        dados.pesoLiquido
                            ? parseFloat(dados.pesoLiquido)
                            : null,

                    pesoBruto:
                        dados.pesoBruto
                            ? parseFloat(dados.pesoBruto)
                            : null,

                    largura:
                        dados.largura
                            ? parseFloat(dados.largura)
                            : null,

                    altura:
                        dados.altura
                            ? parseFloat(dados.altura)
                            : null,

                    comprimento:
                        dados.comprimento
                            ? parseFloat(dados.comprimento)
                            : null,

                    imagem:
                        dados.imagem || null,

                    ativo:
                        dados.ativo !== undefined
                            ? Boolean(dados.ativo)
                            : true

                }

            });

        return res.status(200).json({

            message:
                "Produto atualizado com sucesso.",

            data:
                atualizado

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao atualizar produto."
        });

    }

};

/*
|--------------------------------------------------------------------------
| EXCLUIR PRODUTO
|--------------------------------------------------------------------------
*/

const remove = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        await prisma.produto.delete({

            where: {
                id
            }

        });

        return res.status(200).json({

            message:
                "Produto excluído com sucesso."

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "Erro ao excluir produto."
        });

    }

};

module.exports = {
    create,
    read,
    readOne,
    update,
    remove
};