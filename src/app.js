const express = require('express');
const app = express();
const { testConnection } = require('./config/db');
const serverRoutes = require('./server');

app.use(express.json());

app.get('/', (req, res) => res.send(
    {
    status: 'ok',
    message: 'API funcionando'
    }
));

app.get('/funcionario/:id', async (req, res) => {    // primeira rota get personalizada criada e copiada / precisa testar
    const funcionarioId = req.params.id;
    try {
        const [rows] = await pool.execute('SELECT * FROM funcionario WHERE id_funcionario = ?', [funcionarioId]);
        if (rows.length === 0) {
            return res.status(404).json({error: 'Funcionário não encontrado' });
        }
        res.json(rows[0]);
    }   catch (error) {
        console.error('Erro ao consultar funcionário', error);
        res.status(500).json({error: 'Erro ao consultar funcionário', details: error.message})
    }
});

app.use('/', serverRoutes);

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
