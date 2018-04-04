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

var gestorComprobaciones = require("./modules/gestorComprobaciones.js");
gestorComprobaciones.init(mongo);
app.set('gestorComprobaciones', gestorComprobaciones);

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
	console.log("routerUsuarioSession");
	if ( req.session.usuario ) {
		// dejamos correr la petición
		next();
	} else {
		// Guardamos en sesión la url a la que iba y lo redirigimos al login
		console.log("va a : "+req.originalUrl);
		req.session.destino = req.originalUrl;
		res.redirect("/identificarse" +
		 				"?mensaje=Debes identificarte primero para acceder a esa página.");
	}
});

// Aplicar routerUsuarioSession
app.use("/canciones/agregar", routerUsuarioSession);
app.use("/publicaciones", routerUsuarioSession);
app.use("/cancion/comprar", routerUsuarioSession);
app.use("/compras", routerUsuarioSession);

//routerUsuarioAutor
var routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
	console.log("routerUsuarioAutor");
	var path = require('path');
	var id = path.basename(req.originalUrl);
	// Cuidado porque req.params no funciona
	// en el router si los params van en la URL.
	gestorBD.obtenerCanciones(
				{ _id : mongo.ObjectID(id) }, function (canciones) {
			console.log(canciones[0]);
			if(canciones[0]!=null && canciones[0].autor == req.session.usuario ){
				next();
			} else {
				res.redirect("/tienda" +
		 				"?mensaje=No puedes realizar esa operación sobre una canción la cual no eres su autor."+
		 				"&tipoMensaje=alert-warning");
			}
	})
});

// Aplicar routerUsuarioAutor
app.use("/cancion/modificar",routerUsuarioAutor);
app.use("/cancion/eliminar",routerUsuarioAutor);

// routerAudios
var routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
	console.log("routerAudios");
	var path = require('path');
	var idCancion = path.basename(req.originalUrl, '.mp3');
	
	gestorBD.obtenerCanciones(
		{ _id : mongo.ObjectID(idCancion) }, function (canciones) {
			// Si el usuario en sesión es el autor de la canción, le dejamos acceder
			if( canciones[0] != null && canciones[0].autor == req.session.usuario ){
				next();
			} else {
				var criterio = {
					 usuario : req.session.usuario,
					 cancionId : mongo.ObjectID(idCancion)
				 };

				 gestorBD.obtenerCompras(criterio ,function(compras){
					 // Si el usuario en sesión ha comprado la canción, le dejamos acceder
					 if (compras != null && compras.length > 0 ){
						 next();
					 } else {
						 res.redirect("/tienda" +
		 				"?mensaje=No se puede acceder al audio de la canción indicada."+
		 				"&tipoMensaje=alert-warning");
					 }
				 });
			}
		});
});

// Aplicar routerAudios
app.use("/audios/",routerAudios);

app.use(express.static('public'));

// Variables
app.set('port', 8081);
app.set('db', "mongodb://admin:sdi_2018@ds129593.mlab.com:29593/sdi2-uo250707");
app.set('clave','abcdefg');
app.set('crypto',crypto);

// Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app, swig, gestorBD); // (app, param1, param2, etc.)

app.get('/', function (req, res) {
	var respuesta = swig.renderFile("views/index.html",{});
	res.send(respuesta);
})

// Función de manejo de errores
app.use( function (err, req, res, next ) {
	console.log("Error producido: " + err); // we log the error in our db TODO
	if (! res.headersSent) {
		res.status(400);
		res.send("Recurso no disponible");
	}
});

//Lanzar el servidor, utilizando https
https.createServer({
	key:  fs.readFileSync('certificates/alice.key'),
	cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
	console.log("Servidor activo");
});