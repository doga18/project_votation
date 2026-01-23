const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const fs = require('fs');

// const Candidato = require('./Candidato');
// const Cargo = require('../cargo/Cargo');
// const User = require('../user/User');
// const Sessao = require('../sessao/Sessao');

const {Sessao, Cargo, Cargo_Conselheiro, Candidato, Vote } = require('../models/models');


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
      Cargo_Conselheiro.findAll().then(cargos_conselher => {
        return res.render('admin/candidato/new', {
          cargos: cargos,
          cargo_conselheiro: cargos_conselher,
          sessao: sessao_find,
        });
      });        
      })
    })    
  });


router.get('/admin/candidato/edit/:candidato', (req, res) => {
  if (!req.session.user){
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precise estar logado',
    });    
  }

  const id_candidato = parseInt(req.params.candidato);
  console.log("Id do candidato", id_candidato);

  Candidato.findOne({
    where: {
      id: id_candidato,
    }
  })
  .then((candidato) => {    
    Cargo.findAll().then(cargos => {
      Cargo_Conselheiro.findAll().then(cargos_conselher => {
        return res.render('admin/candidato/edit', {
          cargos: cargos,
          cargo_conselheiro: cargos_conselher,
          candidato: candidato,
        });
      })
    })
  });

});

router.post('/admin/candidato/edit', upload.single('foto'), (req, res) => {
  if(!req.session.user){
    return res.render('admin/administrative/login', {
      message: "Para você acessar essa área você precisa estar logado",
    });
  }

  const id_candidato = req.body.id_candidato;  
  const name = req.body.name;  
  const chapa = req.body.chapa;  
  const fotoPath = req.file.path;  
  const fotoBuffer = fs.readFileSync(fotoPath);
  const cargo = req.body.cargo;
  
  Sessao.findOne({
    where: {
      active: true,
    }
  })
  .then((sessao) => {
    if(name != undefined && chapa != undefined && fotoPath != undefined){
      if (cargo == 99){
        // console.log("Cargo Especial de conselheiro", cargo)
        Candidato.update({
          nome: name,
          numero: chapa,
          foto: fotoBuffer,
          cargo_conselheiroId: cargo,
        }, {
          where: {
            id: id_candidato,
          }
        }).then(candidato => {
          fs.unlink(fotoPath, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Erro ao excluir a foto' });
            }        
            res.redirect('/administrative/index');
          });
        })
        .catch(err => {
          console.error("Erro ao carregar a imagem", err);
          res.status(500).json({message: 'Erro no método imagem', error: err});
        });
        // Candidato.create({
        //   nome: req.body.name,
        //   numero: req.body.chapa,
        //   foto: fotoBuffer,
        //   cargo_conselheiroId: cargo,
        //   sessaoId: sessao.id,
        // })        
      }else {
        Candidato.update({
          nome: name,
          numero: chapa,
          foto: fotoBuffer,
          cargo_Id: cargo,
        }, {
          where: {
            id: id_candidato,
          }
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
    }
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
  console.log("Caminho da footo na criação: ", fotoPath);
  const fotoBuffer = fs.readFileSync(fotoPath);
  const cargo = req.body.cargo;  
  const sessao_cap = req.body.sessao;
  console.log('Pegando o ID da sessão para atrelar ao candidato: ' + sessao_cap)

  // nome, numero, foto

  console.log('Nome informado foi ' + name + 'chapa informada foi '+ chapa+ 'a imagem foi ' +fotoPath);
  console.log(" O id do cargo veio como ", cargo)

  if(name != undefined && chapa != undefined && fotoPath != undefined){
    if (cargo == 99){
      console.log("Cargo Especial de conselheiro", cargo)
      Candidato.create({
        nome: req.body.name,
        numero: req.body.chapa,
        // foto: fotoPath,
        foto: fotoBuffer,
        cargo_conselheiroId: cargo,
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
        console.error("Erro ao carregar a imagem", err);
        res.status(500).json({message: 'Erro no método imagem'});
      });
    }else {
      Candidato.create({
        nome: req.body.name,
        numero: req.body.chapa,
        // foto: fotoPath,
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