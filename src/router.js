import express from "express";
import { 
    mostrarLogin, 
    procesarLogin, 
    mostrarRegistro, 
    procesarRegistro, 
    cerrarSesion 
} from './authController.js'; // Importa las funciones desde authController.js

import { 
  mostrarUsuarios, 
  agregarObra, 
  obtenerDetallesObraUpdate, 
  obtenerDetallesObra, 
  actualizarObra, 
  eliminarObra 
} from './userController.js';

import { verificarAutenticacion } from './middleware.js'; // Importa el middleware

const router = express.Router();

router.get("/login", mostrarLogin);
router.post("/login", procesarLogin);
router.get("/register", mostrarRegistro);
router.post("/register", procesarRegistro);
router.get("/logout", cerrarSesion);

// Usa el middleware para proteger la ruta de usuarios
router.get("/usuarios", verificarAutenticacion, mostrarUsuarios);

// Rutas para detalles y actualización de Obras
router.get("/detalles/:id", async (req, res) => {
  try {
    const obra = await obtenerDetallesObra(req.params.id);
    res.render("pages/detalles_obra", { obra });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});


//crear obras
router.post("/obras", async (req, res) => {
  try {
    const { nombre_usuario, email_usuario, curso_alumno } = req.body;

    await agregarObra({
      nombre_obra: nombre_usuario, 
      descripcion_obra: email_usuario, 
      fecha_inicio: curso_alumno
    });
    
    res.redirect("/usuarios");  // Redirige a la lista de obras después de agregar la nueva obra
  } catch (error) {
    res.status(500).json({ error: "Error al agregar la obra" });
  }
});


router.get("/formulario-actualizar-obra/:id", verificarAutenticacion, async (req, res) => {
  try {
    const obra = await obtenerDetallesObraUpdate(req.params.id);
    res.render("pages/update_obra", { obra });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/actualizar-obra/:id", verificarAutenticacion, async (req, res) => {
  try {
    await actualizarUsuarios(req.params.id, req.body);
    res.redirect("/usuarios");
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/borrar-estudiante/:id", verificarAutenticacion, async (req, res) => {
  try {
    await eliminarObra(req.params.id);
    res.redirect("/usuarios");
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Ruta para cerrar sesión
router.get("/logout", cerrarSesion);

export default router;
