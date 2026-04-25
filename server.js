const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend rodando 🚀');
});

app.listen(4000, () => {
    console.log('Servidor rodando na porta 5550');
});

app.post('/api/auth/register', (req, res) => {
    const { nome, email, senha } = req.body;

    console.log('Cadastro recebido:', req.body);

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";

    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ erro: 'Erro ao cadastrar' });
        }

        res.json({ mensagem: 'Usuário cadastrado com sucesso' });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ erro: 'Usuário não encontrado' });
        }

        const usuario = results[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({ erro: 'Senha incorreta' });
        }

        res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo_usuario: 'cliente'
        });
    });
});