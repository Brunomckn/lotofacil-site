document.addEventListener("DOMContentLoaded", function () {

    // ============= ELEMENTOS (com proteção)
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


    // ======================================================
    //  CRIAR GRADE DE DEZENAS (só se existir #grid na página)
    // ======================================================
    if (grid && contador) {

        for (let i = 1; i <= 25; i++) {
            let num = i;

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
        }
    }


    // ==========================
    // BOTÃO LIMPAR (protegido)
    // ==========================
    if (btnLimpar) {
        btnLimpar.addEventListener("click", function () {
            selecionadas = [];

            var ds = document.querySelectorAll(".dezena");
            ds.forEach(d => d.classList.remove("selecionada"));

            if (contador) contador.innerHTML = "0/15 selecionadas";
            if (resultado) resultado.innerHTML = "";
            if (infoConcurso) infoConcurso.innerHTML = "";
            if (dezenasSorteadas) dezenasSorteadas.innerHTML = "";
            if (statusSalvo) statusSalvo.innerHTML = "";

            localStorage.removeItem("jogo_salvo");
        });
    }


    // ==========================
    // SALVAR JOGO
    // ==========================
    if (btnSalvar) {
        btnSalvar.addEventListener("click", function () {
            if (selecionadas.length !== 15) {
                alert("Selecione exatamente 15 dezenas para salvar.");
                return;
            }

            localStorage.setItem("jogo_salvo", JSON.stringify(selecionadas));

            if (statusSalvo)
                statusSalvo.innerHTML = "✅ Jogo salvo com sucesso!";

            carregarHistorico();
        });
    }


    // ==========================
    // CONFERIR GERAL
    // ==========================
    if (btnConferir) {
        btnConferir.addEventListener("click", function () {
            if (selecionadas.length !== 15) {
                alert("Selecione exatamente 15 dezenas");
                return;
            }

            if (resultado)
                resultado.innerHTML = "Conferindo...";

            fetch("https://lotofacil-api-omfo.onrender.com/conferir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dezenas: selecionadas })
            })
            .then(res => res.json())
            .then(data => {
                resultado.innerHTML =
                    "<p><strong>Total de concursos:</strong> " + data.total_concursos + "</p>" +
                    "<p>11 pontos: " + data.acertos["11"] + "</p>" +
                    "<p>12 pontos: " + data.acertos["12"] + "</p>" +
                    "<p>13 pontos: " + data.acertos["13"] + "</p>" +
                    "<p>14 pontos: " + data.acertos["14"] + "</p>" +
                    "<p>15 pontos: " + data.acertos["15"] + "</p>";
            });
        });
    }


    // ==========================================================
    // HISTÓRICO DE PREMIOS (caso a página tenha esse recurso)
    // ==========================================================
    function carregarHistorico() {
        var salvo = localStorage.getItem("jogo_salvo");
        if (!salvo) return;

        fetch("https://lotofacil-api-omfo.onrender.com/historico_jogo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dezenas: JSON.parse(salvo) })
        })
        .then(res => res.json())
        .then(data => {
            historico = data.historico;
            indiceAtual = historico.length - 1;
            mostrarConcurso();
        });
    }


    function mostrarConcurso() {
        if (!historico.length || !infoConcurso || !dezenasSorteadas) return;

        var item = historico[indiceAtual];
        var ganhou = item.acertos >= 11;

        infoConcurso.innerHTML =
            "<strong>Concurso:</strong> " + item.concurso +
            " | <strong>Acertos:</strong> " + item.acertos;

        dezenasSorteadas.innerHTML =
            "<div class='" + (ganhou ? "ganhou" : "nao-ganhou") + "'>" +
            (ganhou ? "🎉 Ganhou prêmio!" : "❌ Não premiou") +
            "</div>" +
            "<br><strong>Dezenas sorteadas:</strong><br>" +
            item.dezenas_sorteadas.join(" - ") +
            "<hr>" +
            "<strong>Premiação:</strong><br>" +
            "15 pts: " + item.premios["15"] + "<br>" +
            "14 pts: " + item.premios["14"] + "<br>" +
            "13 pts: " + item.premios["13"] + "<br>" +
            "12 pts: " + item.premios["12"] + "<br>" +
            "11 pts: " + item.premios["11"];
    }


    // BOTÕES historico (também protegidos)
    if (btnAnterior) {
        btnAnterior.addEventListener("click", function () {
            if (indiceAtual > 0) {
                indiceAtual--;
                mostrarConcurso();
            }
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener("click", function () {
            if (indiceAtual < historico.length - 1) {
                indiceAtual++;
                mostrarConcurso();
            }
        });
    }


    // ==========================================================
    // GERADOR INTELIGENTE (somente se botão existir)
    // ==========================================================
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    function gerarJogoInteligente() {
        let pares = [], impares = [];

        for (let i = 1; i <= 25; i++) {
            (i % 2 === 0 ? pares : impares).push(i);
        }

        shuffle(pares);
        shuffle(impares);

        let jogo = pares.slice(0, 7).concat(impares.slice(0, 8));

        let baixos = jogo.filter(n => n <= 13).length;

        if (baixos < 8) {
            let candidatos = [];
            for (let i = 1; i <= 13; i++)
                if (!jogo.includes(i)) candidatos.push(i);

            shuffle(candidatos);

            for (let i = 0; i < (8 - baixos); i++) {
                jogo.pop();
                jogo.push(candidatos[i]);
            }
        }

        jogo.sort((a, b) => a - b);

        // evitar sequência > 3
        let seq = 1;
        for (let i = 1; i < jogo.length; i++) {
            if (jogo[i] === jogo[i - 1] + 1) {
                seq++;
                if (seq > 3) return gerarJogoInteligente();
            } else seq = 1;
        }

        return jogo;
    }

    if (btnGerar) {
        btnGerar.addEventListener("click", function () {

            var jogo = gerarJogoInteligente();

            selecionadas = [];
            var ds = document.querySelectorAll(".dezena");
            ds.forEach(d => d.classList.remove("selecionada"));

            jogo.forEach(function (num) {
                selecionadas.push(num);

                ds.forEach(function (d) {
                    if (parseInt(d.innerHTML) === num)
                        d.classList.add("selecionada");
                });
            });

            contador.innerHTML = "15/15 selecionadas";
            statusSalvo.innerHTML = "🎲 Jogo inteligente gerado";
        });
    }


    // Carregar jogo salvo ao entrar
    var jogoSalvo = localStorage.getItem("jogo_salvo");
    if (jogoSalvo && grid) {
        selecionadas = JSON.parse(jogoSalvo);

        var ds = document.querySelectorAll(".dezena");
        ds.forEach(function (d) {
            var num = parseInt(d.innerHTML);
            if (selecionadas.includes(num))
                d.classList.add("selecionada");
        });

        contador.innerHTML = selecionadas.length + "/15 selecionadas";
        if (statusSalvo)
            statusSalvo.innerHTML = "ℹ️ Jogo carregado automaticamente";

        carregarHistorico();
    }

});
