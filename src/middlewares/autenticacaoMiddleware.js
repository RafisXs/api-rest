const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/*
  Middleware de autenticação via JWT.
  Intercepta a requisição, extrai e valida o token antes de liberar
  o acesso às rotas protegidas.
*/
/**
 * Verifica o token JWT enviado no header Authorization.
 *
 * Quando o token e valido, busca o usuario correspondente e o disponibiliza
 * em req.user para os proximos middlewares e controllers da rota.
 *
 * @param {import('express').Request & { user?: import('mongoose').Document }} req - Requisicao HTTP com header Authorization.
 * @param {import('express').Response} res - Resposta HTTP usada em falhas de autenticacao.
 * @param {import('express').NextFunction} next - Callback que libera a proxima etapa da rota.
 * @returns {Promise<void>}
 */
exports.verificarToken = async (req, res, next) => {
  try {
    let tokenRecebido;

    /*
      O token deve ser enviado no header Authorization no formato:
        Authorization: Bearer <token>
      O startsWith garante que só processa headers com esse padrão.
    */
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      /*
        O split(' ') transforma "Bearer TOKEN" em ["Bearer", "TOKEN"],
        e o índice [1] captura apenas o valor do token.
      */
      tokenRecebido = authHeader.split(' ')[1];
    }

    /* Bloqueia a requisição caso nenhum token tenha sido enviado */
    if (!tokenRecebido) {
      return res.status(401).json({ message: 'Acesso negado: nenhum token informado.' });
    }

    /*
      jwt.verify decodifica e valida o token usando o segredo do .env.
      Se o token estiver expirado ou adulterado, um erro é lançado
      e a execução cai direto no bloco catch.
      O objeto retornado contém o payload original, incluindo o id do usuário.
    */
    const payload = jwt.verify(tokenRecebido, process.env.JWT_SECRET);

    /* Busca o usuário no banco pelo id extraído do payload */
    const usuarioAtual = await User.findById(payload.id);

    if (!usuarioAtual) {
      return res.status(401).json({ message: 'Usuário vinculado ao token não encontrado.' });
    }

    /*
      Disponibiliza o usuário autenticado em req.user para que os
      controllers seguintes possam acessá-lo sem nova consulta ao banco.
    */
    req.user = usuarioAtual;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
