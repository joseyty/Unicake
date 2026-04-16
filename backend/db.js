const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // seu usuário do MySQL
  password: 'Gung@l3on',        // sua senha (se tiver)
  database: 'meubanco' // nome do banco que você criou
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar com o banco:', err);
    return;
  }
  console.log('✅ Conectado ao MySQL!');
});

module.exports = connection;