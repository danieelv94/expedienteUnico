import pool from "./db.js";

export const mostrarAvances = async (req, res) => {
  if (req.session.user.rol !== 'AVANCE') {
    return res.status(403).send('No tienes permiso para acceder a esta página');
  }
  try {
    const obras = await obtenerObrasAvance();
    const fuentesFinanciamiento = await obtenerFuentesFinanciamiento();
    
    // Inicializar 'obra' con un objeto vacío o con valores por defecto
    let obra = { 
      monto_contrato: 0, 
      monto_anticipo: 0, 
      monto_est1: 0, 
      monto_est2: 0, 
      monto_est3: 0, 
      monto_est4: 0,
      monto_est5: 0,
      monto_est6: 0,
      monto_finiquito: 0,
    }; 

    if (obras.length > 0) {
      const nombreObra = obras[0].nombre_obra; 
      obra = await obtenerInformacionObra(nombreObra);
    }
    res.render("pages/avance", { 
      obras, 
      fuentesFinanciamiento, 
      obra: obra,
      req: req 
    });

  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const obtenerFuentesFinanciamiento = async () => {
    try {
      // Consulta para obtener las fuentes de financiamiento disponibles
      const [rows] = await pool.query(
        `SELECT DISTINCT fuente_financiamiento 
        FROM obras_avance`
      );
      return rows.map(row => row.fuente_financiamiento);
    } catch (error) {
      throw { status: 500, message: "Error al obtener fuentes de financiamiento" };
    }
  };
  
  export const obtenerObrasAvancePorFuente = async (fuente) => {
    try {
      // Consulta para obtener las obras de una fuente de financiamiento específica
      const [rows] = await pool.query(
        `SELECT nombre_obra 
        FROM obras_avance 
        WHERE fuente_financiamiento = ?`,
        [fuente]
      );
      return rows;
    } catch (error) {
      throw { status: 500, message: "Error al obtener Obras de Avance por fuente" };
    }
  };
  

  export const obtenerInformacionObra = async (nombreObra) => {
    try {
      // Consulta para obtener la información de la obra, incluyendo el porcentaje de avance y el residente
      const [rows] = await pool.query(
        `SELECT 
          oa.id,
          oa.check1_1, oa.check1_2, 
          oa.check2_1, oa.check2_2, 
          oa.check3_1, oa.check3_2, 
          oa.check4_1, oa.check4_2,
          oa.check5_1, oa.check5_2,
          oa.check6_1, oa.check6_2,
          oa.check7_1, oa.check7_2,
          oa.check8_1, oa.check8_2,
          oa.check9_1, oa.check9_2,
          oa.check10_1, oa.check10_2,
          oa.check11_1, oa.check11_2,
          oa.check12_1, oa.check12_2,
          oa.check13_1, oa.check13_2,
          oa.check14_1, oa.check14_2,
          oa.check15_1, oa.check15_2,
          oa.check16_1, oa.check16_2,
          oa.check17_1, oa.check17_2,
          oa.porcentaje_avance,
          oa.porcentaje_fisico,
          oa.porcentaje_financiero,
          oa.monto_contrato,
          oa.monto_anticipo,
          oa.monto_est1,
          oa.monto_est2,
          oa.monto_est3,
          oa.monto_est4,
          oa.monto_est5,
          oa.monto_est6,
          oa.monto_finiquito,
          oa.observaciones,
          oa.municipio,
          oa.contratista,
          obr.residente_id,  -- Obtener el ID del residente
          u.nombre_usuario AS residente_nombre  -- Obtener el nombre del residente
        FROM obras_avance oa
        LEFT JOIN obras_residentes obr ON oa.id = obr.obra_id  
        LEFT JOIN usuarios u ON obr.residente_id = u.id_usuario 
        WHERE oa.nombre_obra = ?`,
        [nombreObra]
      );
      if (rows.length === 0) {
        return null; // Obra no encontrada
      }
  
      const obra = rows[0];
  
      return {
        ...obra,
        contratista: obra.contratista,
        residentes: obra.residente_nombre,  // Retornar el nombre del residente
        porcentajeAvance: obra.porcentaje_avance,
        porcentajeFisico: obra.porcentaje_fisico,
        porcentajeFinanciero: obra.porcentaje_financiero,
        montoContrato: obra.monto_contrato,
        montoAnticipo: obra.monto_anticipo,
        montoEst1: obra.monto_est1,
        montoEst2: obra.monto_est2,
        montoEst3: obra.monto_est3,
        montoEst4: obra.monto_est4,
        montoEst5: obra.monto_est5,
        montoEst6: obra.monto_est6,
        montoFiniquito: obra.monto_finiquito,
        municipio: obra.municipio,
        residenteId: obra.residente_id, // Agregar el ID del residente
      };
    } catch (error) {
      throw { status: 500, message: "Error al obtener información de la obra" };
    }
  };
  

  export const obtenerObrasAvance = async () => {
    try {
      // Consulta para obtener las obras con sus fuentes de financiamiento y municipios
      const [rows] = await pool.query(
        `SELECT
          oa.id,
          oa.nombre_obra, 
          oa.fuente_financiamiento, 
          oa.municipio 
        FROM obras_avance oa`
      );
      return rows;
    } catch (error) {
      throw { status: 500, message: "Error al obtener Obras de Avance" };
    }
  };

  export const mostrarEditarAvance = async (req, res) => {
    // Verificar si el usuario tiene el rol 'AVANCE' en su lista de roles
    if (!req.session.roles || !req.session.roles.includes('Admin AVANCE')) { 
      return res.status(403).send('No tienes permiso para acceder a esta página');
    }
    try {
      const obras = await obtenerObrasAvance();
      const fuentesFinanciamiento = await obtenerFuentesFinanciamiento();
      const residentes = await obtenerResidentes(); // Obtener residentes
      res.render("pages/editar-avance", { obras, fuentesFinanciamiento, residentes, req: req }); // Pasar residentes a la vista
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  export const guardarAvance = async (req, res) => {
    try {
      const nombreObra = req.params.nombre;
      const data = req.body;
  
  
      // Construir la consulta SQL para actualizar la obra
      let sql = "UPDATE obras_avance SET ";
      const values = [];
      for (let i = 1; i <= 17; i++) {
        sql += `check${i}_1 = ?, check${i}_2 = ?, `; 
        // Agregar validación para los checkboxes
        values.push(typeof data[`check${i}_1`] === 'undefined' ? 0 : (data[`check${i}_1`] === 'on' ? 1 : 0));
        values.push(typeof data[`check${i}_2`] === 'undefined' ? 0 : (data[`check${i}_2`] === 'on' ? 1 : 0));
      }
      
      sql += "monto_contrato = ?,monto_anticipo = ?,monto_est1 = ?,monto_est2 = ?,monto_est3 = ?,monto_est4 = ?,monto_est5 = ?,monto_est6 = ?,monto_finiquito = ?,contratista = ?,porcentaje_avance = ?, porcentaje_fisico = ?, porcentaje_financiero = ?, observaciones = ? WHERE nombre_obra = ?";
      values.push(
        data.montoContrato, 
        data.montoAnticipo, 
        data.montoEst1, 
        data.montoEst2, 
        data.montoEst3, 
        data.montoEst4, 
        data.montoEst5, 
        data.montoEst6, 
        data.montoFiniquito, 
        data.contratista, 
        data.porcentajeAvance, 
        data.porcentajeFisico, 
        data.porcentajeFinanciero, 
        data.observaciones, 
        nombreObra // Asegúrate de que nombreObra es el parámetro correcto para la cláusula WHERE
      );
  
  
      await pool.query(sql, values);
      
  
      res.status(200).send('Cambios guardados correctamente');
    } catch (error) {
      res.status(500).send('Error al guardar los cambios');
    }
  };

  export const obtenerResidentes = async () => {
    try {
      const [rows] = await pool.query(
        `SELECT id_usuario, nombre_usuario 
        FROM usuarios 
        WHERE rol = 'Residente'`
      );
      return rows;
    } catch (error) {
      throw { status: 500, message: "Error al obtener residentes" };
    }
  };
// En avanceController.js
export const obtenerIdObraPorNombre = async (nombreObra) => {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM obras_avance WHERE nombre_obra = ?",
      [nombreObra]
    );
    if (rows.length === 0) {
      throw { status: 404, message: "Obra no encontrada" };
    }
    return rows[0].id;
  } catch (error) {
    throw { status: 500, message: "Error al obtener ID de la obra" };
  }
};

export const mostrarAsignarResidentes = async (req, res) => {
  // Verificar si el usuario tiene el rol 'Infraestructura'
  if (!req.session.roles || !req.session.roles.includes('Infraestructura')) { 
    return res.status(403).send('No tienes permiso para acceder a esta página');
  }
  try {
    const obras = await obtenerObrasAvance();
    const residentes = await obtenerResidentes();
    res.render("pages/asignar-residentes", { obras, residentes, req: req }); 
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};



export const asignarResidente = async (req, res) => {
  try {

    const obraId = req.body.obra;
    const residenteId = req.body.residente;

    // Validar que obraId sea un número entero
    if (!obraId || !/^\d+$/.test(obraId)) { 
      return res.status(400).send('Debe seleccionar una obra válida');
    }

    // Verificar si ya existe una asignación para esta obra
    const [rows] = await pool.query(
      "SELECT * FROM obras_residentes WHERE obra_id = ?",
      [obraId]
    );

    if (rows.length > 0) {
      // Ya existe una asignación para esta obra
      return res.status(400).send('Esta obra ya tiene un residente asignado.');
    } else {
      // Insertar una nueva asignación
      await pool.query(
        "INSERT INTO obras_residentes (obra_id, residente_id) VALUES (?, ?)",
        [obraId, residenteId]
      );
    }

    res.status(200).send('Residente asignado correctamente');
  } catch (error) {
    res.status(500).send(`Error al asignar el residente: ${error.message}`);
  }
};

// ... otras funciones ...


  export default {
    mostrarAvances,
    obtenerObrasAvance,
    obtenerInformacionObra,
    obtenerFuentesFinanciamiento,
    obtenerObrasAvancePorFuente,
    mostrarEditarAvance,
    guardarAvance,
    mostrarAsignarResidentes,
  asignarResidente
  };