const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/*
|--------------------------------------------------------------------------
| CRIAR
|--------------------------------------------------------------------------
*/

exports.create = async (req, res) => {

    try {

        const {
            nome,
            tipo,
            empresaId
        } = req.body;

        if (
            !nome ||
            !tipo ||
            !empresaId
        ) {

            return res.status(400).json({
                error: "Nome, tipo e empresa são obrigatórios."
            });

        }

        const categoria =
            await prisma.categoriaFinanceira.create({

                data: {

                    nome,

                    tipo,

                    empresaId:
                        parseInt(
                            empresaId
                        )
                }
            });

        return res.status(201).json(
            categoria
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao criar categoria."
        });

    }

};

/*
|--------------------------------------------------------------------------
| LISTAR
|--------------------------------------------------------------------------
*/

exports.read = async (req, res) => {

    try {

        const empresaId =
            parseInt(
                req.query.empresaId
            );

        const lista =
            await prisma.categoriaFinanceira.findMany({

                where: {
                    empresaId
                },

                orderBy: {
                    nome: "asc"
                }
            });

        return res.status(200).json(
            lista
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao listar categorias."
        });

    }

};

/*
|--------------------------------------------------------------------------
| ATUALIZAR
|--------------------------------------------------------------------------
*/

exports.update = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        const categoria =
            await prisma.categoriaFinanceira.update({

                where: {
                    id
                },

                data: {

                    nome:
                        req.body.nome,

                    tipo:
                        req.body.tipo
                }
            });

        return res.status(200).json(
            categoria
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao atualizar categoria."
        });

    }

};

/*
|--------------------------------------------------------------------------
| EXCLUIR
|--------------------------------------------------------------------------
*/

exports.remove = async (req, res) => {

    try {

        const id =
            parseInt(
                req.params.id
            );

        await prisma.categoriaFinanceira.delete({

            where: {
                id
            }
        });

        return res.status(200).json({

            message:
                "Categoria removida com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao remover categoria."
        });

    }

};