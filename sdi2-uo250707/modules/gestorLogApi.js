module.exports = {
	app : null,
	logger : null,
	init : function(app, logger) {
		this.app = app;
		this.logger = logger;
	},
	userHasAuthenticated : function(email) {
		this.logger.info("El usuario con email '"+ email +"' se ha autenticado " +
			"y se le ha devuelto un token de seguridad.");
	},
	userListHisFriends : function(email, friendsEmails) {
		this.logger.info("El usuario con email '"+ email +"' ha accedido a su lista de amigos, "
				+ "siendo sus emails los siguientes: {" + friendsEmails +"}");
	},
    userSendsMessage : function(senderEmail, receiverEmail) {
		this.logger.info("El usuario con email '"+ senderEmail +"' ha mandado un mensaje "
				+ "al usuario con email '"+ receiverEmail +"'.");
	},
    userGetsHisMessagesWith : function(userEmail, friendEmail) {
        this.logger.info("El usuario con email '"+ userEmail +"' ha obtenido todos "
            + "los mensajes intercambiados con un amigo suyo, cuyo email es '"+ friendEmail +"'.");
    },
    userMarkMessageAsRead : function(userEmail, messageId) {
        this.logger.info("El usuario con email '"+ userEmail +"' ha marcado como leído "
            + "el mensaje con id '"+ messageId +"'.");
    }
};


