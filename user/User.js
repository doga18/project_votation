const Sequelize = require('sequelize');
const connection = require('../database/database');

const User = connection.define('users', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  user:{
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  type: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  active: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
});

//User.sync({force: true});

// Isso deve ser feito uma vez para que ele não fique sempre tentando criar essas tabelas.
// Candidato.sync({force: true});

module.exports = User;