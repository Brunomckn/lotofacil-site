document.addEventListener("DOMContentLoaded", function () {

    var grid = document.getElementById("grid");
    var contador = document.getElementById("contador");
    var resultado = document.getElementById("resultado");

    var btnConferir = document.getElementById("conferir");
    var btnLimpar = document.getElementById("limpar");
    var btnSalvar = document.getElementById("salvar");
    var btnGerar = document.getElementById("gerar");
    
    var btnAnterior = document.getElementById("anterior");
    var btnProximo = document.getElementById("proximo");

    var infoConcurso = document.getElementById("info-concurso");
    var dezenasSorteadas = document.getElementById("dezenas-sorteadas");
    var statusSalvo = document.getElementById("status-salvo");

    var selecionadas = [];
    var historico = [];
    var indiceAtual = 0;

    // =========================
    // CRIAR DEZENAS 01–25
    // =========================
    for (var i = 1; i <= 25; i++) {
        (function (num) {
            var d = document.createElement("div");
            d.className = "dezena";
            d.innerHTML = (num < 10 ? "0" : "") + num;

            d.addEventListener("click", function () {
                var idx = selecionadas.indexOf(num);
                if (idx !== -1) {
                    selecionadas.splice(idx, 1);
                    d.classList.remove("selecionada");
                } else {
                    if (selecionadas.length >= 15) return;
                    selecionadas.push(num);
                    d.classList.add("selecionada");
                }
                contador.innerHTML = selecionadas.length + "/15 selecionadas";
            });

            grid.appendChild(d);
        })(i);
    }

    // =========================
    // LIMPAR
    // =========================
    btnLimpar.addEventListener("click", function () {
        selecionadas = [];
        var ds = document.querySelectorAll(".dezena");
        for (var i = 0; i < ds.length; i++) {
            ds[i].classList.remove("selecionada");
        }
        contador.innerHTML = "0/15 selecionadas";
        resultado.innerHTML = "";
        infoConcurso.innerHTML = "";
        dezenasSorteadas.innerHTML = "";
        statusSalvo.innerHTML = "";
        localStorage.removeItem("jogo_salvo");
    });

    // =========================
    // SALVAR JOGO
    // =========================
    btnSalvar.addEventListener("click", function () {
        if (selecionadas.length !== 15) {
            alert("Selecione exatamente 15 dezenas para salvar");
            return;
        }
        localStorage.setItem("jogo_salvo", JSON.stringify(selecionadas));
        statusSalvo.innerHTML = "✅ Jogo salvo com sucesso!";
        carregarHistorico();
    });

    // =========================
    // CONFERIR HISTÓRICO GERAL
    // =========================
    btnConferir.addEventListener("click", function () {
        if (selecionadas.length !== 15) {
            alert("Selecione exatamente 15 dezenas");
            return;
        }

        resultado.innerHTML = "Conferindo...";

        fetch("https://lotofacil-api-omfo.onrender.com/conferir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dezenas: selecionadas })
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            resultado.innerHTML =
                "<p><strong>Total de concursos:</strong> " + data.total_concursos + "</p>" +
                "<p>11 pontos: " + data.acertos["11"] + "</p>" +
                "<p>12 pontos: " + data.acertos["12"] + "</p>" +
                "<p>13 pontos: " + data.acertos["13"] + "</p>" +
                "<p>14 pontos: " + data.acertos["14"] + "</p>" +
                "<p>15 pontos: " + data.acertos["15"] + "</p>";
        });
    });

    // =========================
    // CARREGAR HISTÓRICO (ÚLTIMO → ANTERIOR)
    // =========================
    function carregarHistorico() {
        var salvo = localStorage.getItem("jogo_salvo");
        if (!salvo) return;

        fetch("https://lotofacil-api-omfo.onrender.com/historico_jogo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dezenas: JSON.parse(salvo) })
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            historico = data.historico;
            indiceAtual = historico.length - 1;
            mostrarConcurso();
        });
    }

    // =========================
    // MOSTRAR CONCURSO
    // =========================
   function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function gerarJogoInteligente() {
    var pares = [];
    var impares = [];

    for (var i = 1; i <= 25; i++) {
        if (i % 2 === 0) pares.push(i);
        else impares.push(i);
    }

    shuffle(pares);
    shuffle(impares);

    var jogo = [];

    // 7 pares e 8 ímpares
    jogo = jogo.concat(pares.slice(0, 7));
    jogo = jogo.concat(impares.slice(0, 8));

    // garantir 8 números de 1–13
    var baixos = jogo.filter(n => n <= 13).length;
    if (baixos < 8) {
        var faltam = 8 - baixos;
        var candidatos = [];
        for (var i = 1; i <= 13; i++) {
            if (!jogo.includes(i)) candidatos.push(i);
        }
        shuffle(candidatos);
        for (var i = 0; i < faltam; i++) {
            jogo.pop();
            jogo.push(candidatos[i]);
        }
    }

    jogo.sort(function (a, b) { return a - b; });

    // evitar sequência maior que 3
    var sequencia = 1;
    for (var i = 1; i < jogo.length; i++) {
        if (jogo[i] === jogo[i - 1] + 1) {
            sequencia++;
            if (sequencia > 3) {
                return gerarJogoInteligente(); // refaz
            }
        } else {
            sequencia = 1;
        }
    }

    return jogo;
}

    function mostrarConcurso() {
        if (!historico.length) return;

        var item = historico[indiceAtual];
        var ganhou = item.acertos >= 11;

        infoConcurso.innerHTML =
            "<strong>Concurso:</strong> " + item.concurso +
            " | <strong>Acertos:</strong> " + item.acertos;

        dezenasSorteadas.innerHTML =
            "<div class='" + (ganhou ? "ganhou" : "nao-ganhou") + "'>" +
            (ganhou
                ? "🎉 PARABÉNS! SEU JOGO TERIA GANHADO PRÊMIO NESTE CONCURSO"
                : "❌ Não houve premiação neste concurso"
            ) +
            "</div>" +
            "<br><strong>Dezenas sorteadas:</strong><br>" +
            item.dezenas_sorteadas.join(" - ") +
            "<hr><strong>Premiação do concurso:</strong><br>" +
            "15 pontos: " + item.premios["15"] + "<br>" +
            "14 pontos: " + item.premios["14"] + "<br>" +
            "13 pontos: " + item.premios["13"] + "<br>" +
            "12 pontos: " + item.premios["12"] + "<br>" +
            "11 pontos: " + item.premios["11"];
    }

    btnAnterior.addEventListener("click", function () {
        if (indiceAtual > 0) {
            indiceAtual--;
            mostrarConcurso();
        }
    });

    btnGerar.addEventListener("click", function () {
    var jogo = gerarJogoInteligente();

    // limpar seleção atual
    selecionadas = [];
    var ds = document.querySelectorAll(".dezena");
    for (var i = 0; i < ds.length; i++) {
        ds[i].classList.remove("selecionada");
    }

    // marcar novo jogo
    jogo.forEach(function (num) {
        selecionadas.push(num);
        for (var i = 0; i < ds.length; i++) {
            if (parseInt(ds[i].innerHTML, 10) === num) {
                ds[i].classList.add("selecionada");
            }
        }
    });

    contador.innerHTML = "15/15 selecionadas";
    statusSalvo.innerHTML = "🎲 Jogo inteligente gerado";
});

    btnProximo.addEventListener("click", function () {
        if (indiceAtual < historico.length - 1) {
            indiceAtual++;
            mostrarConcurso();
        }
    });

    // =========================
    // CARREGAR JOGO AO ABRIR
    // =========================
    var jogoSalvo = localStorage.getItem("jogo_salvo");
    if (jogoSalvo) {
        selecionadas = JSON.parse(jogoSalvo);
        var ds = document.querySelectorAll(".dezena");
        for (var i = 0; i < ds.length; i++) {
            var num = parseInt(ds[i].innerHTML, 10);
            if (selecionadas.indexOf(num) !== -1) {
                ds[i].classList.add("selecionada");
            }
        }
        contador.innerHTML = selecionadas.length + "/15 selecionadas";
        statusSalvo.innerHTML = "ℹ️ Jogo carregado automaticamente";
        carregarHistorico();
    }

});

