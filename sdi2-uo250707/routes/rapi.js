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
		});//TODO - log
	});

	app.get("/api/friend", function(req, res) {
		var criterio = {$or: [
			{"userEmail" : res.email},
			{"otherUserEmail" : res.email},
		]  };
		
		gestorBD.getFriendships(criterio, function(friendships, total) {
			if (friendships == null) {
				res.status(500); // Server Internal Error
				res.json({
					error : "Se ha producido un error"
				});
			} else {
				obtenerEmailsAmigos(req, res, friendships);
			}
		});
	});	
	
	function obtenerEmailsAmigos(req, res, friendships){
		friendsEmails = [];
		
		friendships.forEach(function(currentFriendship) {
			if(currentFriendship.userEmail != res.email)
				friendsEmails.push(currentFriendship.userEmail);
			else
				friendsEmails.push(currentFriendship.otherUserEmail);
		});
		
		res.status(200);
		res.send(JSON.stringify(friendsEmails));
	}
	
};