import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

//función que obtiene todos los proyectos de un usuario
const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    '$or' : [
      {'colaboradores': {$in: req.usuario}},
      {'creador': {$in: req.usuario}},
    ],
  }).select('-tareas');
  res.json(proyectos);
};

//función que crea un nuevo proyecto
const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  //envía la información al servidor para guardar el nuevo proyecto
  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

//función que obtiene un proyecto por ID de proyecto
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  const valid = mongoose.Types.ObjectId.isValid(id);
  if(!valid) {
    const error = new Error("No es un proyecto válido");
    return res.status(404).json({msg: error.message});
  }

  const proyecto = await Proyecto.findById(id).populate({path: 'tareas', 
  populate: {path: 'completado', select: "nombre"},})
  .populate("colaboradores", "nombre email");
  //verifica que el proyecto exista
  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({msg: error.message});
  }

  //verifica que el ID usuario sea igual al ID del creador del proyecto
  if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())) {
    const error = new Error("Acción no válida");
    return res.status(401).json({msg: error.message});
  }
  
  res.json(
    proyecto
  );
};

//editar un proyecto
const editarProyecto = async (req, res) => {
  const { id } = req.params;

  const valid = mongoose.Types.ObjectId.isValid(id);
  if(!valid) {
    const error = new Error("No es un proyecto válido");
    return res.status(404).json({msg: error.message});
  }

  const proyecto = await Proyecto.findById(id);
  //verifica que el proyecto exista
  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({msg: error.message});
  }

  //verifica que el ID usuario sea igual al ID del creador del proyecto
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({msg: error.message});
  }
  //si el usuario no envía todos los datos, usa los de la BD
  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  //si paso las validaciones previas, modificamos la BD
  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

//eliminar proyecto
const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  const valid = mongoose.Types.ObjectId.isValid(id);
  if(!valid) {
    const error = new Error("No es un proyecto válido");
    return res.status(404).json({msg: error.message});
  }

  const proyecto = await Proyecto.findById(id);
  //verifica que el proyecto exista
  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({msg: error.message});
  }

  //verifica que el ID usuario sea igual al ID del creador del proyecto
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({msg: error.message});
  }

  //si paso las validaciones previas, eliminamos el proyecto
  try {
    await proyecto.deleteOne();
    res.json({msg: "Proyecto Eliminado"});
  } catch (error) {
    console.log(error)
  }
};

//buscar colaborador
const buscarColaborador = async (req, res) => {
  const {email} = req.body;
  
  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');

  //verificamos si existe
  if(!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({msg: error.message});
  }
  res.json(usuario);
};

//agregar colaboradores
const agregarColaboradores = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);
  

  if(!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({msg: error.message});
  };

  //se válida que quien agrega colaborador sea el creador del proyecto
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({msg: error.message});
  };

  const {email} = req.body;
  
  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');

  //verificamos si existe
  if(!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({msg: error.message});
  };

  //evitar que el admin del proyecto se agregue como colaborador
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("El creador del proyecto no puede ser colaborador");
    return res.status(404).json({msg: error.message});
  };

  //revisar que el colaborador no este ya agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El usuario ya fue agregado al proyecto");
    return res.status(404).json({msg: error.message});
  };

  //si paso las validaciones se agrega
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({msg: "Colaborador agregado correctamente"});
};

//eliminar un colaborador
const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);
  

  if(!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({msg: error.message});
  };

  //se válida que quien agrega colaborador sea el creador del proyecto
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({msg: error.message});
  };
  //si pasa las validaciones, se elimina el colaborador
  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({msg: "Colaborador eliminado correctamente"});
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaboradores,
  eliminarColaborador
}