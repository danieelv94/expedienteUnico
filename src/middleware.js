export function verificarAutenticacion(req, res, next) {
    if (req.session.user) {
        next(); // Si el usuario está autenticado, continúa con la solicitud
    } else {
        res.redirect("/login"); // Si no está autenticado, redirige al login
    }
}
