const Sequelize = require("sequelize");
const connection = require("../database/database");

// Verificando se a opção de limpeza do banco está ativa.
const { IsShouldCleanupDb } = require("../index");

const Sessao = connection.define("sessao", {
  eleitores: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  active: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  pass_sessao: {
    type: Sequelize.STRING,
    allowNull: false,
  },  
  name_congregacao: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Cargo = connection.define("cargo", {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'nome', // Adicione essa linha
  },
});

const Candidato = connection.define("candidato", {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'nome', // Adicione essa linha
  },
  numero: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  foto: {
    type: Sequelize.BLOB,
    allowNull: true,
  },
});

const Vote = connection.define("vote", {});

// Relacionamentos
Sessao.hasMany(Cargo, { foreignKey: "sessaoId", onDelete: "CASCADE" }); // Uma sessão tem vários cargos
Cargo.belongsTo(Sessao, { foreignKey: "sessaoId" }); // Um cargo pertence a uma sessão

Sessao.hasMany(Candidato, { foreignKey: "sessaoId", onDelete: "CASCADE" }); // Uma sessão tem vários candidatos
Candidato.belongsTo(Sessao, { foreignKey: "sessaoId" }); // Um candidato pertence a uma sessão

Cargo.hasMany(Candidato, { foreignKey: "cargoId", onDelete: "CASCADE" }); // Um cargo tem vários candidatos
Candidato.belongsTo(Cargo, { foreignKey: "cargoId" }); // Um candidato pertence a um cargo
Vote.belongsTo(Cargo, { foreignKey: "cargoId" }); // Um Voto pertence ao Cargo.

Candidato.hasMany(Vote, { foreignKey: "candidatoId", onDelete: "CASCADE" }); // Um candidato pode ter vários votos
Vote.belongsTo(Candidato, { foreignKey: "candidatoId" }); // Um voto pertence a um candidato

Sessao.hasMany(Vote, { foreignKey: "sessaoId", onDelete: "CASCADE" }); // Uma sessão pode ter vários votos
Vote.belongsTo(Sessao, { foreignKey: "sessaoId" }); // Um voto pertence a uma sessão

// Sincronizar modelos com o banco de dados
//connection.sync({ force: true })
//connection.sync({ force: true }).then(() => {
//  console.log('Tabelas criadas!');
//});

// Verificando se o banco de dados precisa ser limpo.
if(IsShouldCleanupDb){
  console.log("Resultado da opção: limpeza do banco de dados: "+IsShouldCleanupDb);
  connection.sync({ force: true }).then(() => {
    console.log("Banco limpo, tabelas recriadas, por favor desative a opção de limpeza do banco de dados, antes de rodar o sistema!");
  });
}

module.exports = {
  Sessao,
  Cargo,
  Candidato,
  Vote,
};
