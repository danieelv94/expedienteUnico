import pool from "./db.js";
import obraController from './obraController.js'; 



const { obtenerDetallesObra } = obraController;

export const mostrarVentanillaUnica = async (req, res) => {
    console.log("Ejecutando mostrarVentanillaUnica");
    if (req.session.user.rol !== 'Ventanilla') {
        return res.status(403).send('No tienes permiso para acceder a esta página');
    }
    try {
        const documentos = await obtenerDocumentos(); 
        res.render("pages/ventanilla-unica", { documentos, req: req }); 
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

export const registrarObra = async (req, res) => {
    if (req.session.user.rol !== 'Ventanilla') {
        return res.status(403).send('No tienes permiso para acceder a esta página');
    }
    try {
        const { nombre_obra, descripcion_obra } = req.body;

        // Insertar la obra en la tabla 'obras'
        const [result] = await pool.query(
            "INSERT INTO obras (nombre_obra, descripcion_obra, created_at) VALUES (?, ?, ?)",
            [nombre_obra, descripcion_obra, new Date()]
        );
        const obraId = result.insertId; 

        // Registrar el estado de los documentos
        const todosDocumentos = await obtenerDocumentos(); // Obtener todos los documentos

        for (const documento of todosDocumentos) {  // Iterar sobre todos los documentos
            const entregado = req.body.documentos && req.body.documentos.includes(documento.id.toString()); // Verificar si el documento fue seleccionado
            const observacionesKey = `observaciones_${documento.id}`;
            const observaciones = req.body[observacionesKey] || '';
            
            await pool.query(
                "INSERT INTO obras_documentos (obra_id, documento_id, entregado, observaciones) VALUES (?, ?, ?, ?)",
                [obraId, documento.id, entregado, observaciones]
            );
        }

        res.redirect(`/gestionar-documentacion/${obraId}`); 
    } catch (error) {
        console.error("Error al registrar la obra:", error);
        res.status(500).json({ error: "Error al registrar la obra" });
    }
};

export const gestionarDocumentacion = async (req, res) => {
    if (req.session.user.rol !== 'Ventanilla') {
        return res.status(403).send('No tienes permiso para acceder a esta página');
    }
    try {
        const obraId = req.params.id;
        const obra = await obtenerDetallesObra(obraId); 

        // Obtener los documentos de la obra desde la tabla `obras_documentos`
        const [documentosRows] = await pool.query(`
            SELECT d.id, d.nombre, od.entregado, od.observaciones
            FROM documentos d
            LEFT JOIN obras_documentos od ON d.id = od.documento_id
            WHERE od.obra_id = ?
        `, [obraId]);
        obra.documentos = documentosRows;

        res.render("pages/gestionar-documentacion", { obra, req: req }); 
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

export const actualizarObservaciones = async (req, res) => {
    if (req.session.user.rol !== 'Ventanilla') {
        return res.status(403).send('No tienes permiso para acceder a esta página');
    }
    try {
        const obraId = req.params.id;
        const { documento_id, observaciones } = req.body;
  
        
        await pool.query(
            "UPDATE obras_documentos SET observaciones = ?, entregado = 1 WHERE obra_id = ? AND documento_id = ?", // <-- Agrega "entregado = 1"
            [observaciones, obraId, documento_id]
        );
  
        res.redirect(`/gestionar-documentacion/${obraId}`);
    } catch (error) {
        console.error("Error al actualizar observaciones:", error);
        res.status(500).json({ error: "Error al actualizar observaciones" });
    }
  };

export const obtenerDocumentos = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM documentos");
        return rows;
    } catch (error) {
        console.error("Error al obtener Documentos:", error);
        throw { status: 500, message: "Error al obtener Documentos" };
    }
};

export const listarObrasVentanilla = async (req, res) => {
    if (req.session.user.rol !== 'Ventanilla') {
        return res.status(403).send('No tienes permiso para acceder a esta página');
    }
    try {
        const [obras] = await pool.query("SELECT * FROM obras");

        // Calcular el estado de la documentación (esto es un ejemplo, 
        // deberás adaptarlo a tu lógica)
        for (const obra of obras) {
          const [documentosRows] = await pool.query(
            "SELECT entregado FROM obras_documentos WHERE obra_id = ?",
            [obra.id_obra]
          );
          const todosEntregados = documentosRows.every(doc => doc.entregado);
          const algunosEntregados = documentosRows.some(doc => doc.entregado);

          if (todosEntregados) {
            obra.estado_documentacion = 'completo';
          } else if (algunosEntregados) {
            obra.estado_documentacion = 'incompleto';
          } else {
            obra.estado_documentacion = 'pendiente';
          }
        }

        res.render("pages/listar-obras-ventanilla", { obras, req: req }); 
    } catch (error) {
        console.error("Error al obtener las obras:", error);
        res.status(500).json({ error: "Error al obtener las obras" });
    }
};

export default { // <-- Agrega esta línea para exportar un objeto por defecto
    mostrarVentanillaUnica, 
  registrarObra, 
  gestionarDocumentacion,
  actualizarObservaciones,
  obtenerDocumentos,
  listarObrasVentanilla
  }; 