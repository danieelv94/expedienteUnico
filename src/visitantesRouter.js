// visitantesRouter.js
import express from "express";
import { registrarVisitante, obtenerVisitantes } from './visitantesController.js';
import { verificarAutenticacion } from './middleware.js'; // Importa el middleware de autenticación

const visitantesRouter = express.Router();

// Ruta para registrar un visitante (protegida por autenticación)
visitantesRouter.post("/visitantes", verificarAutenticacion, registrarVisitante);

// Ruta para obtener todos los visitantes (protegida por autenticación)
visitantesRouter.get("/visitantes", verificarAutenticacion, obtenerVisitantes);

export default visitantesRouter;