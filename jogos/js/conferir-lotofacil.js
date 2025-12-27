document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://lotofacil-api-omfo.onrender.com/conferir";

  const grid = document.getElementById("grid");
  const contador = document.getElementById("contador");
  const resultado = document.getElementById("resultado");

  const btnLimpar = document.getElementById("limpar");
  const btnConferir = document.getElementById("conferir");

  let selecionadas = [];

  // =========================
  // CRIAR DEZENAS 01–25
  // =========================
  for (let i = 1; i <= 25; i++) {

    const d = document.createElement("div");
    d.className = "dezena";
    d.innerText = i.toString().padStart(2, "0");

    d.addEventListener("click", function () {

      const num = i;
      const idx = selecionadas.indexOf(num);

      if (idx !== -1) {
        selecionadas.splice(idx, 1);
        d.classList.remove("selecionada");
      } else {
        if (selecionadas.length >= 15) return;
        selecionadas.push(num);
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
    contador.innerText = "0/15 selecionadas";
    resultado.innerHTML = "";

    document.querySelectorAll(".dezena")
      .forEach(d => d.classList.remove("selecionada"));
  });

  // =========================
  // CONFERIR
  // =========================
  btnConferir.addEventListener("click", function () {

    if (selecionadas.length !== 15) {
      alert("Selecione exatamente 15 dezenas");
      return;
    }

    resultado.innerHTML = "Conferindo...";

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dezenas: selecionadas })
    })
    .then(res => res.json())
    .then(data => {

      resultado.innerHTML = `
        <p><strong>Total de concursos:</strong> ${data.total_concursos}</p>
        <p>11 pontos: ${data.acertos["11"]}</p>
        <p>12 pontos: ${data.acertos["12"]}</p>
        <p>13 pontos: ${data.acertos["13"]}</p>
        <p>14 pontos: ${data.acertos["14"]}</p>
        <p>15 pontos: ${data.acertos["15"]}</p>
      `;
    })
    .catch(() => {
      resultado.innerHTML = "Erro ao conectar com a API.";
    });
  });

});
