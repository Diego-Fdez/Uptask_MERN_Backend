import express from "express";
const router = express.Router();

import { 
  registrar, 
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";

//Auth, registro y confirmación de usuarios
router.post("/", registrar); //registrar usuario
router.post("/login", autenticar); //login de usuarios
router.get("/confirmar/:token", confirmar);//confirma el usuario
router.post("/forgetpwd", olvidePassword); //recuperar password
router.get("/forgetpwd/:token", comprobarToken); //comprueba el token
router.post("/forgetpwd/:token", nuevoPassword); //crea nuevo password

router.get("/perfil", checkAuth, perfil); //verifica si el usuario esta registrado

export default router;