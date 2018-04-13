module.exports = function(app, gestorBD) {
	
	app.post("/api/autenticar/", function(req, res) {
		var encryptedPassword = app.get("crypto").createHmac('sha256', app.get('key'))
			.update(req.body.password).digest('hex');
		
		var criterio = {
			email: req.body.email,
			password: encryptedPassword
		}

		gestorBD.getUsers(criterio, function(users) {
			if (users == null || users.length == 0) {
				res.status(401); // Unauthorized
				res.json({
					authenticated : false,
					message : "Inicio de sesión no correcto"
				});
			} else {
				// El token consiste en el email del usuario y la fecha actual 
				// en segundas, todo ello encriptado
				var token = app.get('jwt').sign(
						{email: criterio.email , tiempo: Date.now()/1000},
						"secreto");
				
				res.status(200);// OK
				res.json({
					authenticated: true,
					token : token
				});
			}
		});
	});

	app.get("/api/friend", function(req, res) {
		var criterio = {$or: [
			{"userEmail" : req.session.email},
			{"otherUserEmail" : req.session.email},
		]  };
		
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
		
		paso2ObtenerAmigosConEsosEmails(req, res, friendsEmails, pg, pgUltima);
	}
	
	function paso2ObtenerAmigosConEsosEmails(req, res, friendsEmails, pg, pgUltima){
		var criterio = { "email" : { "$in" : friendsEmails } };
		
		gestorBD.getUsers(criterio, function(friends) {
			if (friends == null){
				res.redirect("/user/list" +
						"?message=Error al listar los amigos."+
						"&messageType=alert-danger");
			} else {
				gestorLog.userListHisFriends(req.session.email, pg, friendsEmails);
				
				var respuesta = swig.renderFile('views/user/friends.html', {
					friends : friends,
					pgActual : pg,
					pgUltima : pgUltima,
					email: req.session.email
				});
				res.send(respuesta);	
			}
		});
	}
	
};