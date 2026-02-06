const express = require('express');
const { pool } = require('../config/db')
const router = express.Router();

router.get('/:id', async (req, res) => {   
    const administradorId = req.params.id;
    try {
        const [rows] = await pool.execute('SELECT * FROM administrador  WHERE id_administrador  = ?', [administradorId]);
        if (rows.lenght === 0) {
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
        if (rows.lenght === 0) {
            return res.status(404).json({error: 'Administradores não encontrados' });
        }
        res.json(rows[0]);
    }   catch (error) {
        console.error('Erro ao consultar administradores', error);
        res.status(500).json({error: 'Erro ao consultar administradores', details: error.message})
    }
});

module.exports = router;