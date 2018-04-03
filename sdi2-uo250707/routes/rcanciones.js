module.exports = function(app, swig, gestorBD) {
	
	app.get('/canciones/agregar', function(req, res) {
		var respuesta = swig.renderFile('views/bagregar.html', {});
		res.send(respuesta);
	});
	
	app.get("/nuevas/canciones", function(req, res) {
		
		var canciones = [ {
			"nombre" : "Blank space",
			"precio" : "1.2"
		}, {
			"nombre" : "See you again",
			"precio" : "1.3"
		}, {
			"nombre" : "Uptown Funk",
			"precio" : "1.1"
		} ];
		
		var respuesta = swig.renderFile('views/btienda.html', {
			vendedor : 'Tienda de canciones',
			canciones : canciones
		});
		
		res.send(respuesta);
		
	});
		
	app.post("/cancion", function(req, res) {
		var cancion = {
			nombre : req.body.nombre,
			genero : req.body.genero,
			precio : req.body.precio,
			autor  : req.session.usuario
		};
		// Insetamos la canción
		gestorBD.insertarCancion(cancion, function(id) {
			if (id == null) {
				res.redirect("/canciones/agregar" +
		 				"?mensaje=Error al insertar la canción"+
		 				"&tipoMensaje=alert-danger");
			} else {
				// Si insertó con exito la canción y hay portada, la guardamos
				if (req.files.portada != null) {
					var imagen = req.files.portada;
					imagen.mv('public/portadas/' + id + '.png', function(err) {
						if (err) {
							res.redirect("/canciones/agregar" +
					 				"?mensaje=Error al subir la portada"+
					 				"&tipoMensaje=alert-danger");
						} else {
							// Si guardo con exito la portada y hay audio, lo guardamos
							if (req.files.audio != null) {
								 var audio = req.files.audio;
								 audio.mv('public/audios/'+id+'.mp3', function(err) {
									 if (err) {
										 res.redirect("/canciones/agregar" +
									 				"?mensaje=Error al subir el audio"+
									 				"&tipoMensaje=alert-danger");
									 } else {
										 res.redirect("/publicaciones" +
									 				"?mensaje=Canción agregada correctamente"+
							 						"&tipoMensaje=alert-success");
									 }
								 });
							}
						}
					});
				}
			}
		});
	});
	
	app.get("/tienda", function(req, res) {
		var criterio = {};

		if(req.query.busqueda != null){
			criterio = { "nombre" : {$regex : ".*"+req.query.busqueda+".*"} };
		}
		
		var pg = parseInt(req.query.pg); // Es String !!!
		if (req.query.pg == null || isNaN(pg)) { // Puede no venir el param
			pg = 1;
		}
		
		gestorBD.obtenerCancionesPg(criterio, pg, function(canciones, total) {
			if (canciones == null) {
				res.redirect("/identificarse" +
		 				"?mensaje=Error al listar las canciones"+
		 				"&tipoMensaje=alert-danger");
			} else {

				var pgUltima = Math.floor(total / 4); // 4 canciones por página
				if (total % 4 > 0) { // Sobran decimales
					pgUltima = pgUltima + 1;
				}

				var respuesta = swig.renderFile('views/btienda.html', {
					canciones : canciones,
					pgActual : pg,
					pgUltima : pgUltima
				});
				res.send(respuesta);
			}
		});
	});
	
	app.get("/publicaciones", function(req, res) {
		var criterio = { autor : req.session.usuario	};
		
		gestorBD.obtenerCanciones(criterio, function(canciones) {
			if (canciones == null) {
				res.redirect("/identificarse" +
		 				"?mensaje=Error al listar las canciones"+
		 				"&tipoMensaje=alert-danger");
			} else {
				var respuesta = swig.renderFile('views/bpublicaciones.html', {
					canciones : canciones
				});
				res.send(respuesta);
			}
		});
	});
	
	app.get('/cancion/:id', function(req, res) {
		var id = req.params.id;		
		var criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
		
		gestorBD.obtenerCanciones(criterio, function(canciones){
			// Si hubo un error o la cancion no existe
			if(canciones == null || canciones[0] == null){ // que la lista de canciones devuelta sea vacia se considera un error, ya que se está buscando una canción con ese id, y si no existe es un error
				res.redirect("/tienda" +
		 				"?mensaje=Error al mostrar la canción"+
		 				"&tipoMensaje=alert-danger");
			}else{
				mostrarDetallesCancion(res, canciones, id);
			}
		});
	});
	
	function mostrarDetallesCancion(res, canciones, cancionId) {
		// Comprobamos si la canción ha sido comprada, para indicarselo a la vista
		var criterio = { "cancionId" : gestorBD.mongo.ObjectID(cancionId) };
		
		gestorBD.obtenerCompras(criterio, function(compras) {
			// Hubo un error
			if (compras == null) {
				res.redirect("/tienda" +
		 				"?mensaje=Error al mostrar la canción"+
		 				"&tipoMensaje=alert-danger");
			}
			else{
				comprada = false;
				if(compras.length >= 1)
					comprada = true;
					
				var respuesta = swig.renderFile('views/bcancion.html',
				{
					cancion : canciones[0],
					comprada : comprada
				});
				res.send(respuesta);
			}
		});
	}

	app.get('/cancion/modificar/:id', function(req, res) {
		var id = req.params.id;
		var criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
		
		gestorBD.obtenerCanciones(criterio, function(canciones) {
			if (canciones == null){ // aqui no se comprueba que la lista sea vacia, ya que esto se comprueba en el routerUsuarioAutor, y nos redirige a /tienda en ese caso.
				res.redirect("/publicaciones" +
		 				"?mensaje=Error al intentar modificar la canción"+
		 				"&tipoMensaje=alert-danger");
			} else {
				var respuesta = swig.renderFile('views/bcancionModificar.html',
				{
					cancion : canciones[0]
				});
				res.send(respuesta);
			}
		});
	});
	
	app.post('/cancion/modificar/:id', function(req, res) {
		var id = req.params.id;
		var criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
		
		var cancion = {
			nombre : req.body.nombre,
			genero : req.body.genero,
			precio : req.body.precio
		}
		
		gestorBD.modificarCancion(criterio, cancion, function(result) {
			if (result == null) {
				res.redirect("/publicaciones" +
		 				"?mensaje=Error al modificar la canción"+
		 				"&tipoMensaje=alert-danger");
			} else {
				paso1ModificarPortada(req.files, id, function(result) {
					if (result == null) {
						res.redirect("/publicaciones" +
				 				"?mensaje=Error al modificar la canción"+
				 				"&tipoMensaje=alert-danger");
					} else {
						res.redirect("/publicaciones");
					}
				});
			}
		});
	});

	function paso1ModificarPortada(files, id, callback) {
		if (files.portada != null) {
			var imagen = files.portada;
			imagen.mv('public/portadas/' + id + '.png', function(err) {
				if (err) {
					callback(null); // ERROR
				} else {
					paso2ModificarAudio(files, id, callback); // SIGUIENTE
				}
			});
		} else {
			paso2ModificarAudio(files, id, callback); // SIGUIENTE
		}
	}
		
	function paso2ModificarAudio(files, id, callback) {
		if (files.audio != null) {
			var audio = files.audio;
			audio.mv('public/audios/' + id + '.mp3', function(err) {
				if (err) {
					callback(null); // ERROR
				} else {
					callback(true); // FIN
				}
			});
		} else {
			callback(true); // FIN
		}
	}
	

	app.get('/cancion/eliminar/:id', function(req, res) {
		var id = req.params.id;		
		var criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
		
		gestorBD.eliminarCancion(criterio, function(canciones) {
			if (canciones == null) {
				res.redirect("/publicaciones" +
		 				"?mensaje=Error al eliminar la canción"+
		 				"&tipoMensaje=alert-danger");
			} else {
				res.redirect("/publicaciones" +
		 				"?mensaje=Canción eliminada correctamente"+
		 				"&tipoMensaje=alert-success");
			}
		});
	});
	
	app.get('/cancion/comprar/:id', function(req, res) {
		var cancionId = gestorBD.mongo.ObjectID(req.params.id);
		var compra = {
			usuario : req.session.usuario,
			cancionId : cancionId
		}
		
		// Antes de insertar la compra, comprobamos que no exista ya y que el usuario no sea su autor
		var criterio = { "usuario" : compra.usuario, "cancionId" : compra.cancionId };
		
		gestorBD.obtenerCompras(criterio, function(compras) {
			// Hubo un error
			if (compras == null) {
				res.redirect("/tienda" +
		 				"?mensaje=Error al comprar la canción."+
		 				"&tipoMensaje=alert-danger");
			}
			else{
				paso1ComprobarNoComprada(compras, compra, function(result, mensaje) {
					// Hubo algún error
					if (result == null) {
						res.redirect("/tienda" +
				 				"?mensaje="+ mensaje +
				 				"&tipoMensaje=alert-danger");
					} 
					// No hubo errores, la canción no ha sido comprada, y el usuario no es su autor
					else {
						paso4InsertarCompra(res, compra);
					}
				});
			}

		});
		
	});

	function paso1ComprobarNoComprada(compras, compra, callback) {
		// Ya existe la compra
		if(compras.length >= 1){
			callback(null, "Error al comprar la canción. Esa canción ya había sido comprada."); // ERROR
		}
		// No existe la compra
		else{
			paso2ComprobarExisteCancion(compra, callback); // SIGUIENTE
		}
	}
	
	function paso2ComprobarExisteCancion(compra, callback) {
		// Antes de insertar la compra, comprobamos que exista la canción
		var criterio = { "_id" : compra.cancionId };
		
		gestorBD.obtenerCanciones(criterio, function(canciones) {
			if (canciones == null){
				callback(null, "Error al comprar la canción.");
			} else {
				// No existe ninguna canción con ese id
				if(canciones.length == 0){
					callback(null, "Error al comprar la canción. La canción indicada no existe."); // ERROR
				}
				// Existe la canción
				else{
					paso3ComprobarNoAutor(canciones, compra, callback); // SIGUIENTE
				}
			}
		});
	}
	
	function paso3ComprobarNoAutor(canciones, compra, callback) {		
		// El usuario es el autor de la canción
		if (canciones[0].autor === compra.usuario){
			callback(null, "Error al comprar la canción. No puedes comprar una canción de la cual eres su autor."); // ERROR
		}
		// El usuario NO es el autor de la canción
		else{
			callback(true); // FIN
		}
	}
	
	function paso4InsertarCompra(res, compra){
		// La insertamos
		gestorBD.insertarCompra(compra, function(idCompra) {
			// Hubo un error
			if (idCompra == null) {
				res.redirect("/tienda" +
		 				"?mensaje=Error al comprar la canción"+
		 				"&tipoMensaje=alert-danger");
			} 
			// Se insertó correctamente
			else {
				res.redirect("/compras" +
		 				"?mensaje=Canción comprada correctamente"+
		 				"&tipoMensaje=alert-success");
			}
		});
	}
	
	app.get('/compras', function(req, res) {
		var criterio = { "usuario" : req.session.usuario };
		
		gestorBD.obtenerCompras(criterio, function(compras) {
			if (compras == null) {
				res.redirect("/tienda" +
		 				"?mensaje=Error al listar tus canciones compradas."+
		 				"&tipoMensaje=alert-danger");
			} else {
				var cancionesCompradasIds = [];
				for (i = 0; i < compras.length; i++)
					cancionesCompradasIds.push(compras[i].cancionId);
				
				var criterio = { "_id" : { $in : cancionesCompradasIds } }
				
				gestorBD.obtenerCanciones(criterio, function(canciones) {
					var respuesta = swig.renderFile('views/bcompras.html', {
						canciones : canciones
					});
					res.send(respuesta);
				});
			}
		});
		
	});
	
};