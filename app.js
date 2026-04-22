const express = require('express');
const app = express();
const path = require('path');

// --- MIDDLEWARES CRÍTICOS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- BASE DE DATOS TEMPORAL (EN MEMORIA) ---
// Al no tener BD, los contactos se guardan en este array.
// Si reinicias el servidor, se borrarán.
let contactos = []; 

// --- RUTAS DE LA API PARA CONTACTOS ---

// 1. Obtener todos los contactos
app.get('/api/contactos', (req, res) => {
    res.json(contactos);
});

// 2. Guardar un nuevo contacto
app.post('/api/contactos', (req, res) => {
    const { nombre, celular, correo, favorito } = req.body;
    
    const nuevoContacto = {
        id: Date.now(), // Generamos un ID único con el tiempo actual
        nombre,
        celular,
        correo,
        // Convertimos a booleano real para que el filtro funcione
        favorito: favorito === true || favorito === "true"
    };
    
    contactos.push(nuevoContacto);
    console.log("Contacto guardado:", nuevoContacto);
    res.status(201).json(nuevoContacto);
});

// 3. Eliminar un contacto
app.delete('/api/contactos/:id', (req, res) => {
    const { id } = req.params;
    contactos = contactos.filter(c => c.id != id);
    res.json({ message: "Eliminado" });
});

// --- CONFIGURACIÓN DE VISTAS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTAR RUTAS DEL PERFIL
const perfilRoutes = require('./routes/perfil'); 
app.use('/', perfilRoutes); 

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});