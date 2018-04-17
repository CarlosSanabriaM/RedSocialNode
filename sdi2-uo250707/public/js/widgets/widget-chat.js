// Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=chat");

var messages;

function loadUserEmail() { //TODO - pasar a cliente.html??
	// Si el email es null y existe una cookie con el email, 
	// lo guardamos en la variable global
	if (userEmail == null && Cookies.get('userEmail') != null) {
		userEmail = Cookies.get('userEmail');
	}
	
	console.log("Usuario autenticado: " + userEmail);
	$('#userAuthenticatedAs').text("Usuario autenticado: " + userEmail);
}

function loadMessages() {
	messages = []; // vaciamos el array de mensajes
	
	// Obtenemos los mensajes pasandole el email del usuario en sesion,
	// y el email del usuario con el que estamos chateando, y
	// los cargamos en messages y en la tabla
	$.ajax({
		url : URLbase + "/conversation/message?user1="+userEmail+"&user2="+selectedFriendEmail,
		type : "GET",
		data : {},
		dataType : 'json',
		headers : {
			"token" : token
		},
		success : function(response) {
			console.log("Mensajes cargados: " + JSON.stringify(response));
			messages = response;
			updateTable(response);
		},
		error : function(error) {
			loadWidget("login");
		}
	});
}

function updateTable(messages) {
	$("#tableBody").empty(); // Vaciar la tabla

	for (i = 0; i < messages.length; i++) {
		addMessageToTable(messages[i]);
	}
}

function addMessageToTable(message) {
	// Añadimos los datos de ese mensaje a la tabla
	$("#tableBody").append(
			"<tr id="+message._id+">" + 
				"<td>" + message.texto + "</td>" + 
				"<td></td>" +    
			"</tr>");
}

// Al cargar el widget cargamos los mensajes
loadUserEmail();
loadMessages();
