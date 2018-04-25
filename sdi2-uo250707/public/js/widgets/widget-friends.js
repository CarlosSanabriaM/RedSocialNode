// Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=friends");

var currentFriendsShown = [];

// Marcamos que queremos actualizar los amigos
updateFriends = true;

// Cargamos las amigos
loadFriends();
loadUserEmail();

// Cada N segundos se va a realizar una llamada al SW para comprobar el numero de mensajes sin leer y el orden de los amigos
setInterval(function(){
    if(updateFriends) {
        checkNumMessagesNotRead();
    }
}, UPDATE_TIME);


// Funciones:

function errorProducedInFriends(){
    // Dejamos de hacer peticiones al SW cuando se produce
    // un error, como por ejemplo, caduca el token de sesión
    updateFriends = false;
    loadWidget("login");
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
            errorProducedInFriends();
		}
	});
}

function loadFriendsDataAndUpdateTable(friendsEmailsToShow) {
	// Para cada email, lo cargamos en friends y en la tabla
	$("#friendsTableBody").empty(); // Vaciar la tabla

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
			friends.push(response); // se añade el amigo a la lista de todos los amigos
            currentFriendsShown.push(response); // se añade el amigo a la lista de amigos mostrados actualmente
			addUserToTable(response);// y a la tabla
		},
		error : function(error) {
            errorProducedInFriends();
		}
	});
}

function addUserToTable(user) {
	var userNameAndMessages;
	// Si hay numero de mensajes sin leer, los añadimos al texto a mostrar, sino no
	if(user.numMessagesNotRead != null)
        userNameAndMessages = user.name + " [" + user.numMessagesNotRead + "] ";
	else
		userNameAndMessages = user.name;

	// Añadimos los datos de ese usuario a la tabla
	$("#friendsTableBody").append(
			"<tr id="+user.email+">" + 
				"<td><a onclick=chat('" + user.email + "')>" + userNameAndMessages + "</a></td>" +
				"<td>" + user.email + "</td>" +  
			"</tr>");
}

function updateFriendsTable(friendsToShow) {
	$("#friendsTableBody").empty(); // Vaciar la tabla

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

    currentFriendsShown = filteredFriends;
	updateFriendsTable(currentFriendsShown);
});

function chat(email) {
    updateFriends = false; // Dejamos de actualizar los amigos
	selectedFriendEmail = email; // Variable global
	Cookies.set('selectedFriendEmail', email); // lo guardamos en una cookie
	Cookies.set('friends', friends); // lo guardamos en una cookie
	loadWidget("chat");
}

function checkNumMessagesNotRead(){
	// Por cada uno de los amigos que se estan mostrando actualmente,
	// comprobamos el numero de mensajes que hay sin leer en su chat
    for (i = 0; i < currentFriendsShown.length; i++) {
        checkNumMessagesNotReadOfFriend(currentFriendsShown[i].email);
    }
}

function checkNumMessagesNotReadOfFriend(email){
	// Obtenemos todos los mensajes con ese usuario
    $.ajax({
        url : URLbase + "/message?user1="+userEmail+"&user2="+email,
        type : "GET",
        data : {},
        dataType : 'json',
        headers : {
            "token" : token
        },
        success : function(response) {
        	// Calculamos el numero de mensajes no leidos
        	var numMessagesNotRead = 0;
            var messages = response;

            for (i = 0; i < messages.length; i++) {
                // Si eres el receptor del mensaje y no lo has leido
            	if(messages[i].destino.includes(userEmail) && !messages[i].leido)
                	numMessagesNotRead++;
            }

            console.log("Numero de mensajes sin leer con " + email + ": " + numMessagesNotRead);

            // Modificamos el numero de mensajes sin leer para ese amigo en el array
			// que tiene los amigos que se muestran actualmente
            for (i = 0; i < currentFriendsShown.length; i++) {
                if(currentFriendsShown[i].email == email)
                    currentFriendsShown[i].numMessagesNotRead = numMessagesNotRead;
            }
            // Actualizamos la tabla con los amigos que se muestran actualemnte
			updateFriendsTable(currentFriendsShown);
        },
        error : function(error) {
            errorProducedInFriends();
        }
    });
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