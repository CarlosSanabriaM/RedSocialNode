module.exports = {
	mongo : null,
	app : null,
	init : function(app, mongo) {
		this.mongo = mongo;
		this.app = app;
	},
	insertUser : function(user, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null, "Error al crear el usuario.");
			} else {
				// Comprueba si hay en BD un usuario con ese email
				var collection = db.collection('users');
				collection.find({"email" : user.email}).toArray(function(err, users) {
					if (err) {
						// Si se produjo un error, devolvemos null en el callback y cerramos la conexion con la BD
						funcionCallback(null, "Error al crear el usuario.");
						db.close();
					} else if(users.length == 1) {
						// Si el usuario ya existe, devolvemos null en el callback y cerramos la conexion con la BD
						funcionCallback(null, "El email ya existe. Introduzca otro.");
						db.close();
					} else{
						// Si no existe ni se produjo un error al listar los usuarios, lo insertamos
						collection.insert(user, function(err, result) {
							if (err) {
								funcionCallback(null, "Error al crear el usuario.");
							} else {
								funcionCallback(result.ops[0]._id);
							}
							db.close();
						});
					}
					// No se puede cerrar aqui la conexion con la ejecución del insertUser es asíncrona y necesita la conexión a la BD
				});
			}
		});
	},
	obtenerUsuarios : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('usuarios');
				collection.find(criterio).toArray(function(err, usuarios) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(usuarios);
					}
					db.close();
				});
			}
		});
	},
	obtenerCanciones : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
				collection.find(criterio).toArray(function(err, canciones) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(canciones);
					}
					db.close();
				});
			}
		});
	},
	obtenerCancionesPg : function(criterio, pg, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
				collection.count(function(err, count) {
					if (err) {
						funcionCallback(null);
						db.close();
					} else {
						collection.find(criterio).skip((pg - 1) * 4).limit(4) // 4 canciones por página
								.toArray(function(err, canciones) {
								
								if (err) {
									funcionCallback(null);
								} else {
									funcionCallback(canciones, count);
								}
								db.close();
							});
					}
				});
			}
		});
	},
	insertarCancion : function(cancion, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
				collection.insert(cancion, function(err, result) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(result.ops[0]._id);
					}
					db.close();
				});
			}
		});
	},
	modificarCancion : function(criterio, cancion, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
				collection.update(criterio, {
					$set : cancion
				}, function(err, result) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(result);
					}
					db.close();
				});
			}
		});
	},
	eliminarCancion : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('canciones');
				collection.remove(criterio, function(err, result) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(result);
					}
					db.close();
				});
			}
		});
	},
	insertarCompra : function(compra, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('compras');
				collection.insert(compra, function(err, result) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(result.ops[0]._id);
					}
					db.close();
				});
			}
		});
	},
	obtenerCompras : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('compras');
				collection.find(criterio).toArray(function(err, usuarios) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(usuarios);
					}
					db.close();
				});
			}
		});
	}
};