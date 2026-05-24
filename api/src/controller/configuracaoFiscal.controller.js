const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/*
|--------------------------------------------------------------------------
| Buscar configuração fiscal da empresa
|--------------------------------------------------------------------------
*/
const readOne = async (req, res) => {
    try {

        const empresaId = parseInt(req.params.empresaId);

        const configuracao =
            await prisma.configuracaoFiscal.findUnique({
                where: {
                    empresaId
                }
            });

        if (!configuracao) {

            const nova =
                await prisma.configuracaoFiscal.create({
                    data: {
                        empresaId
                    }
                });

            return res.status(200).json(nova);

        }

        return res.status(200).json(configuracao);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao buscar configuração fiscal."
        });

    }
};

/*
|--------------------------------------------------------------------------
| Atualizar configuração fiscal
|--------------------------------------------------------------------------
*/
const update = async (req, res) => {
    try {

        const empresaId = parseInt(req.params.empresaId);

        const dados = req.body;

        const existe =
            await prisma.configuracaoFiscal.findUnique({
                where: {
                    empresaId
                }
            });

        if (!existe) {

            const nova =
                await prisma.configuracaoFiscal.create({
                    data: {
                        empresaId,
                        ambiente: dados.ambiente,
                        serieNfe: dados.serieNfe,
                        serieNfce: dados.serieNfce,
                        proximoNumeroNfe: dados.proximoNumeroNfe,
                        proximoNumeroNfce: dados.proximoNumeroNfce,
                        tokenApi: dados.tokenApi
                    }
                });

            return res.status(201).json(nova);

        }

        const atualizada =
            await prisma.configuracaoFiscal.update({
                where: {
                    empresaId
                },
                data: {
                    ambiente: dados.ambiente,
                    serieNfe: dados.serieNfe,
                    serieNfce: dados.serieNfce,
                    proximoNumeroNfe: dados.proximoNumeroNfe,
                    proximoNumeroNfce: dados.proximoNumeroNfce,
                    tokenApi: dados.tokenApi
                }
            });

        return res.status(200).json({
            message: "Configuração fiscal atualizada.",
            data: atualizada
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao atualizar configuração fiscal."
        });

    }
};

module.exports = {
    readOne,
    update
};