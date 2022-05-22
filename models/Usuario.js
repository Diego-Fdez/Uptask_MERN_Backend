import mongoose from "mongoose";
import bcrypt from "bcrypt";

//schema para crear la tabla en el BD
const usuarioSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  token: {
    type: String,
  },
  confirmado: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

//función que encripta el password del usuario
usuarioSchema.pre('save', async function(next) {
  //revisa que el password no haya sido hasheado anteriormente
  if(!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//comprobar el password
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;