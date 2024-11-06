import pool from "./db.js";

export const mostrarGraficas = async (req, res) => {
  if (req.session.user.rol !== 'AVANCE') { // Ajusta el rol si es necesario
    return res.status(403).send('No tienes permiso para acceder a esta página');
  }
  try {
    const obras = await obtenerObrasAvance();
    const fuentesFinanciamiento = await obtenerFuentesFinanciamiento();
    res.render("pages/graficas", { obras, fuentesFinanciamiento, req: req }); 
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const obtenerFuentesFinanciamiento = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT fuente_financiamiento 
      FROM obras_avance
    `);
    return rows.map(row => row.fuente_financiamiento);
  } catch (error) {
    console.error("Error al obtener fuentes de financiamiento:", error);
    throw { status: 500, message: "Error al obtener fuentes de financiamiento" };
  }
};

export const obtenerObrasAvance = async () => {
  try {
    // Obtener nombre de obra y fuente de financiamiento
    const [rows] = await pool.query("SELECT nombre_obra, fuente_financiamiento FROM obras_avance"); 
    return rows;
  } catch (error) {
    console.error("Error al obtener Obras de Avance:", error);
    throw { status: 500, message: "Error al obtener Obras de Avance" };
  }
};

export const obtenerObrasAvancePorFuente = async (fuente) => {
  try {
    const [rows] = await pool.query(`
      SELECT nombre_obra 
      FROM obras_avance 
      WHERE fuente_financiamiento = ?
    `, [fuente]);
    return rows;
  } catch (error) {
    console.error("Error al obtener Obras de Avance por fuente:", error);
    throw { status: 500, message: "Error al obtener Obras de Avance por fuente" };
  }
};

export const obtenerDatosGrafica = async (fuente = null, obra = null) => {
  try {
    let query = `
      SELECT nombre_obra, porcentaje_financiero, porcentaje_fisico 
      FROM obras_avance
    `;
    const values = [];

    if (fuente && obra) {
      query += ` WHERE fuente_financiamiento = ? AND nombre_obra = ?`;
      values.push(fuente, obra);
    } else if (fuente) {
      query += ` WHERE fuente_financiamiento = ?`;
      values.push(fuente);
    }

    const [rows] = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("Error al obtener datos para la gráfica:", error);
    throw { status: 500, message: "Error al obtener datos para la gráfica" };
  }
};

export default {
  mostrarGraficas,
  obtenerObrasAvance,
  obtenerDatosGrafica,
  obtenerFuentesFinanciamiento, // Agregar la nueva función
  obtenerObrasAvancePorFuente
};