const Comentario = require('../models/comentarioModel');

/*
  Valida se o usuário autenticado é o autor do comentário.
  Lança um erro 403 caso não seja o proprietário.
*/
/**
 * Valida se o usuario autenticado e o autor do comentario.
 *
 * @param {import('mongoose').Document & { autor: import('mongoose').Types.ObjectId }} comentario - Comentario encontrado no banco.
 * @param {import('mongoose').Types.ObjectId|string} idRequisitante - ID do usuario autenticado.
 * @throws {Error} Erro com statusCode 403 quando o usuario nao e proprietario.
 * @returns {void}
 */
const validarProprietario = (comentario, idRequisitante) => {
  if (!comentario.autor.equals(idRequisitante)) {
    const erro = new Error('Acesso negado: você não tem permissão para esta ação');
    erro.statusCode = 403;
    throw erro;
  }
};

/* Cria um novo comentário vinculado ao usuário autenticado via middleware */
/**
 * Cria um comentario para o usuario autenticado.
 *
 * @param {import('express').Request & { user: import('mongoose').Document & { username: string } }} req - Requisicao com titulo, conteudo e usuario autenticado.
 * @param {import('express').Response} res - Resposta HTTP com o comentario criado.
 * @returns {Promise<void>}
 */
exports.criarComentario = async (req, res) => {
  try {
    const { titulo, conteudo } = req.body;

    /* Os campos autor e nomeAutor são preenchidos automaticamente pelo middleware de autenticação */
    const registro = await Comentario.create({
      titulo,
      conteudo,
      autor: req.user._id,
      nomeAutor: req.user.username
    });

    res.status(201).json({
      status: 'success',
      informacoes: { comentario: registro }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

/* Retorna todos os comentários cadastrados, ocultando o campo interno __v do MongoDB */
/**
 * Lista todos os comentarios cadastrados.
 *
 * @param {import('express').Request} req - Requisicao HTTP recebida pela rota.
 * @param {import('express').Response} res - Resposta HTTP com a lista de comentarios.
 * @returns {Promise<void>}
 */
exports.listarComentarios = async (req, res) => {
  try {
    /* O select('-__v') remove o campo de versão interno gerado pelo Mongoose */
    const lista = await Comentario.find().select('-__v');

    res.status(200).json({
      status: 'success',
      total: lista.length,
      informacoes: { comentarios: lista }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

/* Remove um comentário pelo ID informado na URL, após verificar autoria */
/**
 * Remove um comentario do usuario autenticado.
 *
 * @param {import('express').Request & { user: import('mongoose').Document }} req - Requisicao com id do comentario nos parametros.
 * @param {import('express').Response} res - Resposta HTTP com o resultado da remocao.
 * @returns {Promise<void>}
 */
exports.removerComentario = async (req, res) => {
  try {
    /* Busca o comentário pelo id presente nos parâmetros da rota */
    const encontrado = await Comentario.findById(req.params.id);

    if (!encontrado) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    /* Garante que apenas o autor pode excluir o próprio comentário */
    validarProprietario(encontrado, req.user._id);

    await Comentario.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Comentário removido com sucesso.'
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

/* Atualiza título e/ou conteúdo de um comentário existente */
/**
 * Atualiza titulo e/ou conteudo de um comentario do usuario autenticado.
 *
 * @param {import('express').Request & { user: import('mongoose').Document }} req - Requisicao com id nos parametros e dados no corpo.
 * @param {import('express').Response} res - Resposta HTTP com o comentario atualizado.
 * @returns {Promise<void>}
 */
exports.atualizarComentario = async (req, res) => {
  try {
    const { titulo, conteudo } = req.body;

    /* Localiza o registro original para validar a autoria antes de qualquer alteração */
    const original = await Comentario.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    validarProprietario(original, req.user._id);

    /*
      findByIdAndUpdate recebe:
        1º - ID do documento a ser localizado
        2º - Campos que serão sobrescritos
        3º - Opções:
              new          → retorna o documento já com os dados atualizados
              runValidators → reaplica as validações definidas no Schema
    */
    const atualizado = await Comentario.findByIdAndUpdate(
      req.params.id,
      { titulo, conteudo },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { comentario: atualizado }
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: 'fail', message: err.message });
  }
};
