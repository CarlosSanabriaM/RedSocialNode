// Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=friends");

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
				"<td><a onclick=chat('" + user.email + "')>" + user.name + "</a></td>" + 
				"<td>" + user.email + "</td>" +  
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
	Cookies.set('selectedFriendEmail', email); // lo guardamos en una cookie
	Cookies.set('friends', friends); // lo guardamos en una cookie
	loadWidget("chat");
}

// TODO - usarlo para ordenar por numero de mensajes --> Meterlo en un setInverval(function, TIME)
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
