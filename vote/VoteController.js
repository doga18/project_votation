const express = require('express');
const router = express.Router();
const User = require('../user/User');
// const Candidato = require('../candidato/Candidato');
// const Cargo = require('../cargo/cargo');
// const Vote = require('./Vote');

const {Sessao, Cargo, Candidato, Vote } = require('../models/models');

const { body, validationResult } = require('express-validator');

router.get('/before_vote', (req, res) => {
  //vote_active = true;

  Sessao.findOne({
    where: {
      active: true,
    },
    order: [
      ['id', 'desc'],
    ]
  }).then((sessao_find) => {    
    if(sessao_find){
      status_votation = true;
    }else{
      status_votation = false;
    }
    res.render('vote/before', {
      sessao: sessao_find,
      // Aqui serve para acessar o valor da chave active, neste caso retorna true.
      //status_vote: sessao[0].active,
      status_vote: status_votation,
    })
  })  
});

router.get('/end_votation', (req, res) => {
  res.render('vote/end')
});

router.post('/before_vote_validation', [  
  body('pass_sessao').notEmpty().trim().escape(),
], (req, res) => {
  const pass_informed = req.body.pass_sessao;
  const id_sessao = req.body.id_sessao;
  const eleitores = parseInt(req.body.eleitores);
  var new_eleitores = eleitores - 1;

  console.log('Informando os valores vindo pelo template, pass_informed, id_sessao, eleitores, new_eleitores');
  console.log(pass_informed);
  console.log(id_sessao);
  console.log(eleitores);
  console.log(new_eleitores);

  Sessao.findOne({
    order: [
      ['id', 'desc'],
    ]
  }).then((sessao) => {
    console.log('Senha informada: ' + pass_informed + 'Senha do banco: ' + sessao.pass_sessao );
    if(pass_informed == sessao.pass_sessao){
      if(new_eleitores >= 0){
        Sessao.update({
          eleitores: parseInt(new_eleitores),
      },      
       {
        where: {
          id: id_sessao,
        }
      }).then(() => {
        console.log('Os Eleitores do new Eleitores são: ' + new_eleitores),
        res.redirect('/vote_init/0')
      })
      
      } else {
        Sessao.findOne({
          where: {
            active: true,
          },
          order: [
            ['id', 'desc'],
          ]
        }).then((sessao_find) => {    
          if(sessao_find){
            status_votation = true;
          }else{
            status_votation = false;
          }
          res.render('vote/before', {
            sessao: sessao_find,
            // Aqui serve para acessar o valor da chave active, neste caso retorna true.
            //status_vote: sessao[0].active,
            status_vote: status_votation,
            message: 'Não há mais eleitores aptos para Votos!',
          })
        })        
      }
    } else {
      Sessao.findOne({
        where: {
          active: true,
        },
        order: [
          ['id', 'desc'],
        ]
      }).then((sessao_find) => {    
        if(sessao_find){
          status_votation = true;
        }else{
          status_votation = false;
        }
        res.render('vote/before', {
          sessao: sessao_find,
          // Aqui serve para acessar o valor da chave active, neste caso retorna true.
          //status_vote: sessao[0].active,
          status_vote: status_votation,
          message: 'Senha de sessão incorreta ou não informada.',
        })
      })
    }
  })

});

// User.update({
//   type: type,
//   active: active,
// }, {
//   where: {
//     id: id,
//   }
// })

router.get('/vote_init/:cargoIndex', (req, res) => {
  const cargoIndex = req.params.cargoIndex;

  if (cargoIndex == undefined) {
    status = false;
  } else {
    status = true;
  }

  console.log(cargoIndex);

  Cargo.findAll({
    include: [
      {
        model: Candidato,
        include: [
          {
            model: Sessao,
            where: { active: true } // Filtra apenas sessões ativas
          }
        ]
      }
    ]
  })
    .then((cargos) => {
      var qtd_cargos = parseInt(cargos.length);

      res.render('vote/init', {
        cargos: cargos,
        cargoIndex: cargoIndex,
        qtd_cargos: qtd_cargos,
        status: status
      });
    })
    .catch((error) => {
      console.error(error);
      res.render('vote/init', {
        cargos: [],
        cargoIndex: cargoIndex,
        qtd_cargos: 0,
        status: status
      });
    });
});

router.post('/vote/action', (req, res) => {
  const candidatoId = req.body.candidatoId;
  const cargoId = req.body.cargoId;
  const sessaoId = req.body.sessao_id;

  // Printando os valores para ver se estão vindo corretamente dos body data: { cargoIndex: cargoIndex, candidatoId: candidatoId, cargoId: cargoId, sessao_id: sessaoId},
  console.log('Verificando a sessaoID: ' + sessaoId);
  console.log('Mostrando o CandidatoID: ' + candidatoId + ' Mostrando o cargoID' + cargoId + ' Mostrando a Sessao ID: ' + sessaoId);

  Candidato.findByPk(candidatoId)
    .then((candidato) => {
      if (!candidato) {
        // Candidato não encontrado
        return res.send('Candidato não encontrado');
      }

      Cargo.findByPk(cargoId)
        .then((cargo) => {
          if (!cargo) {
            // Cargo não encontrado
            return res.send('Cargo não encontrado');
          }
          Sessao.findByPk(sessaoId)
            .then((sessao) => {
              if(!sessao){
                return res.send('Sessao não encontrada');
              }
                  // Registrar o voto
              Vote.create({                
                candidatoId: candidato.id,
                cargoId: cargo.id,
                sessaoId: sessao.id,
              })
                .then((vote) => {
                  // Voto registrado com sucesso
                  console.log('Voto registrado com sucesso ' + sessao.id);              
                  res.status(200).json({message: 'Voto registrado com sucesso'});
                })
                .catch((error) => {
                  // Tratar erros ao registrar o voto
                  console.error('Erro ao registrar o voto:', error);
                  res.send('Erro ao registrar o voto');
                });
            })
        })
        .catch((error) => {
          // Tratar erros ao buscar o cargo
          console.error('Erro ao buscar o cargo:', error);
          res.send('Erro ao buscar o cargo');
        });
    })
    .catch((error) => {
      // Tratar erros ao buscar o candidato
      console.error('Erro ao buscar o candidato:', error);
      res.send('Erro ao buscar o candidato');
    });
});


module.exports = router