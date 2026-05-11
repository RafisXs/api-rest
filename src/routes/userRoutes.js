const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControler');
const autenticacaoMiddleware = require('../middlewares/autenticacaoMiddleware');

/*
  Rota pública para registro de um novo usuário.
  POST http://localhost:3000/api/users/cadastro
*/
router.post('/cadastro', userController.cadastro);

/*
  Rota pública para autenticação do usuário.
  Retorna um token JWT em caso de credenciais válidas.
  POST http://localhost:3000/api/users/login
*/
router.post('/login', userController.login);

/*
  Rota pública para listagem de todos os usuários cadastrados.
  GET http://localhost:3000/api/users/listar
*/
router.get('/listar', userController.listarUsuarios);

/*
  Rota protegida para encerramento da conta do usuário autenticado.
  Remove também todos os comentários vinculados ao usuário.
  DELETE http://localhost:3000/api/users/encerrar-conta
*/
router.delete('/encerrar-conta', autenticacaoMiddleware.verificarToken, userController.encerrarConta);

/*
  Rota protegida para troca de senha do usuário autenticado.
  Exige o envio da senha atual para validação antes de aplicar a nova.
  PATCH http://localhost:3000/api/users/trocar-senha
*/
router.patch('/trocar-senha', autenticacaoMiddleware.verificarToken, userController.trocarSenha);

/*
  Rota protegida para atualização dos dados de perfil do usuário autenticado.
  Permite alterar username, e-mail e/ou bio.
  PATCH http://localhost:3000/api/users/editar-perfil
*/
router.patch('/editar-perfil', autenticacaoMiddleware.verificarToken, userController.editarPerfil);

module.exports = router;