// Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=chat");

var messages;
var nameUserChatWith;

function errorProduced(){
    // Dejamos de hacer peticiones al SW cuando se produce
    // un error, como por ejemplo, caduca el token de sesión
    updateMessages = false;
    loadWidget("login");
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

    console.log("Email usuario con el que chateas: " + selectedFriendEmail);
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
	$('#nameUserChatWith').text("Chat con el usuario: " + nameUserChatWith);
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
			console.log("Número mensajes cargados: " + response.length);
			messages = response;
			updateTable(response);
		},
		error : function(error) {
            errorProduced();
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

	// Si el mensaje está marcado como leido, tenemos que añadirle el texto <leido>
	var messageText = message.texto;
	if(message.leido)
        messageText += " <leido>";
	
	// Si el receptor del mensaje es el usuario en sesion
	if(message.destino.includes(userEmail)){
        // El mensaje se muestra en la columna de la izquierda
		tableBody = "<tr id="+message._id+">" +
						"<td><span class='alert alert-info chatMessage'>" + messageText + "</span></td>" +
						"<td></td>" +    
					"</tr>";

		// Si el mensaje no estaba marcado como leido, lo marcamos
		if(!message.leido)
	        markMessageAsRead(message);
	} else{
		// Si no, se muestra en la columna de la derecha
		tableBody = "<tr id="+message._id+">" + 
						"<td></td>" + 
						"<td><span class='alert alert-success chatMessage'>" + messageText + "</span></td>" +
					"</tr>";
	}
		
	$("#tableBody").append(tableBody);
}

function markMessageAsRead(message){
    $.ajax({
        url : URLbase + "/message/" + message._id,
        type : "PUT",
        data : {
        	"leido" : true
		}, // se marca como leido
        dataType : 'json',
        headers : {
            "token" : token
        },
        success : function(response) {
            console.log("Mensaje "+ message._id +" marcado como leido correctamente");
        },
        error : function(error) {
            errorProduced();
        }
    });
}

function sendMessage(){
	// Recuperamos el valor del mensaje y lo vaciamos
	var messageContent = $("#messageContent").val();
    $("#messageContent").val("")

	if(messageContent == "")
		return;

	var message = {
        destino : selectedFriendEmail,
        texto : messageContent,
	};

    $.ajax({
        url : URLbase + "/message",
        type : "POST",
        data : message,
        dataType : 'json',
        headers : {
            "token" : token
        },
        success : function(response) {
            console.log("Mensaje creado correctamente");
        },
        error : function(error) {
            errorProduced();
        }
    });
}


// Al cargar el widget cargamos los mensajes
loadUserEmail();
loadUserChatWithEmail();
loadUserChatWithName();
loadMessages();

// Cuando entramos en el chat marcamos que queremos actualizar los mensajes
updateMessages = true;

// Cada N segundos se va a realizar una llamada al SW para comprobar si hay nuevos mensajes
setInterval(function(){
	if(updateMessages) {
        loadMessages();
    }
}, UPDATE_TIME);