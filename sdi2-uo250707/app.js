// Módulos
var express = require('express');
var app = express();

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
	// Debemos especificar todas las headers que se aceptan. Content-Type , token
	next();
});

var jwt = require('jsonwebtoken');
var fs = require('fs');
var expressSession = require('express-session');
app.use(expressSession({
	secret: 'abcdefg',
	resave: true,
	saveUninitialized: true
}));
var crypto = require('crypto');
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

//routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
	
	// obtener el token, puede ser un parámetro GET , POST o HEADER
	var token = req.body.token || req.query.token || req.headers['token'];
	
	if (token != null) {
		// verificar el token
		jwt.verify(token, 'secreto', function(err, infoToken) {
			// Si el token NO es valido o han pasado más de 4min desde que se expedió
			if (err || (Date.now() / 1000 - infoToken.tiempo) > 480) {
				res.status(403); // Forbidden
				res.json({
					access: false,
					error: 'Token inválido o caducado'
				});
				return;
			} else {
				// dejamos correr la petición
				res.email = infoToken.email;
				next();
			}
		});

	} else {
		res.status(403); // Forbidden
		res.json({
			access: false,
			message: 'No hay Token'
		});
	}
});

// Aplicar routerUsuarioToken
app.use('/api/friend', routerUsuarioToken);
app.use('/api/message', routerUsuarioToken);
app.use('/api/user', routerUsuarioToken);

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
app.set('gestorLog', gestorLog);
app.set('jwt',jwt);

// Rutas/controladores por lógica
require("./routes/rusers.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rinvitations.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rapi.js")(app, gestorBD);

// Página inicio
app.get('/', function (req, res) {
	var respuesta = swig.renderFile("views/index.html",{
		email : req.session.email
	});
	res.send(respuesta);
});

// Pagina de error cuando no se encuentra el recurso (404 Not Found)
// Si no se entra por ninguna de las rutas anteriores, se entra por esta.
app.get('*', function(req, res){
	var respuesta = swig.renderFile('views/error.html', {
		errorMessage : "404 Not Found. No existe el recurso indicado."
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

//Lanzar el servidor
app.listen(app.get('port'), function() {
	console.log("Servidor activo");
});