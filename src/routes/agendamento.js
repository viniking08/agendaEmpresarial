const express = require('express');
// Importa o pool de conexões com o banco MySQL
const { pool } = require('../config/db')

// Organiza as rotas separadamente do arquivo principal
const router = express.Router();


// GET /:id - Busca um agendamento específico pelo ID
router.get('/:id', async (req, res) => {   

    // Pega o id enviado na URL
    const agendamentoId = req.params.id;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM agendamento WHERE id_agendamento = ?', 
            [agendamentoId]
        );

        // Verifica se encontrou algum registro
        if (rows.length === 0) {
            // Se não encontrou retorna erro
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Erro ao consultar agendamento', error);
        res.status(500).json({
            error: 'Erro ao consultar agendamento',
            details: error.message
        })
    }
});


// GET - Lista todos os agendamentos
router.get('/', async (req, res) => {    

    try {
        const [rows] = await pool.execute('SELECT * FROM agendamento');

        // Verifica se existem registros
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Agendamentos não encontrados' });
        }

        res.json(rows);

    } catch (error) {
        console.error('Erro ao consultar agendamentos', error);
        res.status(500).json({
            error: 'Erro ao consultar agendamentos',
            details: error.message
        })
    }
});


// DELETE - Remove definitivamente um agendamento
router.delete('/:id/permanente', async (req, res) => {

    // Pega o id enviado na URL
    const agendamentoId = req.params.id;

    try {

        // Primeiro verifica se o agendamento realmente existe
        const [agendamento] = await pool.execute(
            'SELECT * FROM agendamento WHERE id_agendamento = ?', 
            [agendamentoId]
        );

        // Se não existir retorna erro
        if (agendamento.length === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        const [result] = await pool.execute(
            'DELETE FROM agendamento WHERE id_agendamento = ?', 
            [agendamentoId]
        );

        // Segurança extra para confirmar exclusão
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        res.json({ 
            message: 'Agendamento excluído permanentemente com sucesso',
            agendamento: agendamento[0].titulo,
            id: agendamentoId,
            warning: 'Esta ação é irreversível'
        });

    } catch (error) {
        console.error('Erro ao excluir permanentemente agendamento:', error);
        res.status(500).json({
            error: 'Erro ao excluir permanentemente agendamento',
            details: error.message
        });
    }
});


// POST - Cria um novo agendamento
router.post('/', async (req, res) => {

    // Desestrutura os dados enviados no corpo da requisição
    const { titulo, data, id_funcionario, id_administrador } = req.body;

    // Validação: verifica se os campos obrigatórios foram enviados
    if (!titulo || !data || !id_funcionario || !id_administrador) {
        return res.status(400).json({
            error: 'Dados obrigatórios não informados',
            message: 'Titulo, data, id_funcionario e id_administrador são obrigatórios'
        });
    }

    try {

        // Verifica se o funcionário existe
        const [funcionario] = await pool.execute(
            'SELECT * FROM funcionario WHERE id_funcionario = ?',
            [id_funcionario]
        );

        if (funcionario.length === 0) {
            return res.status(404).json({
                error: 'Funcionário não encontrado'
            });
        }

        // Verifica se o administrador existe
        const [administrador] = await pool.execute(
            'SELECT * FROM administrador WHERE id_administrador = ?',
            [id_administrador]
        );

        if (administrador.length === 0) {
            return res.status(404).json({
                error: 'Administrador não encontrado'
            });
        }

        // Query de inserção
        const query = `
            INSERT INTO agendamento (titulo, data, id_funcionario, id_administrador)
            VALUES (?, ?, ?, ?)
        `;

        // Executa a inserção
        const [result] = await pool.execute(query, [
            titulo.trim(),
            data,
            id_funcionario,
            id_administrador
        ]);

        res.status(201).json({
            message: 'Agendamento criado com sucesso',
            id_agendamento: result.insertId
        });

    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({
            error: 'Erro ao criar agendamento',
            details: error.message
        });
    }
});


// PUT - Atualiza TODOS os dados do agendamento
router.put('/:id', async (req, res) => {

    const agendamentoId = req.params.id;
    const { titulo, data, id_funcionario, id_administrador } = req.body;

    // Validação: verifica se o ID é numérico
    if (isNaN(agendamentoId)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    // Validação: PUT exige todos os campos
    if (!titulo || !data || !id_funcionario || !id_administrador) {
        return res.status(400).json({
            error: 'Dados incompletos',
            message: 'PUT exige titulo, data, id_funcionario e id_administrador'
        });
    }

    try {

        // Verifica se o agendamento existe
        const [agendamento] = await pool.execute(
            'SELECT * FROM agendamento WHERE id_agendamento = ?',
            [agendamentoId]
        );

        if (agendamento.length === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        // Verifica se o funcionário existe
        const [funcionario] = await pool.execute(
            'SELECT * FROM funcionario WHERE id_funcionario = ?',
            [id_funcionario]
        );

        if (funcionario.length === 0) {
            return res.status(404).json({ error: 'Funcionário não encontrado' });
        }

        // Verifica se o administrador existe
        const [administrador] = await pool.execute(
            'SELECT * FROM administrador WHERE id_administrador = ?',
            [id_administrador]
        );

        if (administrador.length === 0) {
            return res.status(404).json({ error: 'Administrador não encontrado' });
        }

        // Atualiza completamente o registro
        await pool.execute(
            `UPDATE agendamento
             SET titulo = ?, data = ?, id_funcionario = ?, id_administrador = ?
             WHERE id_agendamento = ?`,
            [
                titulo.trim(),
                data,
                id_funcionario,
                id_administrador,
                agendamentoId
            ]
        );

        res.json({
            message: 'Agendamento atualizado com sucesso (PUT)',
            id_agendamento: agendamentoId
        });

    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({
            error: 'Erro ao atualizar agendamento',
            details: error.message
        });
    }
});


// Exporta as rotas para serem utilizadas no arquivo principal (app.js ou server.js)
module.exports = router;