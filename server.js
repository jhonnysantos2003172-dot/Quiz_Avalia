const express = require("express");
const fetch = require("node-fetch");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("."));

// Variáveis de ambiente (OBRIGATÓRIO)
const CLIENT_ID = process.env.PROPIX_CLIENT_ID;
const CLIENT_SECRET = process.env.PROPIX_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ PROPIX_CLIENT_ID ou PROPIX_CLIENT_SECRET não definidos");
}

// Endpoint Propix
const PROPIX_ENDPOINT = "https://propix-1.onrender.com/api/v1/deposit";

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Servidor online 🚀");
});

// Rota PIX
app.post("/pix", async (req, res) => {
  try {
    const { nome, cpf, valor, quantidade } = req.body;

    // Validações
    if (!nome || !cpf || !valor) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const amount = Number(valor);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valor inválido" });
    }

    const response = await fetch(PROPIX_ENDPOINT, {
      method: "POST",
      headers: {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        description: `Compra de ${quantidade || 1} produto(s)`,
        payer: {
          name: nome,
          document: cpf
        }
      })
    });

    const data = await response.json();

    // 🔎 Debug (remova depois se quiser)
    console.log("Resposta Propix:", data);

    // Retorno padronizado para o front
    return res.json({
      copiaCola:
        data?.copyPaste ||
        data?.pix?.copyPaste ||
        data?.pix?.code ||
        null,

      qrCode:
        data?.qrCodeBase64 ||
        data?.pix?.qrCodeBase64 ||
        data?.qrCode ||
        null
    });

  } catch (err) {
    console.error("Erro PIX:", err);
    return res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

// Porta dinâmica (Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
