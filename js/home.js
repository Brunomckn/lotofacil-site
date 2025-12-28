// =============================
// CONFIGURAÇÃO
// =============================
const API_BASE = "https://lotofacil-api-omfo.onrender.com/"; // <<< TROQUE AQUI

const LOTERIAS = [
  { id: "lotofacil", nome: "Lotofácil" },
  { id: "megasena", nome: "Mega-Sena" },
  { id: "quina", nome: "Quina" },
  { id: "lotomania", nome: "Lotomania" },
  { id: "duplasena", nome: "Dupla-Sena" },
  { id: "diadesorte", nome: "Dia de Sorte" }
];

// =============================
// INÍCIO
// =============================
document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("resultados");

  if (!container) {
    console.error("Elemento #resultados não encontrado no HTML");
    return;
  }

  container.innerHTML = "";

  LOTERIAS.forEach(loteria => {
    carregarUltimoResultado(loteria, container);
  });

});

// =============================
// FUNÇÕES
// =============================
function carregarUltimoResultado(loteria, container) {

  fetch(`${API_BASE}/ultimo/${loteria.id}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erro API ${loteria.id}`);
      }
      return res.json();
    })
    .then(data => {
      renderLoteria(loteria, data, container);
    })
    .catch(err => {
      console.warn(`Falha ao carregar ${loteria.nome}`, err);
    });
}

function renderLoteria(loteria, data, container) {

  if (!data || !data.dezenas) return;

  const card = document.createElement("div");
  card.className = `card-loteria ${loteria.id}`;

  const dezenasHtml = data.dezenas
    .map(n => `<span class="dezena">${n.toString().padStart(2, "0")}</span>`)
    .join("");

  card.innerHTML = `
    <h2>${loteria.nome}</h2>
    <div class="dezenas">${dezenasHtml}</div>
    <div class="acoes">
      <a href="jogos/${loteria.id}/estatisticas.html">📊 Estatísticas</a>
      <a href="jogos/${loteria.id}/conferir.html">✅ Conferir</a>
    </div>
  `;

  container.appendChild(card);
}
