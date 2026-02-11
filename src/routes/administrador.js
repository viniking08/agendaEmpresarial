const express = require('express');
const { pool } = require('../config/db')
const router = express.Router();

router.get('/:id', async (req, res) => {   
    const administradorId = req.params.id;
    try {
        const [rows] = await pool.execute('SELECT * FROM administrador  WHERE id_administrador  = ?', [administradorId]);
        if (rows.length === 0) {
            return res.status(404).json({error: 'Administrador não encontrado' });
        }
        res.json(rows[0]);
    }   catch (error) {
        console.error('Erro ao consultar administrador', error);
        res.status(500).json({error: 'Erro ao consultar administrador', details: error.message})
    }
});

router.get('/', async (req, res) => {    
    try {
        const [rows] = await pool.execute('SELECT * FROM administrador');
        if (rows.length === 0) {
            return res.status(404).json({error: 'Administradores não encontrados' });
        }
        res.json(rows);
    }   catch (error) {
        console.error('Erro ao consultar administradores', error);
        res.status(500).json({error: 'Erro ao consultar administradores', details: error.message})
    }
});

router.delete('/:id/permanente', async (req, res) => {
  const administradorId = req.params.id;
  
  try {
    // Primeiro verifica se o produto existe
    const [administrador] = await pool.execute('SELECT * FROM administrador WHERE id_administrador = ?', [administradorId]);
    if (administrador.length === 0) {
      return res.status(404).json({ error: 'administrador não encontrado' });
    }

    const [result] = await pool.execute('DELETE FROM administrador WHERE id_administrador = ?', [administradorId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'administrador não encontrado' });
    }

    res.json({ 
      message: 'administrador excluído permanentemente com sucesso',
      administrador: administrador[0].nome,
      id: administradorId,
      warning: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente administrador:', error);
    res.status(500).json({ error: 'Erro ao excluir permanentemente administrador', details: error.message });
  }
});

// Rota POST - /administrador
// Cria um novo administrador
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
    // Verifica se já existe administrador com mesmo email ou CPF
    const [existente] = await pool.execute(
      'SELECT * FROM administrador WHERE email = ? OR cpf = ?',
      [email, cpf]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        error: 'Administrador já cadastrado',
        message: 'Já existe um administrador com este email ou CPF'
      });
    }

    // Insere administrador
    const query = `
      INSERT INTO administrador (nome, email, cpf, status)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      nome.trim(),
      email.trim(),
      cpf.trim(),
      status || 'ativo'
    ]);

    res.status(201).json({
      message: 'Administrador criado com sucesso',
      id_administrador: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    res.status(500).json({
      error: 'Erro ao criar administrador',
      details: error.message
    });
  }
});

// Rota PUT - /administrador/:id
// Atualiza TODOS os dados do administrador
router.put('/:id', async (req, res) => {
  const administradorId = req.params.id;
  const { nome, email, cpf, status } = req.body;

  // Verificação: garante que o ID seja um número válido
  if (isNaN(administradorId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Verificação: garante que todos os campos obrigatórios foram enviados
  if (!nome || !email || !cpf || !status) {
    return res.status(400).json({
      error: 'Dados incompletos',
      message: 'PUT exige nome, email, CPF e status'
    });
  }

  try {
    // Verificação: checa se o administrador existe
    const [administrador] = await pool.execute(
      'SELECT * FROM administrador WHERE id_administrador = ?',
      [administradorId]
    );

    if (administrador.length === 0) {
      return res.status(404).json({ error: 'Administrador não encontrado' });
    }

    // Verificação: evita duplicar email ou CPF de outro administrador
    const [duplicado] = await pool.execute(
      'SELECT * FROM administrador WHERE (email = ? OR cpf = ?) AND id_administrador != ?',
      [email, cpf, administradorId]
    );

    if (duplicado.length > 0) {
      return res.status(409).json({
        error: 'Conflito de dados',
        message: 'Email ou CPF já pertence a outro administrador'
      });
    }

    // Atualização completa do administrador
    await pool.execute(
      `UPDATE administrador
       SET nome = ?, email = ?, cpf = ?, status = ?
       WHERE id_administrador = ?`,
      [
        nome.trim(),
        email.trim(),
        cpf.trim(),
        status,
        administradorId
      ]
    );

    res.json({
      message: 'Administrador atualizado com sucesso (PUT)',
      id_administrador: administradorId
    });

  } catch (error) {
    console.error('Erro ao atualizar administrador:', error);
    res.status(500).json({
      error: 'Erro ao atualizar administrador',
      details: error.message
    });
  }
});

module.exports = router;