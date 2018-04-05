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
			name : req.body.name + ' ' + req.body.lastName,
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

		// Si hay parametro de busqueda, modificamos el criterio
		if(req.query.searchText != null){
			criterio = {$or: [
							{"email" : {$regex : ".*"+req.query.searchText+".*"}},
							{"name" : {$regex : ".*"+req.query.searchText+".*"}}
			]  };
		}
		
		// Número de página
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

				var itemsPerPage = app.get('itemsPerPage');
				var pgUltima = Math.floor(total / itemsPerPage);
				if (total % itemsPerPage > 0) { // Sobran decimales
					pgUltima = pgUltima + 1;
				}

				var respuesta = swig.renderFile('views/user/list.html', {
					users : users,
					pgActual : pg,
					pgUltima : pgUltima,
					searchText : req.query.searchText, // TODO ??
					email: req.session.email
				});
				res.send(respuesta);
			}
		});
		
	});	

	app.get("/user/friends", function(req, res) {
		var criterio = {$or: [
			{"userEmail" : req.session.email},
			{"otherUserEmail" : req.session.email},
		]  };
		
		// Número de página
		var pg = parseInt(req.query.pg);
		if (req.query.pg == null || isNaN(pg)) {
			pg = 1;
		}
		
		gestorBD.getFriendshipsPg(criterio, pg, function(friendships, total) {
			if (friendships == null) {
				res.redirect("/user/list" +
						"?message=Error al listar los amigos."+
						"&messageType=alert-danger");
			} else {
				
				var itemsPerPage = app.get('itemsPerPage');
				var pgUltima = Math.floor(total / itemsPerPage);
				if (total % itemsPerPage > 0) { // Sobran decimales
					pgUltima = pgUltima + 1;
				}
				
				paso1ObtenerEmailsAmigos(req, res, friendships, pg, pgUltima);
			}
		});
	});	
	
	function paso1ObtenerEmailsAmigos(req, res, friendships, pg, pgUltima){
		friendsEmails = [];
		
		friendships.forEach(function(currentFriendship) {
			if(currentFriendship.userEmail != req.session.email)
				friendsEmails.push(currentFriendship.userEmail);
			else
				friendsEmails.push(currentFriendship.otherUserEmail);
		});
		
		var respuesta = swig.renderFile('views/user/friends.html', {
			friends : friendsEmails, // HACER!
			pgActual : pg,
			pgUltima : pgUltima,
			email: req.session.email
		});
		res.send(respuesta);
	}
	
};