const express = require('express');
const { pool } = require('../config/db')
const router = express.Router();

router.get('/:id', async (req, res) => {    
    try {
        const [rows] = await pool.execute('SELECT * FROM agendamento   WHERE id_agendamento = ?', [agendamentoId]);
        if (rows.lenght === 0) {
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
        if (rows.lenght === 0) {
            return res.status(404).json({error: 'Agendamentos não encontrados' });
        }
        res.json(rows[0]);
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
      agendamento: agendamento[0].nome,
      id: agendamentoId,
      warning: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente agendamento:', error);
    res.status(500).json({ error: 'Erro ao excluir permanentemente agendamento', details: error.message });
  }
});

module.exports = router;