const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// base de datos de usuario
const users = [
    {
        id: 1,
        email: 'admin@admin.com',
        passwordHash: bcrypt.hashSync('admin', 10), // Contraseña: admin
        name: 'David',
        lastName: 'Cruz',
        birthDate: '2004-07-09'
    }
];

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para parsear las cookies
app.use(cookieParser());

// Función para verificar las credenciales del usuario
function authenticateUser(email, password) {
    const user = users.find(user => user.email === email);
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        return user;
    }
    return null;
}

// Endpoint para iniciar sesión
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = authenticateUser(email, password);
    if (user) {
        // Generar una cookie de sesión
        res.cookie('sessionID', 'sessionToken', { httpOnly: true });
        res.status(200).send('Login successful');
    } else {
        res.status(401).send('Invalid email or password');
    }
});

// Middleware para verificar la sesión del usuario
function requireAuth(req, res, next) {
    const sessionID = req.cookies.sessionID;
    if (sessionID === 'sessionToken') {
        // Obtener el ID de usuario adjunto a la solicitud
        req.userId = 1; // Suponiendo que el ID de usuario es 1, debes obtenerlo correctamente de tu implementación
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Endpoint protegido - Profile
app.get('/profile', requireAuth, (req, res) => {
    // Buscar el usuario en la base de datos usando el ID de usuario de la solicitud
    const user = users.find(user => user.id === req.userId);

    if (user) {
        // Devolver datos del usuario
        const { name, lastName, email, birthDate } = user;
        const userData = {
            name: name,
            lastName: lastName,
            email: email,
            birthDate: birthDate
        };
        res.json(userData);
    } else {
        res.status(404).send('User not found');
    }
});

// Endpoint protegido - Form
app.post('/form', requireAuth, (req, res) => {
    const { text } = req.body;
    if (text) {
        res.send(text.toLowerCase()); // Devuelve el texto en minusculas
    } else {
        res.status(400).send('No text provided');
    }
});

// Endpoint protegido - Contacts
app.get('/contacts', requireAuth, (req, res) => {
    const randomContacts = [
        { name: 'John', lastName: 'Doe', email: 'john@example.com' },
        { name: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
        { name: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
        { name: 'Bob', lastName: 'Johnson', email: 'bob@example.com' },
        { name: 'Emma', lastName: 'Williams', email: 'emma@example.com' }
    ];

    // Devolver la lista aleatoria de usuarios
    res.json(randomContacts);
});

// Endpoint para cerrar sesión
app.post('/logout', (req, res) => {
    res.clearCookie('sessionID'); // Borra la cookie
    res.status(200).send('Logout successful');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
