const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const lancamentos = await prisma.gerenciamentoDcaixa.findMany();
    return res.json(lancamentos);
}

const create = async (req, res) => {
    const lancamento = await prisma.gerenciamentoDcaixa.create({
        data: req.body
    });
    return res.status(201).json(lancamento).end();
}

// const deletar = (req, res) => {
//     let {id} = req.params; //2

//     lancament.forEach((resp, index) => {
//         if(lancament.id == id) {
//             lancament.splice(index, 1);
//         }
//     });

//     res.status(200).json(alunos).end();
// }

// const del = async (req, res) => {
//     const { id } = req.params;

//     try {
//         // Verificar se o lançamento existe
//         const lancamentoExistente = await prisma.gerenciamentoDcaixa.findUnique({
//             where: { id: parseInt(id) }
//         });

//         if (!lancamentoExistente) {
//             return res.status(404).json({ error: 'Lançamento não encontrado' });
//         }

//         // Deletar o lançamento
//         await prisma.gerenciamentoDcaixa.delete({
//             where: { id: parseInt(id) }
//         });

//         return res.status(204).end();
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Erro ao deletar o lançamento' });
//     }
// };




module.exports = {
    read,
    create
};