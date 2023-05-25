const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const fs = require('fs');

// const Candidato = require('./Candidato');
// const Cargo = require('../cargo/Cargo');
// const User = require('../user/User');
// const Sessao = require('../sessao/Sessao');

const {Sessao, Cargo, Candidato, Vote } = require('../models/models');


router.get('/admin/candidato', (req, res) => {
  // Se o usuário estiver autenticado, renderize a página admin, se não, Login.
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  res.render('admin/administrative/index');

  // Se não.
  // res.render('/login');
  
})

router.get('/admin/candidato/new', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  Cargo.findAll().then(cargos => {
    Sessao.findOne({
      order: [
        ['id', 'desc'],
      ]
    })
    .then((sessao_find) => {
        return res.render('admin/candidato/new', {
          cargos: cargos,
          sessao: sessao_find,
        });
      })
    })    
  });  


router.post('/admin/candidato/new', upload.single('foto'),  (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  const name = req.body.name;
  const chapa = req.body.chapa;
  // Para pegar o caminho completo da foto, deve se pegar da seguinte forma
  const fotoPath = req.file.path;
  const fotoBuffer = fs.readFileSync(fotoPath);
  const cargo = req.body.cargo;  
  const sessao_cap = req.body.sessao;
  console.log('Pegando o ID da sessão para atrelar ao candidato: ' + sessao_cap)

  // nome, numero, foto

  console.log('Nome informado foi ' + name + 'chapa informada foi '+ chapa+ 'a imagem foi ' +fotoPath);

  if(name != undefined && chapa != undefined && fotoPath != undefined){
    Candidato.create({
      nome: req.body.name,
      numero: req.body.chapa,
      foto: fotoBuffer,
      cargoId: cargo,
      sessaoId: sessao_cap,
    })
    .then(candidato => {
      fs.unlink(fotoPath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erro ao excluir a foto' });
        }
        res.redirect('/administrative/index');
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Erro no método imagem'});
    });
  }
})

router.post('/admin/candidato/del_candidato', (req, res) => {
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  var id = req.body.id;
  console.log(id);

  if(id !== undefined) {
    if(!isNaN(id)){
      Candidato.destroy({
        where: {id: id},
      }).then(() => {
        res.redirect('/administrative/index');
      });
    }
  }

});

module.exports = router