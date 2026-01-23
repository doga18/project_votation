const express = require('express');
const router = express.Router();
const User = require('./User');
const ejs = require('ejs');
const path = require('path');
//const Candidato = require('../candidato/Candidato');
//const Cargo = require('../cargo/cargo');
//const Sessao = require('../sessao/Sessao');
const {Sessao, Cargo, Cargo_Conselheiro, Candidato, Vote } = require('../models/models');
const { body, validationResult } = require('express-validator');
const connection = require('../database/database');
const { on } = require('events');
const resultadoTemplate = path.join(__dirname, '../views/admin/report/index.ejs');

// Consulta para encontrar o candidato mais votado para cada cargo
async function findCandidatosMaisVotados() {
  const candidatosMaisVotados = await Cargo.findAll({
    include: [
      {
        model: Candidato,
        include: [
          {
            model: Vote,
            attributes: [
              [connection.fn('COUNT', connection.col('voto')), 'totalVotos']
            ],
          }
        ],
        order: [[Vote, 'voto', 'DESC']],
        limit: 1
      }
    ]
  });

  return candidatosMaisVotados;
}

// Defina a rota para exibir o resultado
router.get('/admin/administrative/report2', async (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }

  try {
    // Chame a função para buscar os candidatos mais votados
    const candidatos = await findCandidatosMaisVotados();
    
    // Renderize o template e passe os candidatos como variável
    res.render(resultadoTemplate, { candidatos });
  } catch (error) {
    console.log('Erro ao buscar os candidatos mais votados:', error);
    res.status(500).send('Erro ao buscar os candidatos mais votados');
  }
});

router.get('/admin/administrative/report', async (req, res) => {
  try {
    const [cargos] = await connection.query(`
      SELECT cargo.id, cargo.nome, candidato.id AS 'candidato.id', candidato.nome AS 'candidato.nome', COUNT(vote.id) AS 'candidato.totalVotos'
      FROM cargos AS cargo
      LEFT JOIN candidatos AS candidato ON cargo.id = candidato.cargoId
      LEFT JOIN votes AS vote ON candidato.id = vote.candidatoId
      GROUP BY cargo.id, candidato.id
      ORDER BY 'candidato.totalVotos' DESC
    `);
    // console.log(cargos);
    const sessao = await Sessao.findOne({
      where: {
        active: true,
      }
    });

    try {
      const [cargo_conselheiro] = await connection.query(`
          SELECT cargo_conselheiro.id, cargo_conselheiro.nome, candidato.id AS 'candidato.id', candidato.nome AS 'candidato.nome', COUNT(vote.id) AS 'candidato.totalVotos'
          FROM cargo_conselheiros AS cargo_conselheiro
          LEFT JOIN candidatos AS candidato ON cargo_conselheiro.id = candidato.cargo_conselheiroId
          LEFT JOIN votes AS vote ON candidato.id = vote.candidatoId
          GROUP BY cargo_conselheiro.id, candidato.id
          ORDER BY 'candidato.totalVotos' DESC
        `);
        console.log("Cargos conselheiros localizados", cargo_conselheiro)
        res.render('admin/report/results', {
          cargos,
          cargo_conselheiro,
          sessao: sessao,
        });
      } catch (error) {
        console.log('Erro encontrado', error);
        res.render('admin/report/results', { cargos, sessao: sessao });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Erro ao obter os resultados da votação');
    }
  });






router.get('/login/authenticate', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  res.render('admin/cargo/index')
})

router.get('/administrative/index', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  Sessao.findOne({
    order: [
      ['id', 'desc'],
    ]
  }).then((sessao) => {
    Candidato.findAll({
      order: [['id', 'desc']],
    })
      .then((candidatos) => {
        Cargo.findAndCountAll().then((cargo) => {
          Cargo_Conselheiro.findAll().then((cargo_conselheiro) => {
            // console.log("Cargo conselheiro", cargo_conselheiro)
            mensagem = "Estou aqui";
            // var msg_show = req.session.user['msg_session'];
            var msg_show = req.session.user[mensagem];
            // console.log('Valor da sessao: ' + req.session.user['msg_session']);
            delete req.session.user['msg_session']
            // console.log('ID da sessao do candidato: ' + Candidato.sessaoId)
            if(msg_show) {
              res.render('admin/administrative/index', {
                sessao: sessao,
                candidatos: candidatos,
                cargos: cargo,              
                message: msg_show,
                cargo_conselheiro: cargo_conselheiro
              });
              delete req.session.user['msg_session']
            }
            else{
              res.render('admin/administrative/index', {
                sessao: sessao,
                candidatos: candidatos,
                cargos: cargo,
                message: msg_show,
                cargo_conselheiro: cargo_conselheiro
              });
            }; 
            });                 
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor' });
      })
  })
  ;
});

router.get('/administrative/active', (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }
  User.findAll({
    order: [
      ['id', 'desc'],
    ]
  }).then((user) => {
    res.render('admin/administrative/active', {
      users: user
    });
  })  
})

router.get('/administrative/edit', (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    })
  }
  Sessao.findOne({
    order: [
      ['id', 'desc'],
    ]
  }).then((sessao) => {
    res.render('admin/sessao/edit', {
      sessao: sessao,
    })
  });
  
});

