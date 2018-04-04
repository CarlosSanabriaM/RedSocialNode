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
						// Si se produjo un error, devolvemos error
						funcionCallback(null, "Error al crear el usuario.");
						db.close();
					} else if(users.length == 1) {
						// Si el usuario ya existe, devolvemos error
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
	getUsers : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('users');
				collection.find(criterio).toArray(function(err, users) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(users);
					}
					db.close();
				});
			}
		});
	},
	getUsersPg : function(criterio, pg, funcionCallback) {
		var itemsPerPage = this.app.get('itemsPerPage');
		
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('users');
				collection.count(criterio, function(err, count) { //TODO- se supone que es equivalente a find(criterio).count(callback)
					if (err) {
						funcionCallback(null);
						db.close();
					} else {
						collection.find(criterio).skip((pg - 1) * itemsPerPage).limit(itemsPerPage) 
								.toArray(function(err, users) {
								
								if (err) {
									funcionCallback(null);
								} else {
									funcionCallback(users, count);
								}
								db.close();
							});
					}
				});
			}
		});
	},
	
	insertInvitation : function(invitation, funcionCallback) {
		var mySelf = this;
		
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null, "Error al enviar la invitación."); // ERROR
			} else {
				mySelf.paso1ComprobarExisteReceiver(db, invitation, funcionCallback); // SIGUIENTE
			}
		});
	},
	paso1ComprobarExisteReceiver : function(db, invitation, funcionCallback){
		var mySelf = this;
		
		// Comprobamos que exista el usuario con ese 'receiverEmail'
		var collection = db.collection('users');
		collection.find({"email" : invitation.receiverEmail}).toArray(function(err, users) {
			if (err) {
				// Si se produjo un error, devolvemos error
				funcionCallback(null, "Error al enviar la invitación."); // ERROR
				db.close();
			} else if(users.length == 0) {
				// Si el usuario NO existe, devolvemos error
				funcionCallback(null, "Error al enviar la invitación. ¡No existe ningún usuario con ese email!"); // ERROR
				db.close();
			} else{					
				mySelf.paso2ComprobarNoExisteInvitacion(db, invitation, funcionCallback); // SIGUIENTE
			}
		});
	},
	paso2ComprobarNoExisteInvitacion : function(db, invitation, funcionCallback){
		var mySelf = this;
		
		// Comprobamos que no exista ya la invitacion
		var collection = db.collection('invitations');
		collection.find(invitation).toArray(function(err, invitations) {
			if (err) {
				// Si se produjo un error, devolvemos error
				funcionCallback(null, "Error al enviar la invitación."); // ERROR
				db.close();
			} else if(invitations.length == 1) {
				// Si ya existe la invitación, devolvemos error
				funcionCallback(null, "Error al enviar la invitación. ¡Ya has enviado una invitación de amistad a ese usuario!"); // ERROR
				db.close();
			} else{					
				mySelf.paso3ComprobarNoSonAmigos(db, invitation, funcionCallback); // SIGUIENTE
			}
		});
	},
	paso3ComprobarNoSonAmigos : function(db, invitation, funcionCallback){
		var mySelf = this;
		
		// Comprobamos que no sean amigos
		var criterio = {$or: [
			{"userEmail" : invitation.senderEmail, 	"otherUserEmail" : invitation.receiverEmail},
			{"userEmail" : invitation.receiverEmail, "otherUserEmail" : invitation.senderEmail}
		]  };
		
		var collection = db.collection('friends');
		collection.find(criterio).toArray(function(err, friends) {
			if (err) {
				// Si se produjo un error, devolvemos error
				funcionCallback(null, "Error al enviar la invitación."); // ERROR
				db.close();
			} else if(friends.length == 1) {
				// Si ya existe la amistad, devolvemos error
				funcionCallback(null, "Error al enviar la invitación. ¡Ese usuario y tu ya sois amigos!"); // ERROR
				db.close();
			} else{					
				mySelf.paso4InsertarInvitacion(db, invitation, funcionCallback); // SIGUIENTE
			}
		});
	},
	paso4InsertarInvitacion : function(db, invitation, funcionCallback){
		var mySelf = this;
		
		// Guardamos la invitacion
		var collection = db.collection('invitations');		
		collection.insert(invitation, function(err, result) {
			if (err) {
				funcionCallback(null, "Error al enviar la invitación."); // ERROR
			} else {
				funcionCallback(result.ops[0]._id); // FIN
			}
			db.close();
		});
	},
	getInvitationsPg : function(criterio, pg, funcionCallback) {
		var itemsPerPage = this.app.get('itemsPerPage');
		
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('invitations');
				collection.count(criterio, function(err, count) {
					if (err) {
						funcionCallback(null);
						db.close();
					} else {
						collection.find(criterio).skip((pg - 1) * itemsPerPage).limit(itemsPerPage) 
								.toArray(function(err, invitations) {
								
								if (err) {
									funcionCallback(null);
								} else {
									funcionCallback(invitations, count);
								}
								db.close();
							});
					}
				});
			}
		});
	},
	
	// TODO quitar cuando se acabe
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
	}
};