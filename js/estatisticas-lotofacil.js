document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://lotofacil-api-omfo.onrender.com/resultados";

  // ===== SIMULAÇÃO DE USUÁRIO PREMIUM =====
  const usuarioPremium = true; // false = gratuito

  // ===== ELEMENTOS =====
  const somaInfoEl = document.getElementById("soma-info");
  const freqContainer = document.getElementById("frequencia-dezenas");
  const paresImparesEl = document.getElementById("pares-impares");
  const baixasAltasEl = document.getElementById("baixas-altas");
  const totalConcursosEl = document.getElementById("total-concursos");
  const ultimoConcursoEl = document.getElementById("ultimo-concurso");
  const inputQtd = document.getElementById("qtdConcursos");
  const btnPremium = document.getElementById("btnPremium");

  if (!freqContainer) return;

  // ===== LIBERA PREMIUM =====
  if (usuarioPremium && inputQtd && btnPremium) {
    inputQtd.disabled = false;
    btnPremium.disabled = false;
    btnPremium.addEventListener("click", carregarEstatisticas);
  }

  // ===== CARREGA NA ABERTURA =====
  carregarEstatisticas();

  // =============================
  // FUNÇÃO PRINCIPAL
  // =============================
  function carregarEstatisticas() {

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {

        const resultados = data.resultados || data;
        const filtrados = aplicarFiltroPremium(resultados);
        calcularEstatisticas(filtrados);

      })
      .catch(() => {});
  }

  // =============================
  // ESTATÍSTICAS BASE
  // =============================
  function calcularEstatisticas(resultados) {

    let freq = {};
    let pares = 0;
    let impares = 0;
    let baixas = 0;
    let altas = 0;
    let totalNumeros = 0;

    for (let i = 1; i <= 25; i++) freq[i] = 0;

    resultados.forEach(concurso => {

      const dezenas = normalizarDezenas(concurso);

      dezenas.forEach(n => {
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

    if (ultimoConcursoEl)
      ultimoConcursoEl.innerText =
        `Total de concursos analisados: ${resultados.length}`;
  }

  // =============================
  // AUXILIARES
  // =============================
  function normalizarDezenas(concurso) {

    if (concurso.dezenas) return concurso.dezenas;

    let dezenas = [];
    for (let i = 1; i <= 15; i++) {
      const v = concurso["Bola" + i];
      if (v) dezenas.push(Number(v));
    }
    return dezenas;
  }

  function aplicarFiltroPremium(resultados) {

    if (!usuarioPremium || !inputQtd || !inputQtd.value)
      return resultados;

    const qtd = parseInt(inputQtd.value, 10);
    if (isNaN(qtd) || qtd <= 0)
      return resultados;

    return resultados.slice(-qtd);
  }

  // =============================
  // RENDERIZAÇÃO
  // =============================
  function mostrarFrequencia(freq) {

    freqContainer.innerHTML = "";

    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .forEach(([dezena, vezes]) => {

        const div = document.createElement("div");
        div.className = "freq-item";
        div.innerHTML =
          `<strong>${dezena.toString().padStart(2, "0")}</strong> ${vezes}x`;
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
