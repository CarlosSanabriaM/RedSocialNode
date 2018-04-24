// Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=chat");

var messages;
var nameUserChatWith;

function loadUserEmail() { //TODO - pasar a cliente.html??
	// Si el email es null y existe una cookie con el email, 
	// lo guardamos en la variable global
	if (userEmail == null && Cookies.get('userEmail') != null) {
		userEmail = Cookies.get('userEmail');
	}
	
	console.log("Usuario autenticado: " + userEmail);
	$('#userAuthenticatedAs').text("Usuario autenticado: " + userEmail);
}

function loadUserChatWithEmail() {
	// Si el email y/o la lista de emails de los amigos es null y existe una cookie, 
	// recuperamos su valor de ella
	if (friends == null && Cookies.get('friends') != null) {
		friends = Cookies.get('friends');
	}
	if (selectedFriendEmail == null && Cookies.get('selectedFriendEmail') != null) {
		selectedFriendEmail = Cookies.get('selectedFriendEmail');
	}
}

function loadUserChatWithName() {
	// Si el nombre del amigo con el que chateas es null y existe una cookie, 
	// recuperamos su valor de ella
	if(nameUserChatWith == null && Cookies.get('nameUserChatWith') != null) {
		nameUserChatWith = Cookies.get('nameUserChatWith');
	}
	else{
		// Si no, sacamos el nombre del usuario con el que estamos chateando
		// de la lista de amigos, usando el email del usuario con el que estamos chateando
		for (i = 0; i < friends.length; i++) {
			if(friends[i].email == selectedFriendEmail){
				nameUserChatWith = friends[i].name;
				Cookies.set('nameUserChatWith', nameUserChatWith);
				break;
			}
		}
	}
	
	console.log("Nombre usuario con el que chateas: " + nameUserChatWith);
	$('#nameUserChatWith').text(nameUserChatWith);
}

function loadMessages() {
	messages = []; // vaciamos el array de mensajes
	
	// Obtenemos los mensajes pasandole el email del usuario en sesion,
	// y el email del usuario con el que estamos chateando, y
	// los cargamos en messages y en la tabla
	$.ajax({
		url : URLbase + "/message?user1="+userEmail+"&user2="+selectedFriendEmail,
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
			// Dejamos de hacer peticiones al SW cuando se produce
			// un error, como por ejemplo, caduca el token de sesión
            clearInterval(refreshIntervalId);
			loadWidget("login");// TODO - aqui se podria parar el setInterval??
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
	var tableBody;
	
	// Si el receptor del mensaje es el usuario en sesion
	// el mensaje se muestra en la columna de la izquierda
	if(message.destino.includes(userEmail)){
		tableBody = "<tr id="+message._id+">" + 
						"<td><span class='alert alert-info chatMessage'>" + message.texto + "</span></td>" +
						"<td></td>" +    
					"</tr>";
	} else{
		//Si no, se muestra en la columna de la derecha
		tableBody = "<tr id="+message._id+">" + 
						"<td></td>" + 
						"<td><span class='alert alert-success chatMessage'>" + message.texto + "</span></td>" +
					"</tr>";
	}
		
	$("#tableBody").append(tableBody);
}

// Al cargar el widget cargamos los mensajes
loadUserEmail();
loadUserChatWithEmail();
loadUserChatWithName();
loadMessages();

// Cada N segundos se va a realizar una llamada al SW para comprobar si hay nuevos mensajes
var refreshIntervalId = setInterval(function(){
	loadMessages();
}, UPDATE_TIME);
