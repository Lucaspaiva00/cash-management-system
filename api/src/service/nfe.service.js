const { PrismaClient } = require("@prisma/client");
const { create } = require("xmlbuilder2");

const prisma = new PrismaClient();

async function gerarXML(vendaId) {

    const venda =
        await prisma.venda.findUnique({
            where: {
                id: Number(vendaId)
            },
            include: {
                empresa: true,
                cliente: true,
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        });

    if (!venda) {
        throw new Error("Venda não encontrada.");
    }

    const xml = create({ version: "1.0", encoding: "UTF-8" })

        .ele("NFe")

        .ele("infNFe")

        .ele("ide")

        .ele("natOp")
        .txt("VENDA DE MERCADORIA")
        .up()

        .ele("mod")
        .txt("55")
        .up()

        .ele("serie")
        .txt(venda.serieNota || "1")
        .up()

        .ele("nNF")
        .txt(venda.numeroNota || venda.id)
        .up()

        .up()

        .ele("emit")

        .ele("xNome")
        .txt(venda.empresa.nome || "")
        .up()

        .ele("CNPJ")
        .txt(venda.empresa.cnpj || "")
        .up()

        .up()

        .ele("dest")

        .ele("xNome")
        .txt(venda.cliente?.nome || "CONSUMIDOR FINAL")
        .up()

        .up();

    venda.itens.forEach((item, index) => {

        xml

            .ele("det", {
                nItem: index + 1
            })

            .ele("prod")

            .ele("cProd")
            .txt(String(item.produto.id))
            .up()

            .ele("xProd")
            .txt(item.produto.nome)
            .up()

            .ele("NCM")
            .txt(item.ncm || "")
            .up()

            .ele("CFOP")
            .txt(item.cfop || "5102")
            .up()

            .ele("uCom")
            .txt(item.produto.unidade || "UN")
            .up()

            .ele("qCom")
            .txt(String(item.quantidade))
            .up()

            .ele("vUnCom")
            .txt(String(item.precoUnitario))
            .up()

            .ele("vProd")
            .txt(String(item.subtotal))
            .up()

            .up()

            .up();

    });

    return xml.end({
        prettyPrint: true
    });

}

module.exports = {
    gerarXML
};