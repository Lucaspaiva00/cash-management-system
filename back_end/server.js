require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

const rotes = require('./src/routes');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(rotes);


app.listen(PORT, () => { console.log("Server Rodando na Porta: " + PORT) });    