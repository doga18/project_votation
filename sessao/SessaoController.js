const express = require('express');
const router = express.Router();
const User = require('../user/User');

// const Candidato = require('../candidato/Candidato');
// const Cargo = require('../cargo/cargo');
// const Vote = require('../vote/Vote');
// const Sessao = require('./Sessao');

const {Sessao, Cargo, Candidato, Vote } = require('../models/models');
const { body, validationResult } = require('express-validator');

module.exports = router