import express from "express";
import session from "express-session";
import cors from "cors";
import router from "./src/router.js";
import path from "path";
import { fileURLToPath } from 'url';
import fileUpload from "express-fileupload";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(fileUpload()); // 👈 Agregar este middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// Configuración para servir archivos estáticos desde la carpeta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de la sesión
app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// Establece el motor de plantillas
app.set("view engine", "ejs");
app.set("views", "./views");

// Define la ruta raíz ("/")
app.get("/", (req, res) => {
    res.redirect("/login"); // Redirige al login
});

// Usa el enrutador para las rutas relacionadas con usuarios
app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://127.0.0.1:${PORT}`);
});