document.addEventListener("DOMContentLoaded", function () {

    const grid = document.getElementById("grid");
    const contador = document.getElementById("contador");
    const resultado = document.getElementById("resultado");
    const btnConferir = document.getElementById("conferir");
    const btnLimpar = document.getElementById("limpar");

    let selecionadas = [];

    // cria dezenas 01–25
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

    // LIMPAR
    btnLimpar.addEventListener("click", () => {
        selecionadas = [];
        document.querySelectorAll(".dezena").forEach(d => d.classList.remove("selecionada"));
        contador.textContent = "0/15 selecionadas";
        resultado.innerHTML = "";
    });

    // CONFERIR
    btnConferir.addEventListener("click", () => {
        if (selecionadas.length !== 15) {
            alert("Selecione exatamente 15 dezenas");
            return;
        }

        fetch("https://lotofacil-api-omfo.onrender.com/conferir", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ dezenas: selecionadas })
        })
        .then(res => res.json())
       .then(data => {
    const total = data.total_concursos;

    function linha(pontos) {
        const qtd = data.acertos[pontos];
        const perc = ((qtd / total) * 100).toFixed(2);
        return `<p>${pontos} pontos: ${qtd} (${perc}%)</p>`;
    }

    resultado.innerHTML = `
        <p><strong>Total de concursos analisados:</strong> ${total}</p>
        <hr>
        ${linha("11")}
        ${linha("12")}
        ${linha("13")}
        ${linha("14")}
        ${linha("15")}
    `;
});

        .catch(() => {
            resultado.innerHTML = "<p>Erro ao conectar com a API</p>";
        });
    });

});

