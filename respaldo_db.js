const MysqlBackup = require('mysql-backup');

 // Configuración de la conexión a la base de datos
 const config = {
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'CEAA_EXP'
 };

 // Crear una instancia de MysqlBackup
 const backup = new MysqlBackup({
   root: '/bd' 
 }, config);

 // Ejecutar el respaldo
 backup.start();