// Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=friends");

var friends; // TODO - guardar emails solo, o toda la info de los amigos??

function loadUserEmail() {
	// Si el email es null y existe una cookie con el email, 
	// lo guardamos en la variable global
	if (userEmail == null && Cookies.get('userEmail') != null) {
		userEmail = Cookies.get('userEmail');
	}
	
	console.log("Usuario autenticado: " + userEmail);
	$('#userAuthenticatedAs').text("Usuario autenticado: " + userEmail);
}

function loadFriends() {
	friends = []; // vaciamos el array de amigos
	
	// Obtenemos los emails, y por cada uno de ellos,
	// obtenemos sus datos y los cargamos en friends y en la tabla
	$.ajax({
		url : URLbase + "/friend",
		type : "GET",
		data : {},
		dataType : 'json',
		headers : {
			"token" : token
		},
		success : function(response) {
			console.log("Emails amigos: " + JSON.stringify(response));
			var friendsEmails = response;
			loadFriendsDataAndUpdateTable(friendsEmails);
		},
		error : function(error) {
			loadWidget("login");
		}
	});
}

function loadFriendsDataAndUpdateTable(friendsEmailsToShow) {
	// Para cada email, lo cargamos en friends y en la tabla
	$("#tableBody").empty(); // Vaciar la tabla

	for (i = 0; i < friendsEmailsToShow.length; i++) {
		// Para cada email de un usuario amigo, sacamos todos sus datos
		// y los añadimos a una fila de la tabla
		loadUserDataAndAddToTable(friendsEmailsToShow[i]);
	}
}

function loadUserDataAndAddToTable(email) {
	// Cargamos los datos del usuario con ese email,
	// y lo añadimos a friends y a la tabla
	$.ajax({
		url : URLbase + "/user/" + email,
		type : "GET",
		data : {},
		dataType : 'json',
		headers : {
			"token" : token
		},
		success : function(response) {
			console.log("User with email '"+email+
					"' data: "+JSON.stringify(response));
			
			friends.push(response); // se añade el amigo a la lista
			addUserToTable(response);// y a la tabla
		},
		error : function(error) {
			loadWidget("login");
		}
	});
}

function addUserToTable(user) {
	// Añadimos los datos de ese usuario a la tabla
	$("#tableBody").append(
			"<tr id="+user.email+">" + 
				"<td>" + user.name + "</td>" + 
				"<td>" + user.email + "</td>" +  
				"<td>" + 
					"<a onclick=chat('" + user.email + "')>Chat</a><br>" +  
				"</td>" + 
			"</tr>");
}

function updateTable(friendsToShow) {
	$("#tableBody").empty(); // Vaciar la tabla

	// Para cada uno de los amigos a mostrar, lo añadimos directamente
	// a la tabla (son amigos, no emails, no hace falta pedir los datos)
	for (i = 0; i < friendsToShow.length; i++) {
		addUserToTable(friendsToShow[i]);
	}
}

// Escuchador del input 'nameFilter'
$('#filterName').on('input', function(e) {
	var filteredFriends = [];
	var filterName = $("#filterName").val();

	// TODO - modificar para que sea insensible a mayusculas y minusculas?? O mejor, añadir un checbox para que lo decida el usuario
	
	for (i = 0; i < friends.length; i++) {
		// indexOf() retorna -1 si el valor buscado no se encuentra en el string
		if (friends[i].name.indexOf(filterName) != -1) {
			filteredFriends.push(friends[i]);
		}
	}
	updateTable(filteredFriends);
});

function chat(email) {
	selectedFriendEmail = email; // Variable global
	loadWidget("chat");
}

function updateFriends() {
	$('#filterName').val("");
	loadFriends();
}

// TODO - usarlo para ordenar por numero de mensajes --> Meterlo en una especie de bucle que se llame cada N segundos
//var precioDsc = false;
//
//function ordenarPorPrecio() {
//	if (precioDsc) {
//		friends.sort(function(a, b) {
//			return parseFloat(b.precio) - parseFloat(a.precio);
//		});
//	} else {
//		friends.sort(function(a, b) {
//			return parseFloat(a.precio) - parseFloat(b.precio);
//		});
//	}
//	loadFriendsDataAndUpdateTable(friends);
//	precioDsc = !precioDsc; //invertir
//}

// Al cargar el widget cargamos las amigos
loadFriends();
loadUserEmail();
