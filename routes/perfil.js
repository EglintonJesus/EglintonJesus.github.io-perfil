const express = require('express');
const router = express.Router();

// 1. BASE DE DATOS TEMPORAL (Se mantiene mientras el servidor esté encendido)
const usuarioData = {
    perfil: {
        nombre: "Eglinton Jesus",
        descripcion: "Especialista en Car Detailing | Sistemas Engineering Student",
        foto: "/img/perfil.jpg"
    },
    albumes: [
        { 
            id: "motos", 
            titulo: "Motos", 
            fotos: ["/img/m1.jpg", "/img/m2.jpg", "/img/m3.jpeg"], 
            likes: 0 
        },
        { 
            id: "carros", 
            titulo: "Carros", 
            fotos: ["/img/c1.jpg", "/img/c2.jpg", "/img/c3.jpg"], 
            likes: 0 
        },
        { 
            id: "detailing", 
            titulo: "Detailing", 
            fotos: ["/img/d1.jpg", "/img/d2.jpg", "/img/d3.jpg"], 
            likes: 0 
        }
    ],
    // Aquí es donde AJAX trabajará:
    contactos: [
        { id: 1, nombre: "Admin Detailing", celular: "961XXXXXX", correo: "contacto@detailing.com" }
    ]
};

// --- RUTAS ---

// Carga la página principal
router.get('/', (req, res) => {
    res.render('index', { usuario: usuarioData });
});

// API: Obtener todos los contactos (READ)
router.get('/api/contactos', (req, res) => {
    res.json(usuarioData.contactos);
});

// API: Crear un nuevo contacto (CREATE)
router.post('/api/contactos', (req, res) => {
    const { nombre, celular, correo } = req.body;

    // Validación básica
    if (!nombre || !celular || !correo) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevoContacto = {
        id: Date.now(), // Genera un ID único para poder eliminarlo luego
        nombre,
        celular,
        correo
    };

    usuarioData.contactos.push(nuevoContacto);
    res.status(201).json(nuevoContacto);
});

// API: Eliminar un contacto (DELETE)
router.delete('/api/contactos/:id', (req, res) => {
    const idEliminar = parseInt(req.params.id);
    
    // Filtramos el array para quitar el contacto con ese ID
    const inicialCount = usuarioData.contactos.length;
    usuarioData.contactos = usuarioData.contactos.filter(c => c.id !== idEliminar);
    
    if (usuarioData.contactos.length < inicialCount) {
        res.json({ success: true, mensaje: "Contacto eliminado" });
    } else {
        res.status(404).json({ error: "No se encontró el contacto" });
    }
});

module.exports = router;