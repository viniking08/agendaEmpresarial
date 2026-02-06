require('dotenv').config();

const express = require('express');
const { pool } = require('./config/db');
const app = express();

// importar módulos de rota
const funcionarioRoutes = require('./routes/funcionario');
const administradorRoutes = require('./routes/administrador');
const agendamentoRoutes = require('./routes/agendamento');

// usar rotas
app.use('/funcionario', funcionarioRoutes);
app.use('/administrador', administradorRoutes);
app.use('/agendamento', agendamentoRoutes);


module.exports = app;