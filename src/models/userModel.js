const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

perfilSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

perfilSchema.methods.compararSenha = async function (senhaInformada) {
  return bcrypt.compare(senhaInformada, this.password);
};

const User = mongoose.model('User', perfilSchema);

module.exports = User;