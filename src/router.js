import express from "express";
import { 
    mostrarLogin, 
    procesarLogin, 
    mostrarRegistro, 
    procesarRegistro, 
    cerrarSesion 
} from './authController.js'; 

import obraController from './obraController.js'; 

const { 
  mostrarObras, 
  agregarObra, 
  obtenerDetallesObraUpdate, 
  obtenerDetallesObra, 
  actualizarObra, 
  eliminarObra,
  filtrarObras,
  obtenerDivas,
  obtenerObrasAsignadasAUsuario,
  verificarAsignacionUsuario,
  subirFotos, // Configuración de Multer
  handleSubirFotos, // Manejador de subida de fotos
  registrarCheckInDocumentacion
} = obraController;

import { verificarAutenticacion } from './middleware.js'; 



const router = express.Router();

router.get("/login", mostrarLogin);
router.post("/login", procesarLogin);
router.get("/register", mostrarRegistro);
router.post("/register", procesarRegistro);
router.get("/logout", cerrarSesion);

// Ruta para obras, protegida por el middleware y pasando req a filtrarObras
router.get("/obras", verificarAutenticacion, (req, res) => {
    filtrarObras(req, res); 
});

// Rutas para detalles y actualización de Obras
router.get("/detalles/:id", async (req, res) => {
  try {
    const obra = await obtenerDetallesObra(req.params.id);
    res.render("pages/detalles_obra", { obra });
  } catch (error) {
    console.error("Error en la ruta /detalles/:id:", error); // Registrar el error en la consola
    res.status(error.status || 500).json({ error: error.message }); // Enviar una respuesta de error
  }
});


//crear obras
router.post("/obras", async (req, res) => {
  try {
    const { nombre_usuario, descripcion_obra, diva_asignada } = req.body;

    await agregarObra({
      nombre_obra: nombre_usuario, 
      descripcion_obra: descripcion_obra, 
      diva_asignada: diva_asignada
    });
    
    res.redirect("/obras"); 
  } catch (error) {
    res.status(500).json({ error: "Error al agregar la obra" });
    console.log()
  }
});

// Ruta para la vista de "Mis Obras" (protegida por middleware y solo para DIVA usuario)
router.get('/mis-obras', verificarAutenticacion, async (req, res) => {
  if (req.session.user.rol !== 'DIVA') {
      return res.status(403).send('No tienes permiso para acceder a esta página');
  }

  try {
      const usuarioId = req.session.user.id_usuario;
      const obrasAsignadas = await obtenerObrasAsignadasAUsuario(usuarioId); 
      res.render('pages/mis-obras', { obras: obrasAsignadas, req: req });
  } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
  }
});

router.get('/formulario-actualizar-obra/:id', async (req, res) => {
  try {
      const { obra, divas } = await obtenerDetallesObraUpdate(req.params.id); 
      res.render('pages/update_obra', { obra, divas }); 
  } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/actualizar-obra/:id", verificarAutenticacion, async (req, res) => {
  try {
    await actualizarObra(req.params.id, req.body);
    res.redirect("/obras");
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/borrar-obra/:id", verificarAutenticacion, async (req, res) => {
  try {
    await eliminarObra(req.params.id);
    res.redirect("/obras");
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});



// Ruta para la vista de check-in de obra (protegida por middleware)
router.get('/check-in-obra/:id', verificarAutenticacion, async (req, res) => {
  try {
      const obra = await obtenerDetallesObra(req.params.id);
      const usuarioId = req.session.user.id_usuario; 

      const estaAsignado = await verificarAsignacionUsuario(obra.id_obra, usuarioId);
      if (!estaAsignado) {
          return res.status(403).send('No estás asignado a esta obra'); 
      }

      res.render('pages/check-in-obra', { obra, req: req });  
  } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
  }
});

// Ruta para subir fotos (protegida por middleware)
router.post('/subir-fotos/:id', verificarAutenticacion, subirFotos, handleSubirFotos);

router.post('/check-in-documentacion/:id', verificarAutenticacion, async (req, res) => {
  try {
    await registrarCheckInDocumentacion(req, res); 
  } catch (error) {
    console.error("Error al registrar check-in de documentación:", error);
    res.status(500).json({ error: "Error al registrar check-in de documentación" });
  }
});

// Ruta para cerrar sesión
router.get("/logout", cerrarSesion);

export default router;