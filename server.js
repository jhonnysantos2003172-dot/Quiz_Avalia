const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(".")); // para servir o pix.html e assets

// ⚠️ Coloque aqui suas credenciais do Propix (apenas para teste rápido)
const CLIENT_ID = "live_6049bd5b783a9068186db4dec078933c";
const CLIENT_SECRET = "sk_2d0153461b7c7cd1c41aed4f8d10ebe35d31a8604e550ecd24b71446b8d35317";

const PROPIX_ENDPOINT = "https://propix-1.onrender.com/api/v1/deposit";

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Servidor online 🚀");
});

// Endpoint para gerar Pix
app.post("/pix", async (req, res) => {
  try {
    const { nome, cpf, quantidade, valorUnitario } = req.body;

    if (!nome || !cpf || !quantidade || !valorUnitario) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const qtd = Number(quantidade);
    const valorUni = Number(valorUnitario);

    if (isNaN(qtd) || isNaN(valorUni) || qtd <= 0 || valorUni <= 0) {
      return res.status(400).json({ error: "Quantidade ou valor inválido" });
    }

    const valorTotal = Number((qtd * valorUni).toFixed(2)); // valor final

    // Chamada para Propix
    const response = await fetch(PROPIX_ENDPOINT, {
      method: "POST",
      headers: {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: valorTotal,
        description: `Compra de ${qtd} produto(s)`,
        payer: { name: nome, document: cpf },
      }),
    });

    const data = await response.json();
    console.log("Resposta Propix:", data);

    const copiaCola = data?.pix?.copyPaste || data?.pix?.code || null;
    const qrCode = data?.pix?.qrcode || data?.pix?.qrCodeBase64 || null;

    if (!copiaCola || !qrCode) {
      return res.status(500).json({ error: "Pix não gerado" });
    }

    return res.json({ copiaCola, qrCode, valorTotal });

  } catch (err) {
    console.error("Erro ao gerar Pix:", err);
    return res.status(500).json({ error: "Erro ao gerar Pix" });
  }
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
