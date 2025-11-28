const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// Conecta no Neon usando o link que a Digital Ocean vai fornecer
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Rota de Cadastro
app.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const check = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (check.rows.length > 0) return res.status(400).json({ erro: "Email já existe" });

        await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)', [nome, email, senha]);
        res.json({ mensagem: "Sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

// Rota para o Painel Admin
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
