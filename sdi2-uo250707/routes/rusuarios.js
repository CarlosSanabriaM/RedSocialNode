module.exports = function(app, swig, gestorBD) {

	app.get("/signup", function(req, res){
		var response = swig.renderFile("views/signup.html", {});
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
			name : req.body.name,
			lastName : req.body.lastName,
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
	

	app.get("/identificarse", function(req, res) {
		var respuesta = swig.renderFile('views/bidentificacion.html', {});
		res.send(respuesta);
	});
	

	app.post("/identificarse", function(req, res) {
		var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
				.update(req.body.password).digest('hex');
	
		var criterio = {
			email : req.body.email,
			password : seguro
		}
		
		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				req.session.usuario = null;
				 res.redirect("/identificarse" +
						 "?mensaje=Email o password incorrecto"+
						 "&tipoMensaje=alert-danger");
			} else {
				req.session.usuario = usuarios[0].email;
				// Si habia intentado acceder a una url antes de autenticarse, le redirigimos a dicha url
				if(req.session.destino != null){
					var destino = req.session.destino;
					req.session.destino = null;
					res.redirect(destino);
				}
				else{
					 res.redirect("/publicaciones");
				}	
			}
		});
	});
	
	app.get("/desconectarse", function(req, res){
		req.session.usuario = null;
		res.redirect("/identificarse" +
				"?mensaje=Desconectado correctamente");
	});
	
};