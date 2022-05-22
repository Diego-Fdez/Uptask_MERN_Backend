import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

//Registra un usuario
const registrar = async (req, res) => {
  //Evitar registros duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({email});
  if(existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message});
  }

  //Si no existe lo registra
  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    await usuario.save();
    //enviar el email de confirmación
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    });
    
    res.json({msg: 'Usuario Creado Correctamente, revisa tu correo para confirmar la cuenta'});
  } catch (error) {
    console.log(error)
  }
};

//login del usuario
const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //comprobar si el usuario existe
  const usuario = await Usuario.findOne({email});
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({msg: error.message});
  }

  //comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(403).json({msg: error.message});
  }

  //comprobar su password
  if(await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("El Password es incorrecto");
    return res.status(403).json({msg: error.message});
  }
};

//confirma la creación del usuario
const confirmar = async (req, res) => {
  const {token} = req.params;
  const usuarioConfirmar = await Usuario.findOne({token});

  //devuelve mensaje si no existe el token
  if(!usuarioConfirmar) {
    const error = new Error("Token no válido");
    return res.status(403).json({msg: error.message});
  }

  //el token existe y confirmado pasa a true
  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = '';
    await usuarioConfirmar.save();
    res.json({msg: "Usuario Confirmado Correctamente"});
  } catch (error) {
    console.log(error);
  }
};

//función que recupera la contraseña
const olvidePassword = async (req, res) => {
  const {email} = req.body;
  //comprobar si el usuario existe
  const usuario = await Usuario.findOne({email});
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({msg: error.message});
  }

  //si el usuario existe
  try {
    usuario.token = generarId();
    await usuario.save();

    //enviar el email
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({msg: "Hemos enviado un email con las instrucciones de recuperación de cuenta"});
  } catch (error) {
    console.log(error)
  }
};

//función que comprueba el token
const comprobarToken = async (req, res) => {
  const {token} = req.params;
  const tokenValido = await Usuario.findOne({token});

  if (tokenValido) {
    res.json({msg: "Token válido y el usuario existe"});
  } else {
    const error = new Error("Token no válido");
    return res.status(404).json({msg: error.message});
  }
};

//crea un nuevo password
const nuevoPassword = async (req, res) => {
  const {token} = req.params;
  const {password} = req.body;

  //comprueba el token
  const usuario = await Usuario.findOne({token});

  if (usuario) {
    usuario.password = password;
    usuario.token = '';
    try {
      await usuario.save();
      res.json({msg: "Contraseña Modificada Correctamente"});
    } catch (error) {
      console.log(error);
    }
    
  } else {
    const error = new Error("Token no válido");
    return res.status(404).json({msg: error.message});
  };

};

//usuario autenticado
const perfil = async (req, res) => {
  const {usuario} = req;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil
};