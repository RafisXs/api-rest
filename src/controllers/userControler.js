const User = require('../models/userModel');
const Comentario = require('../models/comentarioModel');
const jwt = require('jsonwebtoken');

/*
  Gera um token JWT para o usuário identificado pelo id recebido.
  O token expira em 1 dia conforme configurado nas opções.
  
  jwt.sign recebe:
    1º - Payload: dado que será embutido no token (aqui, o id do usuário)
    2º - Segredo: chave de assinatura definida no arquivo .env
    3º - Opções: tempo de expiração ('1d' = 1 dia)
*/
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

/* Cadastra um novo usuário e retorna um token de acesso imediatamente */
exports.cadastro = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    const novoUsuario = await User.create({ username, email, password, bio });

    /* Remove a senha do objeto antes de enviá-la na resposta, por segurança */
    novoUsuario.password = undefined;

    /* O _id é a chave primária gerada automaticamente pelo MongoDB */
    const token = gerarToken(novoUsuario._id);

    res.status(201).json({
      status: 'success',
      token,
      informacoes: { user: novoUsuario }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/* Autentica o usuário com e-mail e senha, retornando um token JWT em caso de sucesso */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Ambos os campos são obrigatórios para prosseguir */
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, informe e-mail e senha' });
    }

    /*
      O campo password possui select: false no Model, por isso é necessário
      usar .select('+password') para trazê-lo explicitamente do banco.
    */
    const usuarioEncontrado = await User.findOne({ email }).select('+password');

    /* Verifica existência do usuário e valida a senha usando o método do Model */
    const senhaValida = usuarioEncontrado && (await usuarioEncontrado.compararSenha(password));

    if (!usuarioEncontrado || !senhaValida) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }

    const token = gerarToken(usuarioEncontrado._id);

    /* Oculta a senha antes de enviar os dados do usuário */
    usuarioEncontrado.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      informacoes: { usuario: usuarioEncontrado }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/* Lista todos os usuários cadastrados na coleção */
exports.listarUsuarios = async (req, res) => {
  try {
    /* .find() sem filtros retorna todos os documentos da coleção */
    const todos = await User.find();

    res.status(200).json({
      status: 'success',
      total: todos.length,
      informacoes: { usuarios: todos }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

/*
  Exclui a conta do usuário autenticado.
  Antes de remover o usuário, apaga todos os comentários de sua autoria
  para evitar registros órfãos no banco de dados.
*/
exports.encerrarConta = async (req, res) => {
  try {
    const idAtual = req.user._id;

    /* Remoção em cascata: apaga os comentários antes de excluir o usuário */
    await Comentario.deleteMany({ autor: idAtual });
    await User.findByIdAndDelete(idAtual);

    res.status(200).json({
      status: 'success',
      message: 'Sua conta foi encerrada com sucesso. (comentários também removidos)'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Falha ao encerrar a conta: ' + err.message
    });
  }
};

/* Permite que o usuário autenticado troque sua senha atual por uma nova */
exports.trocarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    /*
      É necessário usar .select('+password') pois o campo tem select: false no Model,
      o que o oculta por padrão em todas as consultas.
    */
    const usuarioLogado = await User.findById(req.user._id).select('+password');

    /* Verifica se a senha informada confere com a armazenada */
    const senhaConfere = await usuarioLogado.compararSenha(senhaAtual);

    if (!senhaConfere) {
      return res.status(401).json({ message: 'Senha atual incorreta.' });
    }

    usuarioLogado.password = novaSenha;

    /*
      .save() é utilizado para acionar o hook de pré-salvamento do Mongoose,
      que aplica o hash (bcrypt) na nova senha antes de persistir.
    */
    await usuarioLogado.save();

    res.status(200).json({
      status: 'success',
      message: 'Senha atualizada com sucesso!'
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

/* Atualiza os dados do perfil do usuário (username, email e/ou bio) */
exports.editarPerfil = async (req, res) => {
  try {
    const { username, email, bio } = req.body;

    /* Monta dinamicamente o objeto apenas com os campos enviados na requisição */
    const dadosNovos = {};
    if (username) dadosNovos.username = username;
    if (email) dadosNovos.email = email;
    if (bio) dadosNovos.bio = bio;

    /*
      findByIdAndUpdate recebe:
        1º - ID do documento a ser localizado
        2º - Campos que serão sobrescritos
        3º - Opções:
              new          → retorna o documento já com os dados atualizados
              runValidators → reaplica as validações definidas no Schema
    */
    const perfilAtualizado = await User.findByIdAndUpdate(
      req.user._id,
      dadosNovos,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { user: perfilAtualizado }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};