require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./src/routes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(morgan("dev"));
// app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "✅ OK",
    message: "API do Sistema de Gerenciamento de Caixa está online!",
    version: "1.0.0",
    author: "Paiva Tech",
  });
});

// app.use((err, req, res, next) => {
//   console.error("🔥 Erro interno no servidor:", err.stack);
//   res.status(500).json({ error: "Erro interno no servidor." });
// });

app.listen(PORT, () => {
  console.log("======================================");
  console.log(`✅ Servidor rodando na porta: ${PORT}`);
  console.log("🌍 Ambiente:", process.env.NODE_ENV || "desenvolvimento");
  console.log("======================================");
});
