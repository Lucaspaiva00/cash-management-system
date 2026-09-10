// =======================================================
// CONFIGURAÇÕES
// =======================================================

const API = `${API_BASE}/produtos`;

const usuario =
  JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {

  alert("Sessão expirada.");

  window.location.href = "login.html";

}

// =======================================================
// ELEMENTOS
// =======================================================

const form =
  document.querySelector("#caixaForms");

const tabela =
  document.querySelector("#produtosCadastrados");

const buscarProduto =
  document.querySelector("#buscarProduto");

let editandoId = null;

let listaProdutos = [];

// =======================================================
// HELPERS
// =======================================================

function moeda(valor) {

  return new Intl.NumberFormat(

    "pt-BR",

    {

      style: "currency",

      currency: "BRL"

    }

  ).format(Number(valor || 0));

}

function numero(valor) {

  return Number(valor || 0);

}

function toast(msg, tipo = "success") {

  const cores = {

    success: "#22c55e",

    error: "#ef4444",

    warning: "#f59e0b",

    info: "#2563eb"

  };

  const div = document.createElement("div");

  div.innerHTML = msg;

  Object.assign(div.style, {

    position: "fixed",

    right: "25px",

    bottom: "25px",

    background: cores[tipo],

    color: "#fff",

    padding: "12px 22px",

    borderRadius: "10px",

    zIndex: 99999,

    fontWeight: "600",

    boxShadow: "0 10px 25px rgba(0,0,0,.2)"

  });

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 3000);

}

// =======================================================
// KPIs
// =======================================================
function atualizarKPIs(produtos) {

    const totalProdutos = produtos.length;

    const totalItens = produtos.reduce(

        (soma, p) => soma + numero(p.estoque),

        0

    );

    const valorEstoque = produtos.reduce(

        (soma, p) =>

            soma +

            (

                numero(p.estoque) *

                numero(p.precoCompra)

            ),

        0

    );

    const estoqueBaixo = produtos.filter(

        p =>

            numero(p.estoque) <= numero(p.estoqueMinimo)

    ).length;

    document.querySelector("#kpiTotalProdutos").innerHTML = totalProdutos;

    document.querySelector("#kpiItensEstoque").innerHTML = totalItens;

    document.querySelector("#kpiEstoqueBaixo").innerHTML = estoqueBaixo;

    document.querySelector("#kpiValorEstoque").innerHTML = moeda(valorEstoque);

}

// =======================================================
// EVENTOS
// =======================================================

document.addEventListener(

  "DOMContentLoaded",

  () => {

    carregarProdutos();

    form.addEventListener(

      "submit",

      salvarProduto

    );

    if (buscarProduto) {

      buscarProduto.addEventListener(

        "keyup",

        pesquisarProdutos

      );

    }

  }

);

// =======================================================
// SALVAR PRODUTO
// =======================================================

async function salvarProduto(e) {

  e.preventDefault();

  const payload = {

    nome: form.nome.value.trim(),

    descricao: form.descricao.value.trim(),

    sku: form.sku.value.trim(),

    codigoBarras: form.codigoBarras.value.trim(),

    marca: form.marca.value.trim(),

    categoria: form.categoria.value.trim(),

    unidade: form.unidade.value,

    precoCompra: numero(form.precoCompra.value),

    precoVenda: numero(form.precoVenda.value),

    estoque: parseInt(form.estoque.value || 0),

    estoqueMinimo: parseInt(form.estoqueMinimo.value || 0),

    ncm: form.ncm.value.trim(),

    cest: form.cest.value.trim(),

    cfop: form.cfop.value.trim(),

    origem: form.origem.value,

    aliquotaIcms: numero(form.aliquotaIcms.value),

    aliquotaPis: numero(form.aliquotaPis.value),

    aliquotaCofins: numero(form.aliquotaCofins.value),

    aliquotaIpi: numero(form.aliquotaIpi.value),

    empresaId: usuario.empresaId

  };

  try {

    const resposta = await fetch(

      editandoId

        ? `${API}/${editandoId}`

        : API,

      {

        method:

          editandoId

            ? "PUT"

            : "POST",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify(payload)

      }

    );

    const json = await resposta.json();

    if (!resposta.ok) {

      throw new Error(

        json.error ||

        "Erro ao salvar produto."

      );

    }

    toast(

      editandoId

        ? "Produto atualizado com sucesso."

        : "Produto cadastrado com sucesso."

    );

    form.reset();

    editandoId = null;

    $("#modalProduto").modal("hide");

    carregarProdutos();

  }

  catch (erro) {

    console.error(erro);

    toast(

      erro.message,

      "error"

    );

  }

}

// =======================================================
// LISTAR PRODUTOS
// =======================================================

async function carregarProdutos() {

  tabela.innerHTML = `

        <tr>

            <td colspan="7" class="text-center py-4">

                Carregando...

            </td>

        </tr>

    `;

  try {

    const resposta = await fetch(

      `${API}?empresaId=${usuario.empresaId}`

    );

    listaProdutos = await resposta.json();

    if (!Array.isArray(listaProdutos)) {

      listaProdutos = [];

    }

    atualizarKPIs(

      listaProdutos

    );

    renderizarTabela(

      listaProdutos

    );

  }

  catch (erro) {

    console.error(erro);

    tabela.innerHTML = `

            <tr>

                <td colspan="7"

                    class="text-center text-danger py-4">

                    Erro ao carregar produtos.

                </td>

            </tr>

        `;

  }

}

// =======================================================
// RENDER TABELA
// =======================================================

