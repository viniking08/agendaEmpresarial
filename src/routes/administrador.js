const express = require('express');
// Importando biblioteca para validar CPF Real
const validateCpf = require('validar-cpf');
// Importa o pool de conexões com o banco MySQL
const { pool } = require('../config/db')
// Organiza as rotas separadamente do arquivo principal
const router = express.Router();


// GET /:id - Busca um administrador específico pelo ID
router.get('/:id', async (req, res) => {   
    
    // Pega o id
    const administradorId = req.params.id;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM administrador WHERE id_administrador = ?', 
            [administradorId]
        );

        // Verifica se encontrou algum registro
        if (rows.length === 0) {
            // Se não encontrou retorna erro
            return res.status(404).json({error: 'Administrador não encontrado' });
        }
        res.json(rows[0]);

    } catch (error) {
        console.error('Erro ao consultar administrador', error);
        res.status(500).json({
            error: 'Erro ao consultar administrador',
            details: error.message
        })
    }
});



// GET - Lista todos os administradores

router.get('/', async (req, res) => {    

    try {
        const [rows] = await pool.execute('SELECT * FROM administrador');
        if (rows.length === 0) {
            return res.status(404).json({error: 'Administradores não encontrados' });
        }
        res.json(rows);

    } catch (error) {
        console.error('Erro ao consultar administradores', error);
        res.status(500).json({
            error: 'Erro ao consultar administradores',
            details: error.message
        })
    }
});



// DELETE - Remove definitivamente um administrador

router.delete('/:id/permanente', async (req, res) => {
  const administradorId = req.params.id;

  try {
    // Primeiro verifica se o administrador realmente existe
    const [administrador] = await pool.execute(
      'SELECT * FROM administrador WHERE id_administrador = ?', 
      [administradorId]
    );
    // Se não existir mostra erro
    if (administrador.length === 0) {
      return res.status(404).json({ error: 'administrador não encontrado' });
    }
    const [result] = await pool.execute(
      'DELETE FROM administrador WHERE id_administrador = ?', 
      [administradorId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'administrador não encontrado' });
    }
    
    res.json({ 
      message: 'administrador excluído permanentemente com sucesso',
      administrador: administrador[0].nome, // Mostra o nome do excluído
      id: administradorId,
      warning: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente administrador:', error);
    res.status(500).json({
      error: 'Erro ao excluir permanentemente administrador',
      details: error.message
    });
  }
});



// POST - Cria um novo administrador

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

    // Verifica se já existe administrador com mesmo email ou CPF
    const [existente] = await pool.execute(
      'SELECT * FROM administrador WHERE email = ? OR cpf = ?',
      [email, cpf]
    );

    // Se já existir retorna erro 
    if (existente.length > 0) {
      return res.status(409).json({
        error: 'Administrador já cadastrado',
        message: 'Já existe um administrador com este email ou CPF'
      });
    }

    // Valida o CPF (CPF real)
    if (!validateCpf(cpf)) {    
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Query de inserção
    const query = `
      INSERT INTO administrador (nome, email, cpf, status)
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



// PUT - Atualiza TODOS os dados do administrador

router.put('/:id', async (req, res) => {
  const administradorId = req.params.id;
  const { nome, email, cpf, status } = req.body;

  // Validação: verifica se o ID é um número válido
  if (isNaN(administradorId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (!nome || !email || !cpf || !status) {
    return res.status(400).json({
      error: 'Dados incompletos',
      message: 'PUT exige nome, email, CPF e status'
    });
  }

  try {

    const [administrador] = await pool.execute(
      'SELECT * FROM administrador WHERE id_administrador = ?',
      [administradorId]
    );

    if (administrador.length === 0) {
      return res.status(404).json({ error: 'Administrador não encontrado' });
    }
    // Verifica duplicidade de email ou CPF em outro registro
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
    // Atualiza completamente o registro
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