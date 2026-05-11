const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

/*
  Rota para criação de um novo comentário.
  Requer autenticação via token JWT.
  POST http://localhost:3000/api/comentarios/novo
*/
router.post('/novo', autenticacaoMiddleware.verificarToken, comentarioController.criarComentario);

/*
  Rota pública para listagem de todos os comentários cadastrados.
  GET http://localhost:3000/api/comentarios/listar
*/
router.get('/listar', comentarioController.listarComentarios);

/*
  Rota para remoção de um comentário pelo ID informado na URL.
  Requer autenticação — apenas o autor pode remover o próprio comentário.
  DELETE http://localhost:3000/api/comentarios/remover/:id
*/
router.delete('/remover/:id', autenticacaoMiddleware.verificarToken, comentarioController.removerComentario);

/*
  Rota para atualização parcial de um comentário pelo ID informado na URL.
  Requer autenticação — apenas o autor pode editar o próprio comentário.
  PATCH http://localhost:3000/api/comentarios/atualizar/:id
*/
router.patch('/atualizar/:id', autenticacaoMiddleware.verificarToken, comentarioController.atualizarComentario);

module.exports = router;