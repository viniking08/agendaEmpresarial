const express = require('express');
const { pool } = require('../config/db')
const router = express.Router();

router.get('/:id', async (req, res) => { 
  const agendamentoId = req.params.id;   
    try {
        const [rows] = await pool.execute('SELECT * FROM agendamento   WHERE id_agendamento = ?', [agendamentoId]);
        if (rows.length === 0) {
            return res.status(404).json({error: 'agendamento não encontrado' });
        }
        res.json(rows[0]);
    }   catch (error) {
        console.error('Erro ao consultar agendamento', error);
        res.status(500).json({error: 'Erro ao consultar agendamento', details: error.message})
    }
});

router.get('/', async (req, res) => {    
    try {
        const [rows] = await pool.execute('SELECT * FROM agendamento');
        if (rows.length === 0) {
            return res.status(404).json({error: 'Agendamentos não encontrados' });
        }
        res.json(rows);
    }   catch (error) {
        console.error('Erro ao consultar agendamentos', error);
        res.status(500).json({error: 'Erro ao consultar agendamentos', details: error.message})
    }
});

// Rota DELETE - /produtos/:id/permanente - exclusão permanente de produto
// Remove completamente o produto e suas dependências (usar com cuidado!)
router.delete('/:id/permanente', async (req, res) => {
  const agendamentoId = req.params.id;
  
  try {
    // Primeiro verifica se o produto existe
    const [agendamento] = await pool.execute('SELECT * FROM agendamento WHERE id_agendamento = ?', [agendamentoId]);
    if (agendamento.length === 0) {
      return res.status(404).json({ error: 'agendamento não encontrado' });
    }

    const [result] = await pool.execute('DELETE FROM agendamento WHERE id_agendamento = ?', [agendamentoId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'agendamento não encontrado' });
    }

    res.json({ 
      message: 'agendamento excluído permanentemente com sucesso',
      agendamento: agendamento[0].titulo,
      id: agendamentoId,
      warning: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente agendamento:', error);
    res.status(500).json({ error: 'Erro ao excluir permanentemente agendamento', details: error.message });
  }
});

// Rota POST - /agendamento
router.post('/', async (req, res) => {
  const { titulo, data, id_funcionario, id_administrador } = req.body;

  // validação básica
  if (!titulo || !data || !id_funcionario || !id_administrador) {
    return res.status(400).json({
      error: 'Dados obrigatórios faltando',
      message: 'Informe titulo, data, id_funcionario e id_administrador'
    });
  }

  try {
    const query = `
      INSERT INTO agendamento 
      (titulo, data, id_funcionario, id_administrador)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
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

// Rota PUT - /agendamento/:id
// Atualiza TODOS os dados do agendamento
router.put('/:id', async (req, res) => {
  const agendamentoId = req.params.id;
  const { titulo, data, id_funcionario, id_administrador } = req.body;

  // Verificação: garante que o ID seja numérico
  if (isNaN(agendamentoId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Verificação: garante que todos os campos obrigatórios foram enviados
  if (!titulo || !data || !id_funcionario || !id_administrador) {
    return res.status(400).json({
      error: 'Dados incompletos',
      message: 'PUT exige titulo, data, id_funcionario e id_administrador'
    });
  }

  try {
    // Verificação: checa se o agendamento existe
    const [agendamento] = await pool.execute(
      'SELECT * FROM agendamento WHERE id_agendamento = ?',
      [agendamentoId]
    );

    if (agendamento.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Verificação: checa se o funcionário existe
    const [funcionario] = await pool.execute(
      'SELECT * FROM funcionario WHERE id_funcionario = ?',
      [id_funcionario]
    );

    if (funcionario.length === 0) {
      return res.status(404).json({
        error: 'Funcionário não encontrado'
      });
    }

    // Verificação: checa se o administrador existe
    const [administrador] = await pool.execute(
      'SELECT * FROM administrador WHERE id_administrador = ?',
      [id_administrador]
    );

    if (administrador.length === 0) {
      return res.status(404).json({
        error: 'Administrador não encontrado'
      });
    }

    // Atualização completa do agendamento
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

module.exports = router;