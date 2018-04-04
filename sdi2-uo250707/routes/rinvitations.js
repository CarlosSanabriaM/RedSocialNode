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
		
};