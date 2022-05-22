import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
import cors from "cors";

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

//configurar cors
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function(origin, callback) {
    if(whitelist.includes(origin)) {
      //Puede consultar la API
      callback(null, true);
    } else {
      //No esta Permitido
      callback(new Error("Error de Cors"));
    }
  }
};

app.use(cors(corsOptions));

//Routing
app.use("/api/usuarios", usuarioRoutes); 
app.use("/api/proyectos", proyectoRoutes); 
app.use("/api/tareas", tareaRoutes); 

const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//Socket.io
import {Server} from 'socket.io';

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on('connection', (socket) => {

  //definir los eventos de socket io
  socket.on('abrir proyecto', (proyecto) => {
    socket.join(proyecto);
  });

  //evento nueva tarea
  socket.on('nueva tarea', tarea => {
    socket.to(tarea.proyecto).emit('tarea agregada', tarea);
  });

  //evento de eliminar tarea
  socket.on('eliminar tarea', tarea => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit('tarea eliminada', tarea);
  });

  //evento de editar tarea
  socket.on('editar tarea', tarea => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit('tarea editada', tarea);
  });

  //evento de completar tarea
  socket.on('completar tarea', tarea => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit('tarea completada', tarea);
  });

});