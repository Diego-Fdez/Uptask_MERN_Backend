import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tareas.js";

//función que agrega tareas
const agregarTarea = async (req, res) => {
  const {proyecto} = req.body;
  const existeProyecto = await Proyecto.findById(proyecto);
  //comprueba si existe el proyecto asociado
  if(!existeProyecto) {
    const error = new Error("El Proyecto no existe");
    return res.status(404).json({msg: error.message});
  }
  //comprueba si la persona es parte del proyecto
  if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes permisos para añadir tareas");
    return res.status(403).json({msg: error.message});
  }

  //si las condiciones anteriores se cumplen...
  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    //Almacenar el ID del proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
  console.log(existeProyecto)
};

//función que obtiene tarea por ID
const obtenerTarea = async (req, res) => {
  const {id} = req.params;

  //verifica que sea un ID de tarea válido
  const valid = mongoose.Types.ObjectId.isValid(id);
  if(!valid) {
    const error = new Error("No es un ID de Tarea válido");
    return res.status(404).json({msg: error.message});
  }
  
  //consulta la tarea por ID en la BD
  const tarea = await Tarea.findById(id).populate("proyecto");
  //verifica que la tarea exista
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({msg: error.message});
  }

  //verifica que el creador es quien hace la consulta
  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({msg: error.message});
  }
  res.json(tarea);
};

//función que actualiza tareas
const actualizarTarea = async (req, res) => {
  const {id} = req.params;

  //verifica que sea un ID de tarea válido
  const valid = mongoose.Types.ObjectId.isValid(id);
  if(!valid) {
    const error = new Error("No es un ID de Tarea válido");
    return res.status(404).json({msg: error.message});
  }
  
  //consulta la tarea por ID en la BD
  const tarea = await Tarea.findById(id).populate("proyecto");
  //verifica que la tarea exista
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({msg: error.message});
  }

  //verifica que el creador es quien hace la consulta
  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({msg: error.message});
  }

  //si el usuario no envía todos los datos, se usan los que ya están almacenados
  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  //si las condiciones anteriores se cumplen, modifica la tarea
  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error)
  }
};

//elimina tarea
const eliminarTarea = async (req, res) => {
  const {id} = req.params;

  //verifica que sea un ID de tarea válido
  const valid = mongoose.Types.ObjectId.isValid(id);
  if(!valid) {
    const error = new Error("No es un ID de Tarea válido");
    return res.status(404).json({msg: error.message});
  }
  
  //consulta la tarea por ID en la BD
  const tarea = await Tarea.findById(id).populate("proyecto");
  //verifica que la tarea exista
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({msg: error.message});
  }

  //verifica que el creador es quien hace la consulta
  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({msg: error.message});
  }

  //si paso las validaciones previas, eliminamos el proyecto
  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);

    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);
    res.json({msg: "Tarea Eliminada correctamente"});
  } catch (error) {
    console.log(error)
  }
};

//cambia el estado de la tarea
const cambiarEstado = async (req, res) => {
  const {id} = req.params;

  //verifica que sea un ID de tarea válido
  const valid = mongoose.Types.ObjectId.isValid(id);
  if(!valid) {
    const error = new Error("No es un ID de Tarea válido");
    return res.status(404).json({msg: error.message});
  }
  
  //consulta la tarea por ID en la BD
  const tarea = await Tarea.findById(id).populate("proyecto").populate('completado');
  //verifica que la tarea exista
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({msg: error.message});
  };
  if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && 
  !tarea.proyecto.colaboradores.some(
    (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
  )) {
    const error = new Error("Acción no válida");
    return res.status(403).json({msg: error.message});
  }
  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();
  const tareaAlmacenada = await Tarea.findById(id)
  .populate("proyecto").populate("completado");
  res.json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado
};