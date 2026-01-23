const express = require('express');
const router = express.Router();

// const Candidato = require('../candidato/Candidato');
// const Cargo = require('./Cargo');
// const User = require('../user/User');
// const Sessao = require('../sessao/Sessao');

const {Sessao, Cargo, Cargo_Conselheiro, Candidato, Vote } = require('../models/models');

router.get('/admin/cargo', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  res.render('admin/cargo/index')
})

router.get('/admin/cargo/index', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  Cargo.findAll().then(cargos => {
    Cargo_Conselheiro.findAll().then(cargo_conselheiro => {
      console.log("Cargo encontrado", cargo_conselheiro, cargos)
      return res.render('admin/cargo/index', { cargos: cargos, cargo_conselheiro: cargo_conselheiro});
    }).catch(err => {
      console.log('Erro ao buscar cargo_conselheiro', err);
      return res.render('partials/404');
    });
  }).catch(err => {
    console.log('Erro ao buscar cargos', err);
    return res.render('partials/404');
  });
});

router.get('/admin/cargo/edit/:id', (req, res) => {
  console.log("Entrou na rota de edição do cargo");
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }

  const id_select = parseInt(req.params.id, 10);
  if (isNaN(id_select)) {
    return res.render('partials/404');
  }

  Cargo.findByPk(id_select)
    .then(cargo => {
      if (cargo) {
        console.log("Cargo para edição encontrado", cargo.sessaoId);
        // Retornando o ID da sessão a partir do cargo encontrado

        return res.render('admin/cargo/edit', { cargo: cargo});
      }
      return res.render('partials/404');
    })
    .catch(error => {
      console.log("Erro ao encontrar o cargo para edição", error);
      return res.render('partials/404');
    });
});
// Rota para editar o cargo
router.post('/admin/cargo/update', (req, res) => {
  console.log("Entrou na rota de update do cargo");
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  const id = parseInt(req.body.id);
  const name = req.body.nome;
  //const sessao_id = parseInt(req.body.sessao_id);
  console.log("Valor do ID do cargo para ser editado", id);
  console.log("novo nome a ser atualizado", req.body.nome);
  Cargo.update({
    nome: req.body.nome,
    //sessaoId: sessao_id,
  }, {
    where: { id: id }
  }).then(() => {
    if(req.body.nome !== name){
      console.log("Nome do cargo atualizado de " + nome + " para " + req.body.nome);
    }
    res.redirect('/administrative/session')
  }).catch(err => {
    console.log("Erro ao editar o cargo", err);
  })
});

router.post('/admin/cargo/delete', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  const id = parseInt(req.body.id);
  console.log("Valor do ID do cargo para ser deletado", id);

  if(id) {
    Cargo.destroy({
      where: { id: id },
      cascade: true,
    }).then(() => {
      res.redirect('/administrative/session')
    }).catch(err => {
      console.log("Erro ao deletar o cargo", err);
    })
  }else{
    console.log("Cai no else");
    res.redirect('/admin/cargo/index')
  }

});

router.get('/admin/cargo/new', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  Sessao.findOne({
    order: [
      ['id', 'desc'],
    ]
  }).then((sessao_find) => {
    console.log(sessao_find);
    res.render('admin/cargo/new', {
      sessao: sessao_find,
    })
  })
});

router.post('/admin/cargo/new', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  const nome = req.body.name;
  const sessao_cap = req.body.sessao;
  console.log('Sessão id criando o cargo: ' + sessao_cap);  
  if (nome !== undefined) {
    Cargo.create({
      nome: nome,
      sessaoId: sessao_cap,
    })
    .then(() => {
      res.redirect('/administrative/index');
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({message: err.message})
    });
  } else {
    console.log('error creating');
  }
});

module.exports = router