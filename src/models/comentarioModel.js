const mongoose = require('mongoose');

/*
  Schema que define a estrutura de um comentário no banco de dados.
  Cada comentário é vinculado a um usuário pelo campo autor (referência por ObjectId).
*/
const registroSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'O comentário precisa ter um título'],
      trim: true
    },
    conteudo: {
      type: String,
      required: [true, 'O conteúdo do comentário não pode estar vazio'],
      trim: true
    },
    autor: {
      /* ObjectId armazena a referência ao documento do usuário criador */
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', /* Nome do Model de usuário utilizado para população da referência */
      required: [true, 'ID do autor não localizado']
    },
    nomeAutor: {
      type: String,
      required: [true, 'Nome do autor não localizado']
    }
  },
  {
    /* timestamps adiciona automaticamente os campos createdAt e updatedAt */
    timestamps: true
  }
);

module.exports = mongoose.model('Comentario', registroSchema);