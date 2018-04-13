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
					autenticado : false,
					message : "Inicio de sesión no correcto"
				});
			} else {
				// El token consiste en el email del usuario y la fecha actual 
				// en segundas, todo ello encriptado
				var token = app.get('jwt').sign(
						{usuario: criterio.email , tiempo: Date.now()/1000},
						"secreto");
				
				res.status(200);// OK
				res.json({
					autenticado: true,
					token : token
				});
			}
		});
	});
	
};