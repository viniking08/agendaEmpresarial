const express = require('express');
const { pool } = require('../config/db')
const router = express.Router();

router.get('/:id', async (req, res) => {
    const funcionarioId = req.params.id;
    try {
        const [rows] = await pool.execute('SELECT * FROM funcionario WHERE id_funcionario = ?', [funcionarioId]);
        if (rows.lenght === 0) {
            return res.status(404).json({error: 'Funcionário não encontrado' });
        }
        res.json(rows[0]);
    }   catch (error) {
        console.error('Erro ao consultar funcionário', error);
        res.status(500).json({error: 'Erro ao consultar funcionário', details: error.message})
    }
});

router.get('/', async (req, res) => {   
    try {
        const [rows] = await pool.execute('SELECT * FROM funcionario');
        if (rows.length === 0) {
            return res.status(404).json({error: 'Funcionários não encontrados' });
        }
        res.json(rows[0]);
    }   catch (error) {
        console.error('Erro ao consultar funcionários', error);
        res.status(500).json({error: 'Erro ao consultar funcionários', details: error.message})
    }
});

// Rota DELETE - /produtos/:id/permanente - exclusão permanente de produto
// Remove completamente o produto e suas dependências (usar com cuidado!)
router.delete('/:id/permaFunc', async (req, res) => {
  const funcionarioId = req.params.id;
  
  try {
    // Primeiro verifica se o produto existe
    const [funcionario] = await pool.execute('SELECT * FROM funcionario WHERE id_funcionario = ?', [funcionarioId]);
    if (funcionario.length === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrado' });
    }

    const [result] = await pool.execute('DELETE FROM funcionario WHERE id_funcionario = ?', [funcionarioId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrado' });
    }

    res.json({ 
      message: 'Funcionario excluído permanentemente com sucesso',
      funcionario: funcionario[0].nome,
      id: funcionarioId,
      warning: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente funcionario:', error);
    res.status(500).json({ error: 'Erro ao excluir permanentemente funcionario', details: error.message });
  }
});

// Cria um novo funcionário
router.post('/', async (req, res) => {
  const { nome, email, cpf, status } = req.body;

  // Validação básica
  if (!nome || !email || !cpf) {
    return res.status(400).json({
      error: 'Dados obrigatórios não informados',
      message: 'Nome, email e CPF são obrigatórios'
    });
  }

  try {
    // Verifica se já existe funcionário com mesmo email ou cpf
    const [existente] = await pool.execute(
      'SELECT * FROM funcionario WHERE email = ? OR cpf = ?',
      [email, cpf]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        error: 'Funcionário já cadastrado',
        message: 'Já existe funcionário com este email ou CPF'
      });
    }

    // Insere funcionário
    const query = `
      INSERT INTO funcionario (nome, email, cpf, status)
      VALUES (?, ?, ?, ?)
    `;

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

module.exports = router;