document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://lotofacil-api-omfo.onrender.com/resultados";
  const usuarioPremium = true; // false = gratuito

  // ===== ELEMENTOS =====
  const freqContainer = document.getElementById("frequencia-dezenas");
  const paresImparesEl = document.getElementById("pares-impares");
  const baixasAltasEl = document.getElementById("baixas-altas");
  const totalConcursosEl = document.getElementById("total-concursos");
  const ultimoConcursoEl = document.getElementById("ultimo-concurso");

  const somaInfoEl = document.getElementById("soma-info");
  const maisSorteadasEl = document.getElementById("mais-sorteadas");
  const maisAtrasadasEl = document.getElementById("mais-atrasadas");
  const linhasInfoEl = document.getElementById("linhas-info");
  const colunasInfoEl = document.getElementById("colunas-info");

  const inputQtd = document.getElementById("qtdConcursos");
  const btnPremium = document.getElementById("btnPremium");

  if (!freqContainer) return;

  // ===== PREMIUM =====
  if (usuarioPremium && inputQtd && btnPremium) {
    inputQtd.disabled = false;
    btnPremium.disabled = false;
    btnPremium.addEventListener("click", carregarEstatisticas);
  }

  carregarEstatisticas();

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

  function calcularEstatisticas(resultados) {

    let freq = {};
    let atraso = {};
    let somas = [];
    let pares = 0, impares = 0, baixas = 0, altas = 0;

    let linhas = [0,0,0,0,0];
    let colunas = [0,0,0,0,0];

    for (let i = 1; i <= 25; i++) {
      freq[i] = 0;
      atraso[i] = 0;
    }

    resultados.forEach((concurso, index) => {
      const dezenas = normalizarDezenas(concurso);
      let soma = 0;

      dezenas.forEach(n => {
        freq[n]++;
        atraso[n] = 0;
        soma += n;

        if (n % 2 === 0) pares++; else impares++;
        if (n <= 13) baixas++; else altas++;

        linhas[Math.floor((n - 1) / 5)]++;
        colunas[(n - 1) % 5]++;
      });

      somas.push(soma);

      for (let i = 1; i <= 25; i++) {
        if (!dezenas.includes(i)) atraso[i]++;
      }
    });

    renderFrequencia(freq);
    renderDistribuicao(pares, impares, baixas, altas, resultados.length * 15);
    renderSoma(somas);
    renderMaisMenos(freq, atraso);
    renderLinhasColunas(linhas, colunas);

    totalConcursosEl.innerText = resultados.length;
    ultimoConcursoEl.innerText = `Total de concursos analisados: ${resultados.length}`;
  }

  function normalizarDezenas(concurso) {
    if (concurso.dezenas) return concurso.dezenas;
    let d = [];
    for (let i = 1; i <= 15; i++) d.push(Number(concurso["Bola" + i]));
    return d;
  }

  function aplicarFiltroPremium(resultados) {
    if (!usuarioPremium || !inputQtd || !inputQtd.value) return resultados;
    const qtd = parseInt(inputQtd.value, 10);
    return resultados.slice(-qtd);
  }

  function renderFrequencia(freq) {
    freqContainer.innerHTML = "";
    Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([d,v])=>{
      freqContainer.innerHTML += `<div>${d.padStart(2,"0")} → ${v}x</div>`;
    });
  }

  function renderDistribuicao(p,i,b,a,total) {
    paresImparesEl.innerHTML = `Pares: ${p} (${pct(p,total)}%)<br>Ímpares: ${i} (${pct(i,total)}%)`;
    baixasAltasEl.innerHTML = `Baixas: ${b} (${pct(b,total)}%)<br>Altas: ${a} (${pct(a,total)}%)`;
  }

  function renderSoma(s) {
    somaInfoEl.innerHTML =
      `Soma mínima: ${Math.min(...s)}<br>
       Soma máxima: ${Math.max(...s)}<br>
       Soma média: ${(s.reduce((a,b)=>a+b,0)/s.length).toFixed(1)}`;
  }

  function renderMaisMenos(freq, atraso) {
    maisSorteadasEl.innerHTML =
      Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
      .map(d=>`Dezena ${d[0]} (${d[1]}x)`).join("<br>");

    maisAtrasadasEl.innerHTML =
      Object.entries(atraso).sort((a,b)=>b[1]-a[1]).slice(0,5)
      .map(d=>`Dezena ${d[0]} (${d[1]} concursos)`).join("<br>");
  }

  function renderLinhasColunas(l,c) {
    linhasInfoEl.innerHTML = l.map((v,i)=>`Linha ${i+1}: ${v}`).join("<br>");
    colunasInfoEl.innerHTML = c.map((v,i)=>`Coluna ${i+1}: ${v}`).join("<br>");
  }

  function pct(v,t){ return ((v/t)*100).toFixed(1); }

});
