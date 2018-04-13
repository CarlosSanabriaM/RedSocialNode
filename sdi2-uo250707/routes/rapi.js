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
	
	app.post("/api/message", function(req, res) {
		 var message = {
			 emisor : res.email, // el emisor es el usuario en sesión
			 destino : req.body.destino,
			 texto : req.body.texto,
			 leido : false, // por defecto se crea como no leido
		 }
		 
		 // Validamos los datos de entrada
		 if(message.destino == null || message.texto == null ||
				 typeof message.destino != "string" ||
				 typeof message.texto != "string"){
			 
			 res.status(400);// Bad Request
			 res.json({
				 error : "Datos introducidos erróneos"
			 });
			 return;
		 }
		 
		 paso1ComprobarExisteDestino(req, res, message);
	});
	
	function paso1ComprobarExisteDestino(req, res, message){		
		// Comprobamos que exista el usuario de destino del mensaje
		var criterio = {"email" : message.destino};
		
		gestorBD.getUsers(criterio, function(users, total) {
			if (users == null) {
				// Error
				res.status(500); // Server Internal Error
				res.json({
					error : "Se ha producido un error"
				});
			} else if(users.length == 0){
				// No existe el usuario de destino
				res.status(404); // Not Found
				res.json({
					error : "No existe el usuario destinatario del mensaje"
				});
			} else {
				// Existe el usuario de destino
				paso2ComprobarSonAmigos(req, res, message);
			}
		});
	}
	
	function paso2ComprobarSonAmigos(req, res, message){
		// Comprobamos que sean amigos
		var criterio = {$or: [
			{"userEmail" : message.emisor, 	"otherUserEmail" : message.destino},
			{"userEmail" : message.destino, 	"otherUserEmail" : message.emisor}
		]  };
		
		gestorBD.getFriendships(criterio, function(friendships, total) {
			if (friendships == null) {
				// Error
				res.status(500); // Server Internal Error
				res.json({
					error : "Se ha producido un error"
				});
			} else if(friendships.length == 0){
				// No son amigos
				res.status(403); // Forbidden
				res.json({
					error : "No eres amigo del destinatario del mensaje"
				});
			} else {
				// Son amigos
				paso3InsertarMensaje(req, res, message);
			}
		});
	}
	
	function paso3InsertarMensaje(req, res, message){
		gestorBD.insertMessage(message, function(id){
			 if (id == null) {
				 res.status(500);
				 res.json({
					 error : "Se ha producido un error"
				 });
			 } else {
				 res.status(201); // Created
				 res.json({
					 mensaje : "Mensaje insertado",
					 _id : id
				 });
			 }
		 });
	}
	
};