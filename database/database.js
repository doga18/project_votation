const Sequelize = require('sequelize');

// // Configurar o banco de dados SQLite
// const db = new sqlite3.Database('votacao.db');

// // Criar a tabela de votos (se ainda não existir)
// db.run(`
//   CREATE TABLE IF NOT EXISTS votos (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     opcao TEXT
//   )
// `);

// O projeto foi desenvolvido para trabalhar com banco de dados offline.
// Porém para usar o Mysql é necessario instalar o mysql e mysql2 via npm e configurar os dados abaixo, descmontando-os.

// const connection = new Sequelize('votation', 'system_root', 'xRx9dtMU19', {
//   host: '191.96.225.81',
//   dialect: 'mysql',
// });

const connection = new Sequelize({
  dialect: 'sqlite',
  storage: './votacao.db',
});

module.exports = connection;