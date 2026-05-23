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
            empresaId
        } = req.body;

        if (
            !nome ||
            !empresaId
        ) {

            return res.status(400).json({
                error: "Nome e empresa são obrigatórios."
            });

        }

        const centro =
            await prisma.centroCusto.create({

                data: {

                    nome,

                    empresaId:
                        parseInt(
                            empresaId
                        )
                }
            });

        return res.status(201).json(
            centro
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao criar centro de custo."
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
            await prisma.centroCusto.findMany({

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
            error: "Erro ao listar centros de custo."
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

        const centro =
            await prisma.centroCusto.update({

                where: {
                    id
                },

                data: {

                    nome:
                        req.body.nome
                }
            });

        return res.status(200).json(
            centro
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao atualizar centro de custo."
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

        await prisma.centroCusto.delete({

            where: {
                id
            }
        });

        return res.status(200).json({

            message:
                "Centro de custo removido com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao remover centro de custo."
        });

    }

};