import express from "express";
import session from "express-session";
import cors from "cors";
import router from "./src/router.js"; // Importa el enrutador

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// Configuración de la sesión
app.use(session({
    secret: 'your-secret-key', // Cambia esto por una clave secreta más segura
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // En producción, usa `true` si estás usando HTTPS
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

const PORT = process.env.PORT || 3600;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://127.0.0.1:${PORT}`);
});
