module.exports = function(app, swig, gestorBD) {

	app.get("/signup", function(req, res){
		var response = swig.renderFile("views/signup.html", {});
		res.send(response);
	});
	
	app.post('/signup', function(req, res){
		var encryptedPassword = app.get("crypto").createHmac('sha256', app.get('key'))
				.update(req.body.password).digest('hex');
		
		var usuario = {
			email : req.body.email,
			name : req.body.name,
			lastName : req.body.lastName,
			password : encryptedPassword
		}
		
		
		
		gestorBD.insertarUsuario(usuario, function(id) {
			if (id == null) {
				res.send("Error al insertar usuario");
			} else {
				res.send('Usuario Insertado ' + id); //TODO - redirigir a la vista ppal
			}
		});
	});
	

	app.get("/identificarse", function(req, res) {
		var respuesta = swig.renderFile('views/bidentificacion.html', {});
		res.send(respuesta);
	});
	

	app.post("/identificarse", function(req, res) {
		var seguro = app.get("crypto").createHmac('sha256', app.get('key'))
				.update(req.body.password).digest('hex');
	
		var criterio = {
			username : req.body.username,
			password : seguro
		}
		
		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				req.session.usuario = null;
//				res.send("No identificado");
				// Si no se pudo identificar, le llevamos al login de nuevo
				res.redirect("/identificarse");
			} else {
				req.session.usuario = usuarios[0].username;
				// Si habia intentado acceder a una url antes de autenticarse, le redirigimos a dicha url
				if(req.session.destino != null){
					var destino = req.session.destino;
					req.session.destino = null;
					res.redirect(destino);
				}
				else{
					res.redirect("/comentarios/listar");
				}	
			}
		});
	});
	
	app.get("/desconectarse", function(req, res){
		req.session.usuario = null;
		res.redirect("/identificarse");
	});
	
};