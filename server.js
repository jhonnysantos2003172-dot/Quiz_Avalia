const express = require("express");
const fetch = require("node-fetch");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("."));

// Variáveis de ambiente
const CLIENT_ID = process.env.PROPX_CLIENT_ID;
const CLIENT_SECRET = process.env.PROPX_CLIENT_SECRET;

const PROPIX_ENDPOINT = "https://propix-1.onrender.com/api/v1/deposit";

// Rota de teste (Railway health check)
app.get("/", (req, res) => {
  res.status(200).send("Servidor online 🚀");
});

// Rota PIX
app.post("/pix", async (req, res) => {
  try {
    const { nome, cpf, valor, quantidade } = req.body;

    // Validação básica (evita crash)
    if (!nome || !cpf || !valor) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const response = await fetch(PROPIX_ENDPOINT, {
      method: "POST",
      headers: {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Number(valor),
        description: `Compra ${quantidade || 1}x Gold Spineli`,
        payer: {
          name: nome,
          document: cpf
        }
      })
    });

    const data = await response.json();

    return res.json({
      copiaCola: data?.pix?.code || data?.qrCode || "PIX GERADO"
    });

  } catch (err) {
    console.error("Erro PIX:", err);
    return res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

// Porta dinâmica (Railway)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
