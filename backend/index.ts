import app from './app';
console.clear();
// Definimos el puerto 4000 para que el servidor escuche las peticiones
const PORT: number = 4000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});