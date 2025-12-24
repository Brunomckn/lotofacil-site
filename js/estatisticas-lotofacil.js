document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://lotofacil-api-omfo.onrender.com/resultados";

  const freqContainer = document.getElementById("frequencia-dezenas");
  const paresImparesEl = document.getElementById("pares-impares");
  const baixasAltasEl = document.getElementById("baixas-altas");
  const totalConcursosEl = document.getElementById("total-concursos");
  const ultimoConcursoEl = document.getElementById("ultimo-concurso");

  // Se não for a página de estatísticas, não faz nada
  if (!freqContainer) return;

  fetch(API_URL)
    .then(res => res.json())
    .then(resultados => {
      calcularEstatisticas(resultados);
    })
    .catch(() => {
      // Falha silenciosa (API pode estar dormindo no Render)
    });

  function calcularEstatisticas(resultados) {

    let freq = {};
    let pares = 0;
    let impares = 0;
    let baixas = 0;
    let altas = 0;
    let totalNumeros = 0;

    for (let i = 1; i <= 25; i++) freq[i] = 0;

    resultados.forEach(concurso => {
      concurso.dezenas.forEach(n => {

        freq[n]++;
        totalNumeros++;

        if (n % 2 === 0) pares++;
        else impares++;

        if (n <= 13) baixas++;
        else altas++;

      });
    });

    mostrarFrequencia(freq);
    mostrarDistribuicao(pares, impares, baixas, altas, totalNumeros);

    if (totalConcursosEl)
      totalConcursosEl.innerText = resultados.length;

    if (ultimoConcursoEl) {
      const ultimo = resultados[resultados.length - 1];
      ultimoConcursoEl.innerText =
        `Concurso ${ultimo.concurso} – ${ultimo.data}`;
    }
  }

  function mostrarFrequencia(freq) {

    let lista = Object.entries(freq)
      .sort((a, b) => b[1] - a[1]);

    freqContainer.innerHTML = "";

    lista.forEach(([dezena, vezes]) => {
      const div = document.createElement("div");
      div.className = "freq-item";
      div.innerHTML = `<strong>${dezena.toString().padStart(2, "0")}</strong>${vezes}x`;
      freqContainer.appendChild(div);
    });
  }

  function mostrarDistribuicao(pares, impares, baixas, altas, total) {

    if (paresImparesEl)
      paresImparesEl.innerHTML =
        `Pares: ${pares} (${percentual(pares, total)}%)<br>
         Ímpares: ${impares} (${percentual(impares, total)}%)`;

    if (baixasAltasEl)
      baixasAltasEl.innerHTML =
        `Baixas (1–13): ${baixas} (${percentual(baixas, total)}%)<br>
         Altas (14–25): ${altas} (${percentual(altas, total)}%)`;
  }

  function percentual(valor, total) {
    return ((valor / total) * 100).toFixed(1);
  }

});
