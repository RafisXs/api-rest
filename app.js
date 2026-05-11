require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');
const comentarioRoutes = require('./src/routes/comentarioRoutes');

const app = express();

/*
  Habilita o parsing de JSON no corpo das requisições.
  Sem isso, req.body chegaria como undefined nos controllers.
*/
app.use(express.json());

/*
  Conexão com o MongoDB via Mongoose.

  A string de conexão (MONGODB_URI) deve estar no arquivo .env no formato:
    MONGODB_URI=mongodb://127.0.0.1:27017/nome-do-banco
  
  Para visualizar os dados no MongoDB Compass:
    1. Abra o MongoDB Compass
    2. Cole a mesma MONGODB_URI no campo de conexão
    3. Clique em "Connect" — o banco e as coleções aparecerão automaticamente
*/
const iniciarConexao = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔ Conectado ao banco de dados MongoDB com sucesso');
  } catch (err) {
    console.error('✘ Falha ao conectar com o banco de dados:', err.message);
    process.exit(1); /* Encerra o processo caso o banco não esteja disponível */
  }
};

iniciarConexao();

/*
  Registro das rotas da aplicação.
  Cada prefixo agrupa as rotas do respectivo módulo:
    /api/users       → operações de usuário (cadastro, login, perfil...)
    /api/comentarios → operações de comentário (criar, listar, editar...)
*/
app.use('/api/users', userRoutes);
app.use('/api/comentarios', comentarioRoutes);

/* Usa a porta definida no .env ou a 3000 como fallback */
const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`✔ Servidor rodando em http://localhost:${PORTA}`);
});