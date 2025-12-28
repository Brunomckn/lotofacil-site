const API = "https://SEU-ENDPOINT.onrender.com";

const LOTERIAS = [
  { id: "lotofacil", nome: "Lotofácil" },
  { id: "megasena", nome: "Mega-Sena" },
  { id: "quina", nome: "Quina" },
  { id: "lotomania", nome: "Lotomania" },
  { id: "duplasena", nome: "Dupla-Sena" },
  { id: "diadesorte", nome: "Dia de Sorte" }
];

const container = document.getElementById("resultados");
container.innerHTML = "";

LOTERIAS.forEach(loteria => {
  fetch(`${API}/ultimo/${loteria.id}`)
    .then(res => res.json())
    .then(data => renderLoteria(loteria, data))
    .catch(() => {});
});

function renderLoteria(loteria, data) {

  const card = document.createElement("div");
  card.className = `card-loteria ${loteria.id}`;

  let dezenasHtml = "";
  data.dezenas.forEach(n => {
    dezenasHtml += `<span class="dezena">${n.toString().padStart(2,"0")}</span>`;
  });

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
