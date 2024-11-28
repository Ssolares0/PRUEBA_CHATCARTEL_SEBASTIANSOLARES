const app = require('./app.js');


console.clear();


//creamos el puerto 4000 para que el servidor escuche las peticiones
const PORT =4000;

app.listen(PORT);

console.log(`Server running on port http://localhost:${PORT}`);


