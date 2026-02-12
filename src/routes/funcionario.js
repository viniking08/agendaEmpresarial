const express = require('express');
// Importando biblioteca para validar CPF Real
const validateCpf = require('validar-cpf');
// Importa o pool de conexões com o banco MySQL
const { pool } = require('../config/db')

// Organiza as rotas separadamente do arquivo principal
const router = express.Router();


// GET /:id - Busca um funcionário específico pelo ID
router.get('/:id', async (req, res) => {

    // Pega o id enviado na URL
    const funcionarioId = req.params.id;

    try {

        const [rows] = await pool.execute(
            'SELECT * FROM funcionario WHERE id_funcionario = ?', 
            [funcionarioId]
        );

        // Verifica se encontrou algum registro
        if (rows.length === 0) {
            // Se não encontrou retorna erro
            return res.status(404).json({
                error: 'Funcionário não encontrado'
            });
        }

        res.json(rows[0]);

    } catch (error) {

        console.error('Erro ao consultar funcionário', error);

        res.status(500).json({
            error: 'Erro ao consultar funcionário',
            details: error.message
        })
    }
});


// GET - Lista todos os funcionários
router.get('/', async (req, res) => {   

    try {

        const [rows] = await pool.execute('SELECT * FROM funcionario');

        // Verifica se existem registros cadastrados
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Funcionários não encontrados'
            });
        }

        res.json(rows);

    } catch (error) {

        console.error('Erro ao consultar funcionários', error);

        res.status(500).json({
            error: 'Erro ao consultar funcionários',
            details: error.message
        })
    }
});


// DELETE - Remove definitivamente um funcionário
router.delete('/:id/permanente', async (req, res) => {

    // Pega o id enviado na URL
    const funcionarioId = req.params.id;
  
    try {

        // Primeiro verifica se o funcionário realmente existe
        const [funcionario] = await pool.execute(
            'SELECT * FROM funcionario WHERE id_funcionario = ?', 
            [funcionarioId]
        );

        // Se não existir retorna erro
        if (funcionario.length === 0) {
            return res.status(404).json({
                error: 'Funcionário não encontrado'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM funcionario WHERE id_funcionario = ?', 
            [funcionarioId]
        );
        
        // Segurança extra para confirmar exclusão
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Funcionário não encontrado'
            });
        }

        res.json({ 
            message: 'Funcionário excluído permanentemente com sucesso',
            funcionario: funcionario[0].nome,
            id: funcionarioId,
            warning: 'Esta ação é irreversível'
        });

    } catch (error) {

        console.error('Erro ao excluir permanentemente funcionário:', error);

        res.status(500).json({
            error: 'Erro ao excluir permanentemente funcionário',
            details: error.message
        });
    }
});


// POST - Cria um novo funcionário
router.post('/', async (req, res) => {

    // Desestrutura os dados enviados no corpo da requisição
    const { nome, email, cpf, status } = req.body;

    // Validação: verifica se os campos obrigatórios foram enviados
    if (!nome || !email || !cpf) {
        return res.status(400).json({
            error: 'Dados obrigatórios não informados',
            message: 'Nome, email e CPF são obrigatórios'
        });
    }

    try {

        // Verifica se já existe funcionário com mesmo email ou CPF
        const [existente] = await pool.execute(
            'SELECT * FROM funcionario WHERE email = ? OR cpf = ?',
            [email, cpf]
        );

        // Se já existir retorna erro
        if (existente.length > 0) {
            return res.status(409).json({
                error: 'Funcionário já cadastrado',
                message: 'Já existe funcionário com este email ou CPF'
            });
        }

        // Valida o CPF (CPF real)
        if (!validateCpf(cpf)) {    
          return res.status(400).json({ error: 'CPF inválido' });
        }

        // Query de inserção
        const query = `
            INSERT INTO funcionario (nome, email, cpf, status)
            VALUES (?, ?, ?, ?)
        `;

        // Executa a inserção
        const [result] = await pool.execute(query, [
            nome.trim(),
            email.trim(),
            cpf.trim(),
            status || 'ativo'
        ]);

        res.status(201).json({
            message: 'Funcionário criado com sucesso',
            id_funcionario: result.insertId
        });

    } catch (error) {

        console.error('Erro ao criar funcionário:', error);

        res.status(500).json({
            error: 'Erro ao criar funcionário',
            details: error.message
        });
    }
});


// PUT - Atualiza TODOS os dados do funcionário
router.put('/:id', async (req, res) => {

    const funcionarioId = req.params.id;
    const { nome, email, cpf, status } = req.body;

    // Validação: verifica se o ID é numérico
    if (isNaN(funcionarioId)) {
        return res.status(400).json({
            error: 'ID inválido'
        });
    }

    // Validação: PUT exige todos os campos obrigatórios
    if (!nome || !email || !cpf || !status) {
        return res.status(400).json({
            error: 'Dados incompletos',
            message: 'Nome, email, CPF e status são obrigatórios no PUT'
        });
    }

    try {

        // Verifica se o funcionário existe
        const [funcionario] = await pool.execute(
            'SELECT * FROM funcionario WHERE id_funcionario = ?',
            [funcionarioId]
        );

        if (funcionario.length === 0) {
            return res.status(404).json({
                error: 'Funcionário não encontrado'
            });
        }

        // Verifica duplicidade de email ou CPF em outro registro
        const [duplicado] = await pool.execute(
            'SELECT * FROM funcionario WHERE (email = ? OR cpf = ?) AND id_funcionario != ?',
            [email, cpf, funcionarioId]
        );

        if (duplicado.length > 0) {
            return res.status(409).json({
                error: 'Conflito de dados',
                message: 'Email ou CPF já pertence a outro funcionário'
            });
        }

        // Atualiza completamente o registro
        await pool.execute(
            `UPDATE funcionario 
             SET nome = ?, email = ?, cpf = ?, status = ?
             WHERE id_funcionario = ?`,
            [nome.trim(), email.trim(), cpf.trim(), status, funcionarioId]
        );

        res.json({
            message: 'Funcionário atualizado com sucesso (PUT)',
            id_funcionario: funcionarioId
        });

    } catch (error) {

        console.error('Erro ao atualizar funcionário:', error);

        res.status(500).json({
            error: 'Erro ao atualizar funcionário',
            details: error.message
        });
    }
});


// Exporta as rotas para serem utilizadas no arquivo principal (app.js ou server.js)
module.exports = router;