function renderizarTabela(produtos) {

  if (!produtos.length) {

    tabela.innerHTML = `

            <tr>

                <td colspan="7" class="text-center py-5">

                    Nenhum produto encontrado.

                </td>

            </tr>

        `;

    return;

  }

  tabela.innerHTML = produtos.map(p => {

    let status = "";

    if (numero(p.estoque) <= 0) {

      status = `<span class="badge badge-danger">Sem Estoque</span>`;

    }

    else if (numero(p.estoque) <= numero(p.estoqueMinimo)) {

      status = `<span class="badge badge-warning">Estoque Baixo</span>`;

    }

    else {

      status = `<span class="badge badge-success">Em Estoque</span>`;

    }

    return `

        <tr>

            <td>

                <strong>

                    ${p.nome}

                </strong>

            </td>

            <td>

                ${p.categoria || "-"}

            </td>

            <td>

                ${moeda(p.precoVenda)}

            </td>

            <td>

                ${p.estoque}

            </td>

            <td>

                ${status}

            </td>

            <td>

                <button

                    class="btn btn-warning btn-sm mr-1"

                    onclick="editarProduto(${p.id})">

                    <i class="fas fa-edit"></i>

                </button>

                <button class="btn btn-primary btn-sm mr-1"
                    onclick='abrirAjusteEstoque(${p.id}, ${JSON.stringify(p.nome)})'>
                    <i class="fas fa-boxes"></i>
                </button>

                <button

                    class="btn btn-danger btn-sm"

                    onclick="excluirProduto(${p.id})">

                    <i class="fas fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

  }).join("");

}

// =======================================================
// PESQUISA
// =======================================================

function pesquisarProdutos() {

  const texto = buscarProduto.value

    .toLowerCase()

    .trim();

  const filtrados = listaProdutos.filter(p =>

    p.nome.toLowerCase().includes(texto) ||

    (p.categoria || "").toLowerCase().includes(texto) ||

    (p.marca || "").toLowerCase().includes(texto)

  );

  renderizarTabela(filtrados);

}

// =======================================================
// EDITAR
// =======================================================

async function editarProduto(id) {

  const p = listaProdutos.find(

    produto => produto.id === id

  );

  if (!p) return;

  editandoId = id;

  Object.keys(p).forEach(campo => {

    if (form[campo]) {

      form[campo].value =

        p[campo] ?? "";

    }

  });

  $("#modalProduto").modal("show");

}

// =======================================================
// EXCLUIR
// =======================================================

async function excluirProduto(id) {

  if (!confirm("Deseja excluir este produto?"))

    return;

  try {

    const resposta = await fetch(

      `${API}/${id}`,

      {

        method: "DELETE"

      }

    );

    const json = await resposta.json();

    if (!resposta.ok) {

      throw new Error(

        json.error ||

        "Erro ao excluir."

      );

    }

    toast(

      "Produto excluído."

    );

    carregarProdutos();

  }

  catch (erro) {

    console.error(erro);

    toast(

      erro.message,

      "error"

    );

  }

}

// =======================================================
// GLOBAIS
// =======================================================

window.editarProduto = editarProduto;

function abrirAjusteEstoque(id, nome) {
  document.querySelector("#formAjusteEstoque").reset();
  document.querySelector("#ajusteProdutoId").value = id;
  document.querySelector("#ajusteProdutoNome").innerText = nome;
  $("#modalAjusteEstoque").modal("show");
}

async function salvarAjusteEstoque(event) {
  event.preventDefault();
  const id = document.querySelector("#ajusteProdutoId").value;
  const body = { empresaId: usuario.empresaId, tipo: document.querySelector("#ajusteTipo").value, quantidade: document.querySelector("#ajusteQuantidade").value, motivo: document.querySelector("#ajusteMotivo").value, custoUnitario: document.querySelector("#ajusteCusto").value };
  const resposta = await fetch(API + "/" + id + "/estoque", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await resposta.json();
  if (!resposta.ok) return toast(data.error || "Erro ao ajustar estoque.", "error");
  $("#modalAjusteEstoque").modal("hide"); toast("Estoque atualizado e movimento registrado."); carregarProdutos();
}

window.abrirAjusteEstoque = abrirAjusteEstoque;

document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("beforeend", '<div class="modal fade" id="modalAjusteEstoque"><div class="modal-dialog"><form class="modal-content" id="formAjusteEstoque"><div class="modal-header"><h5 class="modal-title">Ajustar estoque: <span id="ajusteProdutoNome"></span></h5><button type="button" class="close" data-dismiss="modal">×</button></div><div class="modal-body"><input type="hidden" id="ajusteProdutoId"><label>Tipo de movimentação</label><select id="ajusteTipo" class="form-control mb-3"><option value="ENTRADA">Entrada / reposição</option><option value="SAIDA">Saída / perda</option></select><label>Quantidade</label><input id="ajusteQuantidade" type="number" min="0.01" step="0.01" class="form-control mb-3" required><label>Custo unitário (opcional)</label><input id="ajusteCusto" type="number" min="0" step="0.01" class="form-control mb-3"><label>Motivo</label><textarea id="ajusteMotivo" class="form-control" required placeholder="Ex.: compra do fornecedor, avaria, inventário"></textarea></div><div class="modal-footer"><button type="button" class="btn btn-light" data-dismiss="modal">Cancelar</button><button class="btn btn-primary">Salvar ajuste</button></div></form></div></div>');
  document.querySelector("#formAjusteEstoque").addEventListener("submit", salvarAjusteEstoque);
});

window.excluirProduto = excluirProduto;
