const express = require('express');
const app = express();
const { testConnection, pool } = require('./config/db');
const serverRoutes = require('./server');

app.use(express.json());

app.get('/', (req, res) => res.send(
    {
    status: 'ok',
    message: 'API funcionando'
    }
));

app.use('/', serverRoutes);
app.use((err, req, res, next) => { // captura erros - app.use se encontra pelo numero de argumentos/parâmetros, como em poo
  console.error(err); // log do erro no console - para fins de depuração
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' }); // resposta de erro em JSON
});

async function verificarDB() {
    const resultado = await testConnection();
    console.log(`Sucesso: ${resultado.success} e Mensagem ${resultado.message}`)
}
verificarDB();

module.exports = app;


/*
app.get('/hello', (req, res) =>
  res.send(
    {
        message: 'Hello, World!'
    }
  )
);

app.get('/professor', (req, res) =>
  res.send(
    {
        nome: 'Lucas Sasse',
        disciplinas: ['Programação de Aplicativos', 'Modelagem de Sistemas']
    }
  )
)

app.get('/alunos/programacao-de-aplicativos', (req, res) =>
    res.send(
        {
            alunos: ['Daniel', 'Joao', 'Luan', 'Lucas']
        }
    )
);

app.get('/alunos/programacao-de-aplicativos/notas', (req, res) =>
    res.send(
        {
            alunos: [
                { nome: 'Daniel', nota: 8.5},
                { nome: 'Joao', nota: 9.0},
                { nome: 'Luan', nota: 9.0},
                { nome: 'Lucas', nota: 8.0}
            ]
        }
    )
);

app.use((err, req, res, next) => {
    console.error(err);
    req.status(err.status || 500).json({ error: err.message || 'Erro interno' });
})

module.exports = app;
*/
