import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT: number = 4000;

// Configuración de la base de datos MongoDB
const MONGO_URI = 'mongodb://localhost:27017/mydatabase';

// Middleware para manejar JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// con esta funcion nos conectamos al serviodr de la api y tambien a la base de datos mongodb
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conexión a MongoDB exitosa');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1); // Termina el proceso si no puede conectar a la base de datos
  });
