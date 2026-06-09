const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema do perfil de usuario.
 *
 * Define os campos de cadastro, validacoes, normalizacao de texto e controle
 * de selecao da senha para evitar exposicao em consultas comuns.
 *
 * @type {mongoose.Schema}
 */
const perfilSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'O nome de usuário é obrigatório'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'O username deve ter pelo menos 3 caracteres']
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Informe um e-mail com formato válido']
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
      select: false
    },
    bio: {
      type: String,
      maxlength: 160,
      default: ''
    }
  },
  { timestamps: true }
);

/**
 * Gera o hash da senha antes de salvar o usuario.
 *
 * O hook roda apenas quando o campo password foi criado ou modificado.
 *
 * @this {mongoose.Document & { password: string, isModified(path: string): boolean }}
 * @returns {Promise<void>}
 */
perfilSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compara uma senha em texto puro com o hash armazenado no usuario.
 *
 * @param {string} senhaInformada - Senha enviada pelo usuario no login ou troca de senha.
 * @returns {Promise<boolean>} Verdadeiro quando a senha informada corresponde ao hash salvo.
 */
perfilSchema.methods.compararSenha = async function (senhaInformada) {
  return bcrypt.compare(senhaInformada, this.password);
};

/**
 * Model de usuarios da aplicacao.
 *
 * @type {mongoose.Model}
 */
const User = mongoose.model('User', perfilSchema);

module.exports = User;
