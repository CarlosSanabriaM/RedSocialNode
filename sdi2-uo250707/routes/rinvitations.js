module.exports = function(app, swig, gestorBD) {

	app.get("/user/invitate/:email", function(req, res) {
		// Comprobamos que el email indicado no coincida con el email del usuario en sesion
		if(req.params.email === req.session.email){
			res.redirect("/user/list" +
	 				"?message=¡No puede enviarte una invitación de amistad a ti mismo!"+
	 				"&messageType=alert-warning");
			return;
		}
		
		// Creamos una invitación del usuario en sesión al usuario con el email indicado
		var invitation = {
			senderEmail : req.session.email, 
			receiverEmail : req.params.email 
		};
		
		gestorBD.insertInvitation(invitation, function(id, errMessage) {
			if (id == null) {
				res.redirect("/user/list" + 	// TODO - no guarda la pagina en la que estabas
		 				"?message="+ errMessage+
		 				"&messageType=alert-danger");
			} else {
				res.redirect("/user/list" +	// TODO - no guarda la pagina en la que estabas
		 				"?message=Invitación enviada correctamente." +
		 				"&messageType=alert-success");
			}
		});
	});	

	
	// TODO - mejorar
	// Variables globales
	var numAllCallbacks; 
	var numCallbacks; 

	app.get("/user/invitations", function(req, res) {
		// Hay que obtener aquellas invitaciones en las que eres el receptor
		var criterio = {
			receiverEmail : req.session.email
		};
		
		// Número de página
		var pg = parseInt(req.query.pg);
		if (req.query.pg == null || isNaN(pg)) {
			pg = 1;
		}
		
		gestorBD.getInvitationsPg(criterio, pg, function(invitations, total) {
			if (invitations == null) {
				res.redirect("/user/list" +
		 				"?message=Error al listar las invitaciones."+
		 				"&messageType=alert-danger");
			} else {

				var itemsPerPage = app.get('itemsPerPage');
				var pgUltima = Math.floor(total / itemsPerPage);
				if (total % itemsPerPage > 0) { // Sobran decimales
					pgUltima = pgUltima + 1;
				}

				numAllCallbacks = invitations.length;
				numCallbacks = 0;
				
				// Sacamos el nombre de cada usuario que ha enviado invitacion al usuario en sesion
				invitations.map(function(currentInvitation, currentIndex, invitations){
					var criterio = {"email" : currentInvitation.senderEmail};
					addSenderNameToCurrentInvitation(req, res, criterio, currentInvitation, currentIndex, invitations, pg, pgUltima);
				});
				
			}
		});
	});
	
	function addSenderNameToCurrentInvitation(req, res, criterio, currentInvitation, currentIndex, invitations, pg, pgUltima){
		
		gestorBD.getUsers(criterio, function(users) {
			if (users == null || users[0] == null){
				// Error
				res.redirect("/user/list" +
		 				"?message=Error al listar las invitaciones."+
		 				"&messageType=alert-danger");
				return; // TODO - MAL!!!
			} else {
				
				// Añadimos el nombre del sender en la posicion actual del array
				currentInvitation = currentInvitation.senderName = users[0].name;
				
				sendGetInvitationsPgResponse(req, res, invitations, pg, pgUltima);
			}
		});
	}
	
	function sendGetInvitationsPgResponse(req, res, invitations, pg, pgUltima){
		numCallbacks++;
		
		if (numCallbacks == numAllCallbacks) {	
			var respuesta = swig.renderFile('views/user/invitations.html', {
				invitations : invitations,
				pgActual : pg,
				pgUltima : pgUltima,
				email : req.session.email
			});
			res.send(respuesta);
		}
	}
	
};