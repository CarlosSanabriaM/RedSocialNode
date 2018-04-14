// Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=friends");

var friends;

function loadFriends() {
	$.ajax({
		url : URLbase + "/friend",
		type : "GET",
		data : {},
		dataType : 'json',
		headers : {
			"token" : token
		},
		success : function(response) {
			console.log(response);
			friends = response;
			updateTable(friends);
		},
		error : function(error) {
			loadWidget("login");
		}
	});
}

function updateTable(friendsToShow) {
	$("#tableBody").empty(); // Vaciar la tabla

	for (i = 0; i < friendsToShow.length; i++) {
		$("#tableBody").append(
				"<tr id="+friendsToShow[i]._id+">" + 
					"<td>" + friendsToShow[i].name + "</td>" + 
					"<td>" + friendsToShow[i].email + "</td>" +  
					"<td>" + 
						"<a onclick=chat('" + friendsToShow[i]._id + "')>Chat</a><br>" +  
					"</td>" + 
				"</tr>");
	}
}

function chat(_id) {
	selectedFriendId = _id; // Variable global
	loadWidget("chat");
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
//	updateTable(friends);
//	precioDsc = !precioDsc; //invertir
//}

// Al cargar el widget cargamos las amigos
loadFriends();