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

module.exports = {
    gerarXml
};