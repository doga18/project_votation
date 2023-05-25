const express = require('express');
const router = express.Router();

// const Candidato = require('../candidato/Candidato');
// const Cargo = require('./Cargo');
// const User = require('../user/User');
// const Sessao = require('../sessao/Sessao');

const {Sessao, Cargo, Candidato, Vote } = require('../models/models');

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
  Cargo.findAll().then(cargo => {
    res.render('admin/cargo/index', { cargos: cargo});
  })
});

router.post('/admin/cargo/delete', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  const id = parseInt(req.body.id);
  console.log(id);

  if(!id == undefined) {
    Cargo.destroy({
      where: { id: id },
      cascade: true,
    }).then(() => {
      res.redirect('/admin/cargo/index')
    })
  }else{
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
      console.console(err);
      return res.status(500).json({message: err.message})
    });
  } else {
    console.log('error creating');
  }
});

module.exports = router