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
var log4js = require('log4js');

// Configuramos el logger
log4js.configure({
	appenders: {
		out: { 	// para la salida estándar
			type: 'stdout', 
			layout: { type: 'pattern', pattern: '%[[%d{dd-MM-yyyy hh:mm:ss}] [%p] - %]%m' }
		},
	    file: { 	// para la salida a un fichero de log
	    		type: 'file', filename: 'logs/uo250707.log', 
	    		layout: { type: 'pattern', pattern: '[%d{dd-MM-yyyy hh:mm:ss}] [%p] - %m' }
		}
	},
	categories: { 
		default: { appenders: [ 'out', 'file' ], level: 'debug' } 
	}
});
var logger = log4js.getLogger();

var gestorLog = require("./modules/gestorLog.js");
gestorLog.init(app, logger);

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

// Directorio public
app.use(express.static('public'));

// Variables
app.set('port', 8081);
app.set('db', "mongodb://admin:sdi_2018@ds129593.mlab.com:29593/sdi2-uo250707");
app.set('key','abcdefg');
app.set('crypto',crypto);
app.set('itemsPerPage', 5);

// Rutas/controladores por lógica
require("./routes/rusers.js")(app, swig, gestorBD, gestorLog); // (app, param1, param2, etc.)
require("./routes/rinvitations.js")(app, swig, gestorBD, gestorLog); // (app, param1, param2, etc.)

// Página inicio
app.get('/', function (req, res) {
	var respuesta = swig.renderFile("views/index.html",{
		email : req.session.email
	});
	res.send(respuesta);
});

//Función de manejo de errores
app.use( function (err, req, res, next ) {
	gestorLog.error("Error producido: " + err);
	
	if (! res.headersSent) {
		res.status(400);
		
		var respuesta = swig.renderFile('views/error.html', {
			errorMessage : "Recurso no disponible."
		});
		res.send(respuesta);
	}
});

//Lanzar el servidor, utilizando https
https.createServer({
	key:  fs.readFileSync('certificates/alice.key'),
	cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
	console.log("Servidor activo");
});