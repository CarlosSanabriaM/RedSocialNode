module.exports = function(app, swig, gestorBD) {
	
	var gestorLog = app.get('gestorLog');

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
				res.redirect("/user/list" +
		 				"?message="+ errMessage+
		 				"&messageType=alert-danger");
			} else {
				gestorLog.userSendsInvitation(invitation.senderEmail, invitation.receiverEmail);
				
				res.redirect("/user/list" +
		 				"?message=Invitación enviada correctamente." +
		 				"&messageType=alert-success");
			}
		});
	});	

	app.get("/user/invitations", function(req, res) {
		// Obtenemos aquellas invitaciones en las que el usuario en sesion es el receptor
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
				
				paso1ObtenerSenderUsers(req, res, invitations, pg, pgUltima);
			}
		});
	});
	
	function paso1ObtenerSenderUsers(req, res, invitations, pg, pgUltima){
		// Sacamos el email de cada usuario que ha enviado invitacion al usuario en sesion
		var senderEmails = invitations.map(function(currentInvitation) {
			return currentInvitation.senderEmail;
		});
		
		// Obtenemos los usuarios con esos emails
		var criterio = { "email" : { "$in" : senderEmails } };
		
		gestorBD.getUsers(criterio, function(senderUsers) {
			if (senderUsers == null){
				res.redirect("/user/list" +
		 				"?message=Error al listar las invitaciones."+
		 				"&messageType=alert-danger");
			} else {
				paso2AniadirSenderUsersAInvitaciones(req, res, invitations, senderUsers, pg, pgUltima);
			}
		});
	}
	
	function paso2AniadirSenderUsersAInvitaciones(req, res, invitations, senderUsers, pg, pgUltima){
		invitations.forEach(function(invitation){
			senderUsers.some(function(senderUser){ // "some" deja de iterar por los senderUses cuando se retorna true
				if(senderUser.email == invitation.senderEmail){
					invitation.senderUser = senderUser;
					return true;
				} 
			});
		});
		
		paso3MostrarInvitaciones(req, res, invitations, pg, pgUltima);
	}

	function paso3MostrarInvitaciones(req, res, invitations, pg, pgUltima){
		gestorLog.userListHisInvitations(req.session.email, pg, invitations);	
		
		var respuesta = swig.renderFile('views/user/invitations.html', {
			invitations : invitations,
			pgActual : pg,
			pgUltima : pgUltima,
			email : req.session.email
		});
		res.send(respuesta);
	}
	
	app.get("/user/accept/:idInvitation", function(req, res) {	
		var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.idInvitation) };
		
		// Obtenemos la invitacion con ese id, y comprobamos que el usuario en sesion sea el receiver de la invitacion
		gestorBD.getInvitations(criterio, function(invitations) {
			if (invitations == null){
				// Error
				res.redirect("/user/invitations" +
		 				"?message=Error al aceptar la invitación de amistad."+
		 				"&messageType=alert-danger");
			} else if(invitations.length == 0) {
				// No existe una invitacion con ese id
				res.redirect("/user/invitations" +
		 				"?message=Esa invitación de amistad no existe."+
		 				"&messageType=alert-danger");
			} else {
				// Existe una invitacion con ese id
				paso1ComprobarUsuarioEnSesionEsReceptorDeLaInvitacion(req, res, invitations[0]);	
			}
		});
	});	
	
	function paso1ComprobarUsuarioEnSesionEsReceptorDeLaInvitacion(req, res, invitation){
		if(invitation.receiverEmail != req.session.email){
			res.redirect("/user/invitations" +
	 				"?message=¡No puedes aceptar una invitación de amistad que no te han enviado a ti!"+
	 				"&messageType=alert-danger");
		} else{
			//Si el usuario en sesion es el receptor de la invitación, creamos la amistad y eliminamos la invitacion
			paso2CrearAmistad(req, res, invitation);
		}
	}
	
	function paso2CrearAmistad(req, res, invitation) {
		// Creamos la relación de amistad
		var friendship = {
			"userEmail" : invitation.senderEmail,
			"otherUserEmail" : invitation.receiverEmail
		};
		
		gestorBD.insertFriendship(friendship, function(id) {
			if (id == null) {
				res.redirect("/user/invitations" +
						"?message=Error al aceptar la invitación de amistad."+
		 				"&messageType=alert-danger");
			} else {
				paso3EliminarInvitacion(req, res, invitation);
			}
		});
	}
	
	function paso3EliminarInvitacion(req, res, invitation){
		var criterio = invitation;
		
		gestorBD.removeInvitation(criterio, function(invitations) {
			if (invitations == null) {
				res.redirect("/user/invitations" +
						"?message=Usuario agregado como amigo correctamente, pero no se ha podido borrar la invitación de amistad."+
		 				"&messageType=alert-warning");
			} else {
				gestorLog.userAcceptsInvitation(invitation.receiverEmail, invitation.senderEmail);
				
				res.redirect("/user/friends" +
						"?message=Usuario agregado como amigo correctamente." +
						"&messageType=alert-success"); 
			}
		});
	}
	
};