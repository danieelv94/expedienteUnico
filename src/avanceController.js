import pool from "./db.js";

export const mostrarAvances = async (req, res) => {
    if (req.session.user.rol !== 'AVANCE') {
      return res.status(403).send('No tienes permiso para acceder a esta página');
    }
  try {
    const obras = await obtenerObrasAvance();
    res.render("pages/avance", { obras, req: req });
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
      console.error("Error al obtener fuentes de financiamiento:", error);
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
      console.error("Error al obtener Obras de Avance por fuente:", error);
      throw { status: 500, message: "Error al obtener Obras de Avance por fuente" };
    }
  };
  
  export const calcularSaldoAPagar = (obra) => {
    const { monto_contrato, monto_anticipo, monto_convenio, monto_est1, monto_est2, monto_est3, monto_est4 } = obra;
    const totalEstimaciones = monto_est1 + monto_est2 + monto_est3 + monto_est4;
    const saldo = monto_contrato - monto_anticipo - monto_convenio - totalEstimaciones;
    return saldo;
  };
  export const obtenerInformacionObra = async (nombreObra) => {
    try {
      // Consulta para obtener la información de la obra, incluyendo el porcentaje de avance
      const [rows] = await pool.query(
        `SELECT 
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
          oa.porcentaje_avance,
          oa.porcentaje_fisico,
          oa.porcentaje_financiero,
          oa.observaciones,
          oa.contratista
        FROM obras_avance oa
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
        porcentajeAvance: obra.porcentaje_avance,
        porcentajeFisico: obra.porcentaje_fisico,
        porcentajeFinanciero: obra.porcentaje_financiero
      };
    } catch (error) {
      console.error("Error al obtener información de la obra:", error);
      throw { status: 500, message: "Error al obtener información de la obra" };
    }
  };

  export const obtenerObrasAvance = async () => {
    try {
      // Consulta para obtener las obras con sus fuentes de financiamiento y municipios
      const [rows] = await pool.query(
        `SELECT 
          oa.nombre_obra, 
          oa.fuente_financiamiento, 
          oa.municipio 
        FROM obras_avance oa`
      );
      return rows;
    } catch (error) {
      console.error("Error al obtener Obras de Avance:", error);
      throw { status: 500, message: "Error al obtener Obras de Avance" };
    }
  };

  export const mostrarEditarAvance = async (req, res) => {
    if (req.session.user.rol !== 'Admin AVANCE') {
      return res.status(403).send('No tienes permiso para acceder a esta página');
    }
    try {
      const obras = await obtenerObrasAvance();
      const fuentesFinanciamiento = await obtenerFuentesFinanciamiento();
      res.render("pages/editar-avance", { obras, fuentesFinanciamiento, req: req });
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
      for (let i = 1; i <= 15; i++) {
        sql += `check${i}_1 = ?, check${i}_2 = ?, `; 
        values.push(data[`check${i}_1`] === 'on' ? 1 : 0); 
        values.push(data[`check${i}_2`] === 'on' ? 1 : 0);
      }
      // Agregar la columna 'observaciones' y su valor
      sql += "contratista = ?,porcentaje_avance = ?, porcentaje_fisico = ?, porcentaje_financiero = ?, observaciones = ? WHERE nombre_obra = ?";
      values.push(data.contratista,data.porcentajeAvance, data.porcentajeFisico, data.porcentajeFinanciero, data.observaciones, nombreObra);

      // Ejecutar la consulta SQL
      await pool.query(sql, values);

      res.status(200).send('Cambios guardados correctamente');
    } catch (error) {
      console.error("Error al guardar la información de la obra:", error);
      res.status(500).send('Error al guardar los cambios');
    }
  };

  export default {
    mostrarAvances,
    obtenerObrasAvance,
    obtenerInformacionObra,
    obtenerFuentesFinanciamiento,
    obtenerObrasAvancePorFuente,
    mostrarEditarAvance,
    guardarAvance
  };