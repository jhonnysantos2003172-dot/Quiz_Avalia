const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(".")); // serve pix.html e outros arquivos

// ⚠️ Coloque suas credenciais Propix aqui
const CLIENT_ID = "live_6049bd5b783a9068186db4dec078933c";
const CLIENT_SECRET = "sk_2d0153461b7c7cd1c41aed4f8d10ebe35d31a8604e550ecd24b71446b8d35317";

const PROPIX_ENDPOINT = "https://propix-1.onrender.com/api/v1/deposit";

// Health check
app.get("/", (req, res) => res.send("Servidor online 🚀"));

// Endpoint para gerar Pix
app.post("/pix", async (req, res) => {
  try {
    const { nome, cpf, quantidade, valorUnitario } = req.body;

    // Validações básicas
    if (!nome || !cpf || !quantidade || !valorUnitario) {
      return res.json({ error: "Erro: dados incompletos enviados do frontend!" });
    }

    const qtd = Number(quantidade);
    const valorUni = Number(valorUnitario);

    if (isNaN(qtd) || isNaN(valorUni) || qtd <= 0 || valorUni <= 0) {
      return res.json({ error: "Erro: quantidade ou valor inválido!" });
    }

    const valorTotal = Number((qtd * valorUni).toFixed(2));

    // 🔎 Log para debug no servidor
    console.log("Dados enviados ao Propix:", {
      amount: valorTotal,
      description: `Compra de ${qtd} produto(s)`,
      payer: { name: nome, document: cpf },
    });

    // Chamada ao Propix
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

    // 🔎 Log completo da resposta Propix
    console.log("Resposta do Propix:", data);

    // Se não gerar Pix, retorna erro
    if (!data?.pix?.copyPaste && !data?.pix?.code) {
      return res.json({ error: "Erro: Pix não gerado! Confira os dados ou credenciais." });
    }

    // Retorna dados para o frontend
    return res.json({
      copiaCola: data?.pix?.copyPaste || data?.pix?.code,
      qrCode: data?.pix?.qrcode || data?.pix?.qrCodeBase64 || null,
      valorTotal,
    });

  } catch (err) {
    console.error("Erro ao gerar Pix:", err);
    // Retorna erro completo para o navegador
    return res.json({ error: "Erro no servidor: " + err.message });
  }
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
