const BASE = API_BASE;
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario || !usuario.empresaId) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
}

// 📊 Carregar resumo (cards + gráfico de barras)
async function carregarResumo() {
    try {
        const res = await fetch(`${BASE}/vendas/resumo?empresaId=${usuario.empresaId}`);
        const dados = await res.json();

        const fmt = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        document.getElementById("vDia").textContent = fmt(dados.dia._sum.total);
        document.getElementById("qDia").textContent = `${dados.dia._count.id} vendas · Lucro ${fmt(dados.dia._sum.lucro)}`;

        document.getElementById("vMes").textContent = fmt(dados.mes._sum.total);
        document.getElementById("qMes").textContent = `${dados.mes._count.id} vendas · Lucro ${fmt(dados.mes._sum.lucro)}`;

        document.getElementById("vAno").textContent = fmt(dados.ano._sum.total);
        document.getElementById("qAno").textContent = `${dados.ano._count.id} vendas · Lucro ${fmt(dados.ano._sum.lucro)}`;

        desenharGraficoBarras(dados);
    } catch (e) {
        console.error("Erro ao carregar resumo de vendas:", e);
    }
}

// 📈 Gráfico de Barras - Resumo
function desenharGraficoBarras(dados) {
    const ctx = document.getElementById("graficoVendas").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Dia", "Mês", "Ano"],
            datasets: [{
                label: "Total de Vendas (R$)",
                data: [
                    dados.dia._sum.total || 0,
                    dados.mes._sum.total || 0,
                    dados.ano._sum.total || 0,
                ],
                backgroundColor: ["#007bff", "#28a745", "#ffc107"],
                borderRadius: 8,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Resumo de Vendas", font: { size: 18, weight: "bold" } },
            },
        },
    });
}

// 📉 Gráfico de Linha - Vendas por Dia do Mês
async function carregarGraficoMensal() {
    try {
        const res = await fetch(`${BASE}/vendas?empresaId=${usuario.empresaId}`);
        const vendas = await res.json();

        const vendasPorDia = {};

        vendas.forEach(v => {
            const data = new Date(v.data);
            const dia = data.getDate();
            vendasPorDia[dia] = (vendasPorDia[dia] || 0) + Number(v.total);
        });

        const dias = Object.keys(vendasPorDia).sort((a, b) => a - b);
        const valores = dias.map(d => vendasPorDia[d]);

        const ctx = document.getElementById("graficoMensal").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: dias.map(d => `Dia ${d}`),
                datasets: [{
                    label: "Vendas Diárias (R$)",
                    data: valores,
                    fill: true,
                    borderColor: "#dc3545",
                    backgroundColor: "rgba(220,53,69,0.1)",
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: "#dc3545"
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true, position: "top" },
                    title: { display: true, text: "Tendência de Vendas Diárias", font: { size: 18, weight: "bold" } },
                },
                scales: {
                    y: { beginAtZero: true },
                },
            },
        });
    } catch (e) {
        console.error("Erro ao gerar gráfico mensal:", e);
    }
}

// 📋 Tabela de Vendas
async function carregarTabela() {
    try {
        const res = await fetch(`${BASE}/vendas?empresaId=${usuario.empresaId}`);
        const vendas = await res.json();
        const corpo = document.getElementById("tabelaVendas");
        corpo.innerHTML = "";

        if (!Array.isArray(vendas) || vendas.length === 0) {
            corpo.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Nenhuma venda registrada.</td></tr>`;
            return;
        }

        vendas.forEach(v => {
            const nomeCliente = v.cliente ? v.cliente.nome : "Consumidor Final";
            const dataVenda = new Date(v.data).toLocaleDateString("pt-BR");
            const valor = v.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            const lucro = (v.lucro ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

            const badgeNfe =
                v.statusNfe === "AUTORIZADA"
                    ? `<span class="badge badge-success">AUTORIZADA</span>`
                    : v.statusNfe === "REJEITADA"
                        ? `<span class="badge badge-danger">REJEITADA</span>`
                        : v.statusNfe === "CANCELADA"
                            ? `<span class="badge badge-dark">CANCELADA</span>`
                            : `<span class="badge badge-warning">PENDENTE</span>`;

            corpo.innerHTML += `
<tr>

    <td>${v.id}</td>

    <td>${nomeCliente}</td>

    <td>${dataVenda}</td>

    <td>${v.meioPagamento}</td>

    <td>${valor}</td>

    <td>${lucro}</td>

    <td>${badgeNfe}</td>

    <td>

        <button
            class="btn btn-info btn-sm"
            onclick="visualizarXml(${v.id})">

            <i class="fas fa-code"></i>

            XML

        </button>

        <button
            class="btn btn-success btn-sm ml-1"
            onclick="emitirNfe(${v.id})">

            <i class="fas fa-file-invoice"></i>

            Emitir NF-e

        </button>

    </td>

</tr>`;
        });
    } catch (e) {
        console.error("Erro ao carregar tabela de vendas:", e);
    }
}

async function emitirNfe(id) {

    if (!confirm(`Emitir NF-e da venda #${id}?`))
        return;

    try {

        const resp = await fetch(
            `${BASE}/vendas/${id}/emitir`,
            {
                method: "POST"
            }
        );

        const dados = await resp.json();

        if (!resp.ok)
            throw new Error(
                dados.error || "Erro ao emitir NF-e"
            );

        alert("NF-e emitida com sucesso!");

        carregarTabela();

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}

function visualizarXml(id) {

    window.open(
        `${BASE}/vendas/${id}/xml`,
        "_blank"
    );

}

window.emitirNfe = emitirNfe;
window.visualizarXml = visualizarXml;

// 📤 Exportar CSV
document.getElementById("btnExportar").addEventListener("click", () => {
    const tabela = document.getElementById("tabelaVendas");
    if (!tabela || tabela.rows.length === 0) return alert("Nenhuma venda para exportar!");

    let csv = "ID;Cliente;Data;Pagamento;Valor (R$);Lucro (R$)\n";
    for (let i = 0; i < tabela.rows.length; i++) {
        const cells = tabela.rows[i].cells;
        csv += `${cells[0].innerText};${cells[1].innerText};${cells[2].innerText};${cells[3].innerText};${cells[4].innerText};${cells[5].innerText}\n`;
    }

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio-vendas.csv";
    link.click();
    URL.revokeObjectURL(link.href);
});

// 🚀 Inicializar
document.addEventListener("DOMContentLoaded", () => {
    carregarResumo();
    carregarTabela();
    carregarGraficoMensal();
});
