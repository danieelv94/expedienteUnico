import pool from "./db.js";

export const mostrarFicha = async (req, res) => {  
  try {
    const [rows] = await pool.query("SELECT * FROM fichas"); 
    res.render("pages/ficha", { municipios: rows, req: req }); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener fichas" });
  }
};

export const subirPDF = async (req, res) => {
  try {
    const fichaId = req.params.id; 

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No se ha seleccionado ningún archivo.');
    }

    const pdfFile = req.files.pdf;
    console.log("Archivo PDF recibido:", pdfFile);

    const pdfPath = `public/pdfs/${fichaId}.pdf`;

    pdfFile.mv(pdfPath, (err) => {
      if (err) {
        console.error("Error al mover el archivo PDF:", err);
        return res.status(500).send(err);
      }


      pool.query("UPDATE fichas SET pdf = ? WHERE id = ?", [pdfPath, fichaId])
        .then(() => {
          res.redirect('/ficha');  
        })
        .catch(error => {
          res.status(500).send("Error al subir el PDF");
        });
    });
  } catch (error) {
    res.status(500).send("Error al subir el PDF");
  }
};

export default {
  mostrarFicha,  
  subirPDF
};