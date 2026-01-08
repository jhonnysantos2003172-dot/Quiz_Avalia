const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static("."));

const CLIENT_ID = process.env.PROPX_CLIENT_ID;
const CLIENT_SECRET = process.env.PROPX_CLIENT_SECRET;

const PROPIX_ENDPOINT = "https://propix-1.onrender.com/api/v1/deposit";

app.post("/pix", async (req, res) => {
  try {
    const { nome, cpf, valor, quantidade } = req.body;

    const response = await fetch(PROPIX_ENDPOINT, {
      method: "POST",
      headers: {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Number(valor),
        description: `Compra ${quantidade}x Gold Spineli`,
        payer: {
          name: nome,
          document: cpf
        }
      })
    });

    const data = await response.json();

    res.json({
      copiaCola: data.pix?.code || data.qrCode || "PIX GERADO"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
