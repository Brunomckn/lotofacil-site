document.addEventListener("DOMContentLoaded", function () {

    var grid = document.getElementById("grid");
    var contador = document.getElementById("contador");
    var resultado = document.getElementById("resultado");

    var btnConferir = document.getElementById("conferir");
    var btnLimpar = document.getElementById("limpar");
    var btnSalvar = document.getElementById("salvar");

    var btnAnterior = document.getElementById("anterior");
    var btnProximo = document.getElementById("proximo");

    var infoConcurso = document.getElementById("info-concurso");
    var dezenasSorteadas = document.getElementById("dezenas-sorteadas");
    var statusSalvo = document.getElementById("status-salvo");

    var selecionadas = [];
    var historico = [];
    var indiceAtual = 0;

    var usuarioPremium = false; // futuramente vira true após pagamento

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
    // CARREGAR HISTÓRICO (COMEÇA PELO ÚLTIMO)
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
            indiceAtual = historico.length - 1; // ÚLTIMO CONCURSO
            mostrarConcurso();
        });
    }

    function calcularTotalAcumulado() {
    var total = 0;

    for (var i = 0; i < historico.length; i++) {
        var item = historico[i];

        if (item.acertos >= 11) {
            var premio = item.premios[item.acertos.toString()];

            if (premio) {
                // remove R$, pontos e troca vírgula
                var valor = premio
                    .replace("R$", "")
                    .replace(/\./g, "")
                    .replace(",", ".")
                    .trim();

                var numero = parseFloat(valor);
                if (!isNaN(numero)) {
                    total += numero;
                }
            }
        }
    }

    return total.toFixed(2);
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
        "<hr>" +
        "<strong>Premiação do concurso:</strong><br>" +
        "15 pontos: " + item.premios["15"] + "<br>" +
        "14 pontos: " + item.premios["14"] + "<br>" +
        "13 pontos: " + item.premios["13"] + "<br>" +
        "12 pontos: " + item.premios["12"] + "<br>" +
        "11 pontos: " + item.premios["11"];
}
var totalAcumulado = calcularTotalAcumulado();

dezenasSorteadas.innerHTML +=
    "<hr><strong>Total acumulado com este jogo:</strong><br>" +
    (usuarioPremium
        ? "💰 R$ " + totalAcumulado
        : "🔒 Premium – desbloqueie para ver"
    );


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



