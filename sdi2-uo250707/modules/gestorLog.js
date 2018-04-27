module.exports = {
	app : null,
	logger : null,
	init : function(app, logger) {
		this.app = app;
		this.logger = logger;
	},
	newUserHasSignedUp : function(email) {
		this.logger.info("Un nuevo usuario se ha registrado con el siguiente email: '"+ email +"'.");
	},
	userHasLoggedIn : function(email) {
		this.logger.info("El usuario con email '"+ email +"' ha iniciado sesión.");
	},
	userHasLoggedOut : function(email) {
		this.logger.info("El usuario con email '"+ email +"' se ha desconectado.");
	},
	userList : function(email, pg, users) {
		var usersEmails = users.map(function(currentUser){
			return currentUser.email;
		});
		
		this.logger.info("El usuario con email '"+ email +"' ha realizado un listado del resto de usuarios. "
				+ "El resultado de dicho listado en la página "+ pg +" "
				+ "(con número máximo de usuarios por página de "+ this.app.get('itemsPerPage') +") "
				+ "ha retornado los usuarios con los siguientes emails: {" + usersEmails +"}");
	},
	userListSearchByEmailAndName : function(email, searchText, pg, users) {
		var usersEmails = users.map(function(currentUser){
			return currentUser.email;
		});
		
		this.logger.info("El usuario con email '"+email+"' ha realizado un listado del resto de usuarios en base "
				+ "a una búsqueda por email o nombre con el siguiente texto: '"+ searchText +"'. "
				+ "El resultado de dicha búsqueda en la página "+ pg +" "
				+ "(con número máximo de usuarios por página de "+ this.app.get('itemsPerPage') +") "
				+ "ha retornado los usuarios con los siguientes emails: {" + usersEmails +"}");
	},
	userListHisFriends : function(email, pg, friendsEmails) {
		this.logger.info("El usuario con email '"+ email +"' ha realizado un listado de sus amigos. "
				+ "El resultado de dicho listado en la página "+ pg +" "
				+ "(con número máximo de usuarios por página de "+ this.app.get('itemsPerPage') +") "
				+ "ha retornado los usuarios con los siguientes emails: {" + friendsEmails +"}");
	},
	userListHisInvitations : function(email, pg, invitations) {
		var usersEmails = invitations.map(function(currentInvitation){
			return currentInvitation.senderEmail;
		});
		
		this.logger.info("El usuario con email '"+ email +"' ha realizado un listado de sus invitaciones de amistad recibidas. "
				+ "El resultado de dicho listado en la página "+ pg +" "
				+ "(con número máximo de usuarios por página de "+ this.app.get('itemsPerPage') +") "
				+ "ha retornado las invitaciones de los usuarios con los siguientes emails: {" + usersEmails +"}");
	},
	userSendsInvitation : function(senderEmail, receiverEmail) {
		this.logger.info("El usuario con email '"+ senderEmail +"' ha mandado una invitación de amistad "
				+ "al usuario con email '"+ receiverEmail +"'.");
	},
	userAcceptsInvitation : function(receiverEmail, senderEmail) {
		this.logger.info("El usuario con email '"+ receiverEmail +"' ha aceptado la invitación de amistad "
				+ "del usuario con email '"+ senderEmail +"'. Ahora pasan a ser amigos.");
	},
	error : function(errorMessage) {
		this.logger.warn(errorMessage);
	}
};


