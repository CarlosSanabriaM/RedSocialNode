// Módulos
var express = require('express');
var app = express();

var fs = require('fs');
var https = require('https');
var expressSession = require('express-session');
app.use(expressSession({
	secret: 'abcdefg',
	resave: true,
	saveUninitialized: true
}));
var crypto = require('crypto');
var fileUpload = require('express-fileupload');
app.use(fileUpload());
var mongo = require('mongodb');
var swig = require('swig');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

// TODO quitar
//var gestorComprobaciones = require("./modules/gestorComprobaciones.js");
//gestorComprobaciones.init(mongo);
//app.set('gestorComprobaciones', gestorComprobaciones);

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
	if ( req.session.email ) {
		// Si hay un usuario en sesión, dejamos correr la petición
		next();
	} else {
		// Si no, lo redirigimos al login
		res.redirect("/login" +
				"?message=Debes identificarte primero para acceder a esa página.");
	}
});

// Aplicar routerUsuarioSession
app.use("/user", routerUsuarioSession);

//routerUsuarioAutor
//var routerUsuarioAutor = express.Router();
//routerUsuarioAutor.use(function(req, res, next) {
//	console.log("routerUsuarioAutor");
//	var path = require('path');
//	var id = path.basename(req.originalUrl);
//	// Cuidado porque req.params no funciona
//	// en el router si los params van en la URL.
//	gestorBD.obtenerCanciones(
//				{ _id : mongo.ObjectID(id) }, function (canciones) {
//			console.log(canciones[0]);
//			if(canciones[0]!=null && canciones[0].autor == req.session.email ){
//				next();
//			} else {
//				res.redirect("/tienda" +
//		 				"?message=No puedes realizar esa operación sobre una canción la cual no eres su autor."+
//		 				"&messageType=alert-warning");
//			}
//	});
//});
//
//// Aplicar routerUsuarioAutor
//app.use("/cancion/modificar",routerUsuarioAutor);
//app.use("/cancion/eliminar",routerUsuarioAutor);


app.use(express.static('public'));

// Variables
app.set('port', 8081);
app.set('db', "mongodb://admin:sdi_2018@ds129593.mlab.com:29593/sdi2-uo250707");
app.set('key','abcdefg');
app.set('crypto',crypto);
app.set('itemsPerPage', 5);

// Rutas/controladores por lógica
require("./routes/rusers.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rinvitations.js")(app, swig, gestorBD); // (app, param1, param2, etc.)

// Página inicio
app.get('/', function (req, res) {
	var respuesta = swig.renderFile("views/index.html",{
		email : req.session.email
	});
	res.send(respuesta);
});

// Función de manejo de errores
app.use( function (err, req, res, next ) {
	console.log("Error producido: " + err); // we log the error in our db TODO
	if (! res.headersSent) {
		res.status(400);
		res.send("Recurso no disponible"); // TODO render a error html page with the error
	}
});

//Lanzar el servidor, utilizando https
https.createServer({
	key:  fs.readFileSync('certificates/alice.key'),
	cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
	console.log("Servidor activo");
});