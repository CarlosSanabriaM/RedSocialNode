module.exports = function(app, swig, gestorBD) {

	app.get("/signup", function(req, res){
		var response = swig.renderFile("views/signup.html", {
			email: req.session.email
		});
		res.send(response);
	});
	
	app.post('/signup', function(req, res){
		// Comprobamos que las passwords coincidan
		if(req.body.password !== req.body.passwordConfirm){
			res.redirect("/signup" +
	 				"?message=Las contraseñas no coinciden."+
	 				"&messageType=alert-danger");
			return;
		}
		
		// Encriptamos la contraseña
		var encryptedPassword = app.get("crypto").createHmac('sha256', app.get('key'))
				.update(req.body.password).digest('hex');
		
		var user = {
			email : req.body.email,
			name : req.body.name,
			lastName : req.body.lastName,
			password : encryptedPassword
		}
		
		gestorBD.insertUser(user, function(id, errMessage) {
			if (id == null) {
				res.redirect("/signup" +
		 				"?message="+ errMessage+
		 				"&messageType=alert-danger");
			} else {
				res.redirect("/login" +
		 				"?message=Usuario registrado correctamente." +
		 				"&messageType=alert-success");
			}
		});
	});
	
	app.get("/login", function(req, res) {
		var response = swig.renderFile('views/login.html', {
			email: req.session.email
		});
		res.send(response);
	});	

	app.post("/login", function(req, res) {
		// Encriptamos la contraseña
		var encryptedPassword = app.get("crypto").createHmac('sha256', app.get('key'))
				.update(req.body.password).digest('hex');
	
		var criterio = {
			email : req.body.email,
			password : encryptedPassword
		}
		
		gestorBD.getUsers(criterio, function(users) {
			if (users == null){
				// Error
				req.session.email = null;
			 	res.redirect("/login" +
			 			"?message=Error al registrarse."+
						"&messageType=alert-danger");
			} else if(users.length == 0) {
				// Usuario con esas credenciales no existe
				req.session.email = null;
			 	res.redirect("/login" +
			 			"?message=Email o password incorrecto."+
						"&messageType=alert-danger");
			} else {
				// Usuario con esas credenciales existe
				req.session.email = users[0].email;
				res.redirect("/user/list");	
			}
		});
	});
	
	app.get("/logout", function(req, res){
		req.session.email = null;
		res.redirect("/login" +
				"?message=Desconectado correctamente");
	});
	
	app.get("/user/list", function(req, res) {
		var criterio = {};

//		if(req.query.busqueda != null){
//			criterio = { "email" : {$regex : ".*"+req.query.busqueda+".*"} };
//		}
		
		var pg = parseInt(req.query.pg);
		if (req.query.pg == null || isNaN(pg)) {
			pg = 1;
		}
		
		gestorBD.getUsersPg(criterio, pg, function(users, total) {
			if (users == null) {
				res.redirect("/" +
		 				"?message=Error al listar los usuarios."+
		 				"&messageType=alert-danger");
			} else {

				var pgUltima = Math.floor(total / 5); // 5 canciones por página
				if (total % 5 > 0) { // Sobran decimales
					pgUltima = pgUltima + 1;
				}

				var respuesta = swig.renderFile('views/user/list.html', {
					users : users,
					pgActual : pg,
					pgUltima : pgUltima,
					email: req.session.email
				});
				res.send(respuesta);
			}
		});
		
	});	
	
};