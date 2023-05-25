// Importar os módulos necessários
const express = require('express');
// Uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database');


const candidatoController = require('./candidato/CandidatoController');
const cargoController = require('./cargo/CargoController');
const userController = require('./user/UserController');
const voteController = require('./vote/VoteController');
const sessaoController = require('./sessao/SessaoController');

// Importanto os models
// const Candidato = require('./candidato/Candidato');
// const Cargo = require('./cargo/Cargo');
// const User = require('./user/User');
// const Vote = require('./vote/Vote');
// const Sessao = require('./sessao/Sessao');

const User = require('./user/User');

const {Sessao, Cargo, Candidato, Vote } = require('./models/models');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const session = require('express-session');

//Iniciando sessões.
app.use(session({
  secret: 'AOSIJDAOSUHUHDUAHSUDAUSNCNNCAUSUHAUH181827NDAISD91981NDNNSAD',
  resave: false,
  saveUninitialized: false
}))

// Configurar o EJS como mecanismo de visualização
app.set('view engine', 'ejs');

// Configurar o diretório de arquivos estáticos
app.use(express.static('public'));

// Configurar o middleware body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Database connection
connection
  .authenticate()
  .then(() => {
    console.log('Conexão realizada com sucesso');
}).catch((error) => {
  console.log(error);
});

app.use('/', candidatoController);
app.use('/', cargoController);
app.use('/', userController);
app.use('/', voteController);
app.use('/', sessaoController);



// Crie as tabelas para todos os modelos SINCRONIA
//connection.sync({ force: true })
//   .then(() => {
//     console.log('Tabelas criadas com sucesso.');
//   })
//   .catch((error) => {
//     console.error('Erro ao criar tabelas:', error);
//   });

app.get('/', (req, res) => {
  mensagem = 'Olá seja bem vindo';
  res.render('index', { message: mensagem });
});

// Rota para o Login
app.get('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Faça todas as verificações para acessar.

  res.render('admin/administrative/login');
})

app.get('/register', (req, res) => {
  res.render('admin/administrative/register');
});

app.post('/register', [
  body('user').notEmpty().trim().escape(),
  body('name').notEmpty().trim().escape(),
  body('password').notEmpty().trim().escape(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = req.body.user;
  const name = req.body.name;
  const password = req.body.password;

  console.log(user, name, password);

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      // Lidar com erro ao gerar o hash
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    // Verificar se é o primeiro usuário a ser criado
    User.count()
      .then((count) => {
        let active = 0;
        let type = 0;
        if (count === 0) {
          // É o primeiro usuário, definir active como 1
          active = 1;
          type = 1;
        }

        // Salvar o usuário com a senha hash no banco de dados
        User.create({ user: user, nome: name, password: hash, type: type, active: active })
          .then(user => {
            // Registro bem-sucedido, redirecionar para a página de login
            res.render('admin/administrative/login', {
              message: 'Cadastro Realizado, faça o Login.'
            });
          })
          .catch(error => {
            // Lidar com erro ao salvar o usuário no banco de dados
            console.error(error);
            res.status(500).json({ error: 'Erro no servidor' });
          });
      })
      .catch(error => {
        // Lidar com erro ao contar registros
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor' });
      });
  });
});

// Ação de Logar
app.post('/login', (req, res) => {
  const { user, password } = req.body;
  const registry = req.body.registry;
  const login = req.body.login;
  console.log('Registro: ' +registry + ' Login: '+ login);

  if(login != undefined){
    // Buscar o usuário no banco de dados
    User.findOne({ where: { user }})
    .then((foundUser) => {
      if(!foundUser){
        // Usuário não Localizado!
        // Resposta em Json
        //return res.status(404).json({ error: 'Usuário não localizado' });
        res.render('admin/administrative/register', {
          message: 'O login que você informou não existe, aproveite e cadastre-se'
        })        
      }
      //Comparando a senha
      bcrypt.compare(password, foundUser.password, (err, result) => {
        if(err){
          // Se houver erro.
          console.error(err);
          return res.status(500).json({ message: 'Erro no servidor1' });
        }
        if(result && foundUser.active == true){
          // Senha correta, login bem-sucedido
          //return res.status(200).json({ message: 'Login realizado' });
          msg_session = ('Usuário Autenticado, Bem vindo(a) '+foundUser.nome)
          req.session.user = {
            id: foundUser.id,
            user: foundUser.user,
            nome: foundUser.nome,
            msg_session: msg_session,
          };
          console.log(req.session.user);          
          return res.redirect('/administrative/index')
        } else if (result && foundUser.active == false) {
          res.render('admin/administrative/login', {
            message: 'Seu usuário não foi autorizado por um administrador.'
          })
        } else {
          res.render('admin/administrative/login', {
            message: 'Os dados de acesso estão incorretos.'
          })
          //return res.status(401).json({ message: 'Senha inválida' });
        }      
      })
    })
    
    .catch((err) => {
      if (err.name === 'TypeError' && err.message.includes("Cannot read properties of null")) {
        // Erro de leitura de propriedade nula (null)
        res.render('admin/administrative/login', {
          message: 'Os dados de acesso não podem estar em branco'
        })
      } else {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor2' });
      }
    });
  }else{
    res.redirect('/register');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin', (req, res) => {
  // Se o usuário estiver autenticado, renderize a página admin, se não, Login.
  if (!req.session.user) {
    return res.render('admin/administrative/login', {
      message: 'Para você acessar essa área você precisa estar logado',
    });
  }
  res.render('admin/administrative/login');

  // Se não.
  // res.render('/login');

});

// Rota para exibir a página inicial (com as opções de voto)
app.get('/', (req, res) => {
  // db.all('SELECT * FROM votos', (err, rows) => {
  //   if (err) {
  //     console.error(err);
  //     return res.status(500).send('Erro no servidor');
  //   }

  //   res.render('index', { votos: rows });
  votos = 10
  res.render('index', {votos: votos});
  
});

// Iniciar o servidor na porta 3000
port_server = 8080
app.listen(port_server, () => {
  console.log('Servidor iniciado na porta '+port_server);
});
