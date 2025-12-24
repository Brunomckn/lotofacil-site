document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://lotofacil-api-omfo.onrender.com/resultados";

  fetch(API_URL)
    .then(res => res.json())
    .then(dados => {
      calcularEstatisticas(dados);
    })
    .catch(err => {
      console.error("Erro ao carregar estatísticas:", err);
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
  }

  function mostrarFrequencia(freq) {
    let container = document.getElementById("freq-dezenas");
    let lista = Object.entries(freq)
      .sort((a, b) => b[1] - a[1]);

    let html = "<ul>";
    lista.forEach(item => {
      html += `<li>Dezena ${item[0]}: ${item[1]} vezes</li>`;
    });
    html += "</ul>";

    container.innerHTML = html;
  }

  function mostrarDistribuicao(pares, impares, baixas, altas, total) {
    document.getElementById("pares-impares").innerHTML =
      `Pares: ${pares} (${percentual(pares, total)}%)<br>
       Ímpares: ${impares} (${percentual(impares, total)}%)`;

    document.getElementById("baixas-altas").innerHTML =
      `Baixas (1–13): ${baixas} (${percentual(baixas, total)}%)<br>
       Altas (14–25): ${altas} (${percentual(altas, total)}%)`;
  }

  function percentual(valor, total) {
    return ((valor / total) * 100).toFixed(1);
  }

});
