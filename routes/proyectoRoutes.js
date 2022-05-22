import express from "express";
import {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaboradores,
  eliminarColaborador
} from "../controllers/proyectoController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/", checkAuth, obtenerProyectos); //obtiene los proyectos
router.post("/", checkAuth, nuevoProyecto); //obtiene los proyectos
router
  .route("/:id")
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto);

router.post('/colaboradores',  checkAuth, buscarColaborador);
router.post("/colaboradores/:id", checkAuth, agregarColaboradores);
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);

export default router;