const Sequelize = require("sequelize");
const connection = require("../database/database");

const { IsShoudCleanupDb } = require('../index.js');

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
  },
  conselheiro_fiscal: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  qtd_minima_vote: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 3,
  },
  qtd_maxima_vote: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

const Cargo = connection.define("cargo", {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'nome', // Adicione essa linha
  },
  descricao: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'descricao', // Adicione essa linha
    defaultValue: '',
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
});

const Cargo_Conselheiro = connection.define("cargo_conselheiro", {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'nome', // Adicione essa linha
  }
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
    type: Sequelize.BLOB('medium'),
    limit: 100 * 1024 * 1024, // 100 MB
    allowNull: true,
  },
});

const Vote = connection.define("vote", {});

// Relacionamentos
Sessao.hasMany(Cargo, { foreignKey: "sessaoId", onDelete: "CASCADE" }); // Uma sessão tem vários cargos
Sessao.hasMany(Cargo_Conselheiro, { foreignKey: "sessaoId", onDelete: "CASCADE"} ); // Uma sessão tem vários carg
Cargo.belongsTo(Sessao, { foreignKey: "sessaoId" }); // Um cargo pertence a uma sessão
// NEW
Cargo_Conselheiro.belongsTo(Sessao, { foreignKey: "sessaoId"}); //

Sessao.hasMany(Candidato, { foreignKey: "sessaoId", onDelete: "CASCADE" }); // Uma sessão tem vários candidatos
Candidato.belongsTo(Sessao, { foreignKey: "sessaoId" }); // Um candidato pertence a uma sessão

Cargo.hasMany(Candidato, { foreignKey: "cargoId", onDelete: "CASCADE" }); // Um cargo tem vários candidatos
Cargo_Conselheiro.hasMany(Candidato, { foreignKey: "cargo_conselheiroId", onDelete: "CASCADE" }); //
Candidato.belongsTo(Cargo, { foreignKey: "cargoId" }); // Um candidato pertence a um cargo
// NEW
Candidato.belongsTo(Cargo_Conselheiro, { foreignKey: "cargo_conselheiroId"}); // Umocument
Vote.belongsTo(Cargo, { foreignKey: "cargoId" }); // Um Voto pertence ao Cargo.
Vote.belongsTo(Cargo_Conselheiro, { foreignKey: "cargo_conselheiroId"});

Candidato.hasMany(Vote, { foreignKey: "candidatoId", onDelete: "CASCADE" }); // Um candidato pode ter vários votos
Vote.belongsTo(Candidato, { foreignKey: "candidatoId" }); // Um voto pertence a um candidato

Sessao.hasMany(Vote, { foreignKey: "sessaoId", onDelete: "CASCADE" }); // Uma sessão pode ter vários votos
Vote.belongsTo(Sessao, { foreignKey: "sessaoId" }); // Um voto pertence a uma sessão

// Sincronizar modelos com o banco de dados
// connection.sync({ force: true })
// connection.sync({ force: true }).then(() => {
// console.log('Tabelas criadas!');
// As opções que existe para sincronização são: true, false e alter
//});

if(IsShoudCleanupDb){
  console.log("Limpeza Ativa, começando");
  connection.sync({ force: true }).then(() => {
    console.log('Tabelas criadas com sucesso.');
  }).catch((error) => {
    console.error('Erro ao criar tabelas:', error);
  });
}

module.exports = {
  Sessao,
  Cargo,
  Cargo_Conselheiro,
  Candidato,
  Vote,
};
