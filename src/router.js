import express from "express";
const router = express.Router(); // Inicializar router aquí
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
  subirFotos,
  handleSubirFotos,
  registrarCheckInDocumentacion
} = obraController;

import { verificarAutenticacion } from './middleware.js'; 
import ventanillaController from './ventanillaController.js'; 

import avanceController from './avanceController.js'; 
const { 
    mostrarAvances, 
    obtenerObrasAvance, 
    obtenerInformacionObra, 
    obtenerFuentesFinanciamiento, 
    mostrarEditarAvance,
    guardarAvance 
} = avanceController;

const { 
  registrarObra, 
  gestionarDocumentacion,
  actualizarObservaciones,
} = ventanillaController;

import graficasController from './graficasController.js';
const { mostrarGraficas, obtenerDatosGrafica, obtenerObrasAvancePorFuente } = graficasController;

import superAdminController from './superAdminController.js';
const { mostrarSuperAdmin, guardarRolesUsuario } = superAdminController;
import { obtenerRolesUsuario } from './authController.js'; // Importar la función aquí

router.post('/eliminar-roles-usuario/:id', verificarAutenticacion, superAdminController.eliminarRolesUsuario);
router.get('/obtener-roles-usuario/:id', verificarAutenticacion, async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const rolesUsuario = await obtenerRolesUsuario(usuarioId); // Asegúrate de tener esta función en authController.js
    res.json(rolesUsuario);
  } catch (error) {
    console.error("Error al obtener roles del usuario:", error);
    res.status(500).json({ error: "Error al obtener roles del usuario" });
  }
});

router.post('/eliminar-roles-usuario/:id', verificarAutenticacion, superAdminController.eliminarRolesUsuario);
import residentesController from './residentesController.js'; // 

router.get('/obtener-residentes', verificarAutenticacion, async (req, res) => {
  try {
    const residentes = await avanceController.obtenerResidentes();
    res.json(residentes);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
router.get('/residentes', verificarAutenticacion, residentesController.mostrarObrasAsignadas);
router.get('/modificar-avance-fisico/:id', verificarAutenticacion, residentesController.modificarAvanceFisico);
router.post('/guardar-avance-fisico/:id', verificarAutenticacion, residentesController.guardarAvanceFisico);

router.get('/super-admin', verificarAutenticacion, mostrarSuperAdmin);
router.post('/guardar-roles-usuario/:id', verificarAutenticacion, guardarRolesUsuario);




// Rutas de autenticación
router.get("/login", mostrarLogin);
router.post("/login", procesarLogin);
router.get("/register", mostrarRegistro);
router.post("/register", procesarRegistro);

// Ruta para obras, protegida por el middleware
router.get("/obras", verificarAutenticacion, (req, res) => {
    filtrarObras(req, res); 
});

// Rutas para detalles y actualización de Obras
router.get("/detalles/:id", verificarAutenticacion, async (req, res) => {
  try {
    const obra = await obtenerDetallesObra(req.params.id);
    res.render("pages/detalles_obra", { obra });
  } catch (error) {
    console.error("Error en la ruta /detalles/:id:", error); 
    res.status(error.status || 500).json({ error: error.message }); 
  }
});

// Ruta para la vista de "Mis Obras"
router.get('/mis-obras', verificarAutenticacion, async (req, res) => {
  // Verificar si el usuario tiene el rol 'DIVA'
  if (!req.session.roles || !req.session.roles.includes('DIVA')) { 
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

// Ruta para formulario de actualizar obra
router.get('/formulario-actualizar-obra/:id', verificarAutenticacion, async (req, res) => {
  try {
      const { obra, divas } = await obtenerDetallesObraUpdate(req.params.id); 
      res.render('pages/update_obra', { obra, divas }); 
  } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
  }
});

// Actualizar obra
router.post("/actualizar-obra/:id", verificarAutenticacion, async (req, res) => {
  try {
    await actualizarObra(req.params.id, req.body);
    res.redirect("/obras");
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Eliminar obra
router.post("/borrar-obra/:id", verificarAutenticacion, async (req, res) => {
  try {
    await eliminarObra(req.params.id);
    res.redirect("/obras");
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Ruta para la vista de check-in de obra
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

// Ruta para subir fotos
router.post('/subir-fotos/:id', verificarAutenticacion, subirFotos, handleSubirFotos);

//Rutas para ventanilla Unica
router.get("/ventanilla-unica", verificarAutenticacion, ventanillaController.mostrarVentanillaUnica); 
router.post("/registrar-obra", verificarAutenticacion, ventanillaController.registrarObra);
router.get("/gestionar-documentacion/:id", verificarAutenticacion, ventanillaController.gestionarDocumentacion);
router.post("/actualizar-observaciones/:id", verificarAutenticacion, ventanillaController.actualizarObservaciones);
router.get("/listar-obras-ventanilla", verificarAutenticacion, ventanillaController.listarObrasVentanilla);

// Ruta para la vista de avances (para rol "AVANCE")
router.get('/avance', verificarAutenticacion, async (req, res) => {
  try {
    const obras = await obtenerObrasAvance();
    const fuentesFinanciamiento = await obtenerFuentesFinanciamiento();
    res.render("pages/avance", { obras, fuentesFinanciamiento, req: req });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}); 

// Ruta para obtener la información de la obra por AJAX
router.get('/obtener-informacion-obra/:nombre', verificarAutenticacion, async (req, res) => {
  try {
    const nombreObra = req.params.nombre;
    const informacionObra = await obtenerInformacionObra(nombreObra);
    res.json(informacionObra);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Ruta para obtener las obras por fuente de financiamiento
router.get('/obtener-obras-avance-por-fuente/:fuente', verificarAutenticacion, async (req, res) => {
  try {
    const fuente = req.params.fuente;
    const obras = await obtenerObrasAvancePorFuente(fuente);
    res.json(obras);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Ruta para la vista de editar avances (para rol "Admin AVANCE")
router.get('/editar-avance', verificarAutenticacion, mostrarEditarAvance);

// Ruta para guardar los cambios en la información de la obra
router.post('/guardar-avance/:nombre', verificarAutenticacion, guardarAvance);

// Ruta para cerrar sesión
router.get("/logout", cerrarSesion);

// Ruta para la vista de gráficas
router.get('/graficas', verificarAutenticacion, mostrarGraficas);

// Ruta para obtener los datos de la gráfica (con filtro opcional)
router.get('/obtener-datos-grafica/:fuente?/:obra?', verificarAutenticacion, async (req, res) => {
  try {
    const fuente = req.params.fuente || null;
    const obra = req.params.obra || null;
    const datosGrafica = await obtenerDatosGrafica(fuente, obra);
    res.json(datosGrafica);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});



export default router;