const grid = document.getElementById("grid");
const contador = document.getElementById("contador");
const resultadoDiv = document.getElementById("resultado");

let selecionadas = [];

// cria as dezenas
for (let i = 1; i <= 25; i++) {
    const d = document.createElement("div");
    d.className = "dezena";
    d.textContent = i.toString().padStart(2, "0");
    d.onclick = () => toggleDezena(i, d);
    grid.appendChild(d);
}

function toggleDezena(num, el) {
    if (selecionadas.includes(num)) {
        selecionadas = selecionadas.filter(n => n !== num);
        el.classList.remove("selecionada");
    } else {
        if (selecionadas.length >= 15) return;
        selecionadas.push(num);
        el.classList.add("selecionada");
    }
    contador.textContent = `${selecionadas.length}/15 selecionadas`;
}

function limpar() {
    selecionadas = [];
    document.querySelectorAll(".dezena").forEach(d => d.classList.remove("selecionada"));
    contador.textContent = "0/15 selecionadas";
    resultadoDiv.innerHTML = "";
}

function conferir() {
    if (selecionadas.length !== 15) {
        alert("Selecione exatamente 15 dezenas");
        return;
    }

    fetch("https://lotofacil-api-omfo.onrender.com/conferir", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        dezenas: selecionadas
    })
})

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ dezenas: selecionadas })
    })
    .then(res => res.json())
    .then(data => {
        resultadoDiv.innerHTML = `
            <p>11 pontos: ${data["11"]}</p>
            <p>12 pontos: ${data["12"]}</p>
            <p>13 pontos: ${data["13"]}</p>
            <p>14 pontos: ${data["14"]}</p>
            <p>15 pontos: ${data["15"]}</p>
        `;
    })
    .catch(() => {
        resultadoDiv.innerHTML = "<p>Erro ao conectar com a API</p>";
    });
}

