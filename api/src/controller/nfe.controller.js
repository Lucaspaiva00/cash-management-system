const {
    gerarXML
} = require("../service/nfe.service");

const gerarXml = async (req, res) => {

    try {

        const xml =
            await gerarXML(
                req.params.id
            );

        return res
            .type("application/xml")
            .send(xml);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });

    }

};

const emitirNfe = async (req, res) => {

    try {

        const vendaId =
            Number(req.params.id);

        const xml =
            await gerarXML(vendaId);

        await prisma.venda.update({

            where: {
                id: vendaId
            },

            data: {

                statusNfe:
                    "AUTORIZADA",

                numeroNota:
                    String(vendaId),

                serieNota:
                    "1",

                dataEmissaoNfe:
                    new Date(),

                xmlNfe:
                    xml

            }

        });

        return res.status(200).json({

            message:
                "NF-e emitida com sucesso.",

            xml

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });

    }

};

module.exports = {
    gerarXml,
    emitirNfe
};