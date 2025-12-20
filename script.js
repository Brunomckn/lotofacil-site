document.addEventListener("DOMContentLoaded", function () {

  var btnAnterior = document.getElementById("anterior");
var btnProximo = document.getElementById("proximo");
var infoConcurso = document.getElementById("info-concurso");
var dezenasSorteadas = document.getElementById("dezenas-sorteadas");

var historico = [];
var indiceAtual = 0;

// carregar histórico quando houver jogo salvo
if (localStorage.getItem("jogo_salvo")) {
    fetch("https://lotofacil-api-omfo.onrender.com/historico_jogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            dezenas: JSON.parse(localStorage.getItem("jogo_salvo"))
        })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        historico = data.historico;
        indiceAtual = 0;
        mostrarConcurso();
    });
}

function mostrarConcurso() {
    if (!historico.length) return;

    var item = historico[indiceAtual];

    infoConcurso.innerHTML =
        "<strong>Concurso:</strong> " + item.concurso +
        " | <strong>Acertos:</strong> " + item.acertos;

    dezenasSorteadas.innerHTML =
        "<strong>Dezenas sorteadas:</strong><br>" +
        item.dezenas_sorteadas.join(" - ");
}

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

    const grid = document.getElementById("grid");
    const contador = document.getElementById("contador");
    const resultado = document.getElementById("resultado");

    const btnConferir = document.getElementById("conferir");
    const btnLimpar = document.getElementById("limpar");
    const btnSalvar = document.getElementById("salvar");
    const statusSalvo = document.getElementById("status-salvo");

    let selecionadas = [];

    // =========================
    // CRIAR DEZENAS (01 a 25)
    // =========================
    for (let i = 1; i <= 25; i++) {
        const d = document.createElement("div");
        d.className = "dezena";
        d.textContent = i.toString().padStart(2, "0");

        d.addEventListener("click", () => {
            if (selecionadas.includes(i)) {
                selecionadas = selecionadas.filter(n => n !== i);
                d.classList.remove("selecionada");
            } else {
                if (selecionadas.length >= 15) return;
                selecionadas.push(i);
                d.classList.add("selecionada");
            }
            contador.textContent = `${selecionadas.length}/15 selecionadas`;
        });

        grid.appendChild(d);
    }

    // =========================
    // LIMPAR JOGO
    // =========================
    btnLimpar.addEventListener("click", () => {
        selecionadas = [];
        document.querySelectorAll(".dezena").forEach(d => d.classList.remove("selecionada"));
        contador.textContent = "0/15 selecionadas";
        resultado.innerHTML = "";
        statusSalvo.textContent = "";
        localStorage.removeItem("jogo_salvo");
    });

    // =========================
    // CONFERIR HISTÓRICO
    // =========================
    btnConferir.addEventListener("click", () => {
        if (selecionadas.length !== 15) {
            alert("Selecione exatamente 15 dezenas");
            return;
        }

        resultado.innerHTML = "<p>Conferindo...</p>";

        fetch("https://lotofacil-api-omfo.onrender.com/conferir", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ dezenas: selecionadas })
        })
        .then(res => res.json())
        .then(data => {
            resultado.innerHTML = `
                <p><strong>Total de concursos analisados:</strong> ${data.total_concursos}</p>
                <hr>
                <p>11 pontos: ${data.acertos["11"]}</p>
                <p>12 pontos: ${data.acertos["12"]}</p>
                <p>13 pontos: ${data.acertos["13"]}</p>
                <p>14 pontos: ${data.acertos["14"]}</p>
                <p>15 pontos: ${data.acertos["15"]}</p>
            `;
        })
        .catch(() => {
            resultado.innerHTML = "<p>Erro ao conectar com a API</p>";
        });
    });

    // =========================
    // SALVAR JOGO (localStorage)
    // =========================
    btnSalvar.addEventListener("click", () => {
        if (selecionadas.length !== 15) {
            alert("Selecione exatamente 15 dezenas para salvar");
            return;
        }

        localStorage.setItem("jogo_salvo", JSON.stringify(selecionadas));
        statusSalvo.textContent = "✅ Jogo salvo com sucesso!";
    });

    // =========================
    // CARREGAR JOGO SALVO
    // =========================
    const jogoSalvo = localStorage.getItem("jogo_salvo");

    if (jogoSalvo) {
        selecionadas = JSON.parse(jogoSalvo);

        document.querySelectorAll(".dezena").forEach(d => {
            const num = parseInt(d.textContent);
            if (selecionadas.includes(num)) {
                d.classList.add("selecionada");
            }
        });

        contador.textContent = `${selecionadas.length}/15 selecionadas`;
        statusSalvo.textContent = "ℹ️ Jogo carregado automaticamente";
    }

});

