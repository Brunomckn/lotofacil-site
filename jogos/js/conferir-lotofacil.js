document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://lotofacil-api-omfo.onrender.com/historico_jogo";

  const grid = document.getElementById("grid");
  const contador = document.getElementById("contador");
  const resultado = document.getElementById("resultado");

  const btnConferir = document.getElementById("conferir");
  const btnLimpar = document.getElementById("limpar");
  const btnSalvar = document.getElementById("salvar");

  const btnAnterior = document.getElementById("anterior");
  const btnProximo = document.getElementById("proximo");
  const btnPrimeiro = document.getElementById("primeiro");
  const btnUltimo = document.getElementById("ultimo");

  let selecionadas = [];
  let historico = [];
  let indiceAtual = 0;

  // =========================
  // CRIAR GRID 01–25
  // =========================
  for (let i = 1; i <= 25; i++) {
    const d = document.createElement("div");
    d.className = "dezena";
    d.innerText = i.toString().padStart(2, "0");

    d.addEventListener("click", function () {

      const idx = selecionadas.indexOf(i);

      if (idx !== -1) {
        selecionadas.splice(idx, 1);
        d.classList.remove("selecionada");
      } else {
        if (selecionadas.length >= 15) return;
        selecionadas.push(i);
        d.classList.add("selecionada");
      }

      contador.innerText = `${selecionadas.length}/15 selecionadas`;
    });

    grid.appendChild(d);
  }

  // =========================
  // LIMPAR
  // =========================
  btnLimpar.addEventListener("click", function () {
    selecionadas = [];
    historico = [];
    indiceAtual = 0;

    document.querySelectorAll(".dezena").forEach(d => {
      d.classList.remove("selecionada");
    });

    contador.innerText = "0/15 selecionadas";
    resultado.innerHTML = "";
  });
// =========================
// SALVAR JOGO
// =========================
btnSalvar.addEventListener("click", function () {

  if (selecionadas.length !== 15) {
    alert("Selecione exatamente 15 dezenas antes de salvar.");
    return;
  }

  localStorage.setItem("jogo_lotofacil_salvo", JSON.stringify(selecionadas));

  alert("✅ Jogo salvo com sucesso!");
});

  // =========================
  // CONFERIR (CARREGA HISTÓRICO)
  // =========================
  btnConferir.addEventListener("click", function () {

    if (selecionadas.length !== 15) {
      alert("Selecione exatamente 15 dezenas.");
      return;
    }

    resultado.innerHTML = "Carregando histórico...";

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dezenas: selecionadas })
    })
    .then(res => res.json())
    .then(data => {

      historico = data.historico;

      // 👉 SEMPRE começa no ÚLTIMO concurso
      indiceAtual = historico.length - 1;
      mostrarConcurso();

    })
    .catch(() => {
      resultado.innerHTML = "Erro ao carregar histórico.";
    });
  });

  // =========================
  // MOSTRAR CONCURSO ATUAL
  // =========================
  function mostrarConcurso() {

    if (!historico.length) return;

    const item = historico[indiceAtual];
    const ganhou = item.acertos >= 11;

    resultado.innerHTML = `
      <p><strong>Concurso:</strong> ${item.concurso}</p>
      <p><strong>Acertos:</strong> ${item.acertos}</p>

      <p>
        ${ganhou
          ? "🎉 ESTE JOGO TERIA SIDO PREMIADO"
          : "❌ Sem premiação neste concurso"}
      </p>

      <p><strong>Dezenas sorteadas:</strong></p>
      <p>${item.dezenas_sorteadas.join(" - ")}</p>
    `;
  }

  // =========================
  // NAVEGAÇÃO
  // =========================
  btnAnterior.addEventListener("click", function () {
    if (indiceAtual > 0) {
      indiceAtual--;
      mostrarConcurso();
    }
  });

  btnProximo.addEventListener("click", function () {
    if (indiceAtual < historico.length - 1) {
      indiceAtual++;
      mostrarConcurso();
    }
  });

  btnPrimeiro.addEventListener("click", function () {
    indiceAtual = 0;
    mostrarConcurso();
  });

  btnUltimo.addEventListener("click", function () {
    indiceAtual = historico.length - 1;
    mostrarConcurso();
  });
// =========================
// CARREGAR JOGO SALVO AO ABRIR
// =========================
const jogoSalvo = localStorage.getItem("jogo_lotofacil_salvo");

if (jogoSalvo) {
  selecionadas = JSON.parse(jogoSalvo);

  document.querySelectorAll(".dezena").forEach(d => {
    const num = parseInt(d.innerText, 10);
    if (selecionadas.includes(num)) {
      d.classList.add("selecionada");
    }
  });

  contador.innerText = `${selecionadas.length}/15 selecionadas`;
}

});
