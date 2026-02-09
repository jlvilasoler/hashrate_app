import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const publicPath = path.join(__dirname, '../public');

app.use(express.json()); // PARA PODER MANIPULAR JSON , NOS PERMITE RECIBIR EL JSON MEDIANTE POST
app.use(express.urlencoded({ extended: true})); 

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Route for facturacion page
app.get('/facturacion', (req, res) => {
  res.sendFile(path.join(publicPath, 'facturacion.html'));
});

// Serve static files after routes
app.use(express.static(publicPath));

app.listen(8080, () => console.log("Server on port 8080"));