import mongoose from "mongoose";

const proyectoSchema = mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    required: true,
  },
  descripcion: {
    type: String,
    trim: true,
    required: true,
  },
  fechaEntrega: {
    type: Date,
    default: Date.now(),
  },
  cliente: {
    type: String,
    trim: true,
    required: true,
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId, //relaciona con el usuario registrado
    ref: "Usuario", //nombre de la tabla en la DB 
  },
  tareas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tarea",
    },
  ],
  colaboradores: [
    {
      type: mongoose.Schema.Types.ObjectId, //relaciona con el usuario registrado
      ref: "Usuario", //nombre de la tabla en la DB 
    },
  ],
}, {
  timestamps: true, //guarda cuando fue creada o actualizada la tabla
});

const Proyecto = mongoose.model('Proyecto', proyectoSchema);
export default Proyecto;