router.post('/administrative/edit', (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/register', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    })    
  }  
  var id = parseInt(req.body.id);
  var eleitores = parseInt(req.body.eleitores);
  var pass_sessao = req.body.pass_sessao;
  var name_congregacao = req.body.name_congregacao;
  var qtd_minima_vote = req.body.qtd_minima_vote;
  console.log("Valor recebido ", qtd_minima_vote)
  
  const isCheckboxConselher = req.body.conselher_on === 'on';

  if (isCheckboxConselher) {
    var conselheiro = true
  }else{
    var conselheiro = false
  }

  console.log('Eleitores: ' + eleitores + ' Pass Sessao: ' + pass_sessao + ' Id: ' + id + ' nome da igreja: ' + name_congregacao);

  if(id != undefined){
    Sessao.update({            
      eleitores: eleitores,
      pass_sessao: pass_sessao,
      name_congregacao: name_congregacao,
      conselheiro_fiscal: conselheiro,
      qtd_minima_vote: qtd_minima_vote
    }, {
      where: {
        id: id,
      }
    }).then(() => {
      if (conselheiro == false) {
        Cargo_Conselheiro.destroy({
          where: { nome: "Conselheiro Fiscal"},
          cascade: true,
        }).then((result) => {
          console.log("Desativei o conselho fiscal, o cargo deve ser deletado!", result);
          res.redirect('/administrative/session')
        }).catch(err => {
          console.log("Erro ao deletar o cargo", err);
        })
      }else if (conselheiro = true) {        
        Cargo_Conselheiro.create({
          id: 99,
          nome: "Conselheiro Fiscal",
          sessaoId: id,
        })
        .catch(err => {
          console.log("erro ao criar o cargo conselheiro fiscal o mesmo já existe" + err);        
        });
        res.redirect('/administrative/session');
      }else{
        res.redirect('/administrative/session');
      }
    })
  }
});

router.post('/administrative/delete', (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    })    
  }
  var id = parseInt(req.body.id);

  if(id != undefined){
    User.destroy({
      where: {
        id: id,
      },
    }).then(() => {
      res.redirect('/administrative/active')
    })
  }
});

router.get('/administrative/session', (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    })    
  }
  Sessao.findAll()
    .then((sessao) => {
      console.log("A sessão está : " + sessao.conselheiro_fiscal)
      res.render('admin/sessao/index', {
        sessao: sessao,        
      })
    })
});

router.get('/administrative/new_session', (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    })    
  }
  res.render('admin/sessao/new')
});

router.post('/administrative/new_session', [
  body('eleitores').notEmpty().trim().escape(),
  body('pass_sessao').notEmpty().trim().escape(),
  body('name_congregacao').notEmpty().trim().escape(),  
], (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    })    
  }
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ errors: erros.array() });
  }

  const eleitores = req.body.eleitores;
  const pass_sessao = req.body.pass_sessao;
  const name_congregacao = req.body.name_congregacao;
  const isCheckboxConselher = req.body.conselher_on === 'on';

  if (isCheckboxConselher) {
    var conselheiro = true
  }else{
    var conselheiro = false
  }

  console.log("A opção do conselheiro ficou como" + conselheiro)

  console.log('Nome da congregacao: ' + name_congregacao);
  console.log(" A opção de conselheiro veio como " + isCheckboxConselher)

  Sessao.create({
    eleitores: eleitores,
    pass_sessao: pass_sessao,
    active: false,
    name_congregacao: name_congregacao,
    conselheiro_fiscal: conselheiro
  }).then((sessao_new) => {
    Sessao.findAll()
    // .then((sessao_find) => {      
    //   res.render('admin/sessao/index', {
    //     message: 'Sessão criada com Sucesso, porém desativada.',
    //     sessao: sessao_find
    // });
    // })
    .then(() => {
      if (conselheiro == true){
        Cargo_Conselheiro.create({
          id: 99,
          nome: "Conselheiro Fiscal",
          sessaoId: sessao_new.id,
        })
        .catch(err => {
          console.log("erro ao criar o cargo conselheiro fiscal o mesmo já existe" + err);        
        });
        res.redirect('/administrative/session');
      }else{
        res.redirect('/administrative/session');
      }
      // res.redirect('/administrative/session');
    });    
  });
});

router.post('/administrative/sessao_delete', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    });
  }
  
  const id = req.body.id;
  
  if (id != undefined) {
    Sessao.destroy({
      where: {
        id: id,
      },
      cascade: true // Adicione essa opção para habilitar a exclusão em cascata
    }).then(() => {
      res.redirect('/administrative/session');
    }).catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Ocorreu um erro ao excluir a sessão.' });
    });
  }
});

router.post('/administrative/delete_votes', (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: "Para acessar essa página você precisa estar autenticado"
    });
  }

  const sessao_id = req.body.id;

  if(sessao_id != null){
    Vote.destroy({
      where: {
        sessaoId: sessao_id,
      }
    })
    .then(() => {
      return res.redirect('/administrative/index')
    })
  }

}); 

router.post('/administrative/activate', (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: 'Para acessar essa página você precisa estar autenticado.'
    })    
  }

  var active_received = req.body.active;
  var id = req.body.id;

  if(active_received == 'true')  {
    active = true;
  }else{
    active = false;
  }

  console.log('id e active '+ active_received, id, active);

  if(id != undefined){
    Sessao.update({      
      active: active,
    }, {
      where: {
        id: id,
      }
    }).then(() => {
      res.redirect('/administrative/session');
    })
  }
    
});

// Rota dos Relatórios!

router.get('/admin/administrative/report2', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }

  Vote.findAll({
    order: [
      ['id', 'desc'],
    ],
    include: [
      {
        model: Candidato,
        include: [Cargo], // Incluindo o modelo Cargo associado ao Candidato
      },
      // Dica importante, para ler os dados que estão sendo jogados na tela.
      // Basta dar um console.log(objeto.toJSON()) isso irá descompactar todos os dados e objetos.
      Cargo, // Joguei o cargo aqui, mas não tem necessidade.
    ],
  }).then((voto) => {
    console.log(voto);
    res.render('admin/report/index', {
      voto: voto,
      message: 'Votos Carregados!',
    });
  });
});





module.exports = router