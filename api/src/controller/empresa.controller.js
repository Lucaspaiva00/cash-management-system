const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/*
|--------------------------------------------------------------------------
| Buscar empresa
|--------------------------------------------------------------------------
*/
const readOne = async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const empresa = await prisma.empresa.findUnique({
            where: { id },
            include: {
                configuracaoFiscal: true
            }
        });

        if (!empresa) {
            return res.status(404).json({
                error: "Empresa não encontrada."
            });
        }

        return res.status(200).json(empresa);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao buscar empresa."
        });

    }
};

const remove = async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const empresa = await prisma.empresa.findUnique({
            where: { id }
        });

        if (!empresa) {
            return res.status(404).json({
                error: "Empresa não encontrada."
            });
        }

        await prisma.empresa.delete({
            where: { id }
        });

        return res.status(200).json({
            message: "Empresa removida com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao remover empresa."
        });

    }
};

/*
|--------------------------------------------------------------------------
| Atualizar empresa
|--------------------------------------------------------------------------
*/
const update = async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const dados = req.body;

        const empresa = await prisma.empresa.findUnique({
            where: { id }
        });

        if (!empresa) {
            return res.status(404).json({
                error: "Empresa não encontrada."
            });
        }

        const atualizada =
            await prisma.empresa.update({
                where: { id },
                data: {
                    nome: dados.nome,
                    cnpj: dados.cnpj,
                    email: dados.email,
                    telefone: dados.telefone,

                    endereco: dados.endereco,
                    numero: dados.numero,
                    complemento: dados.complemento,
                    bairro: dados.bairro,
                    cidade: dados.cidade,
                    estado: dados.estado,
                    cep: dados.cep,

                    inscricaoEstadual:
                        dados.inscricaoEstadual,

                    inscricaoMunicipal:
                        dados.inscricaoMunicipal,

                    regimeTributario:
                        dados.regimeTributario
                }
            });

        return res.status(200).json({
            message: "Empresa atualizada com sucesso.",
            data: atualizada
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro ao atualizar empresa."
        });

    }
};

module.exports = {
    readOne,
    update,
    remove
};