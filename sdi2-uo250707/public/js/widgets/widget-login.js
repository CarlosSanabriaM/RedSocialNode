//Modificamos la URL actual del navegador
window.history.pushState("", "", "/cliente.html?w=login");

$("#boton-login").click(function() {
	// Comprobamos que los dos campos tengan valor
	if($("#email").val() == ""){
		showMessage("Rellena el campo 'Email'", "alert-danger");
		return;
	}
	if($("#password").val() == ""){
		showMessage("Rellena el campo 'Password'", "alert-danger");
		return;
	}
	
	$.ajax({
		url: URLbase + "/autenticar",
		type: "POST",
		data: {
			email: $("#email").val(),
			password: $("#password").val()
		},
		dataType: 'json',
		success: function(respuesta) {
			console.log(respuesta.token); // <- Prueba
			token = respuesta.token;
			Cookies.set('token', respuesta.token); // Guardamos el token en una cookie
			loadWidget("friends");
		},
		error: function(error) {
			Cookies.remove('token'); // Eliminamos la cookie token
			showMessage("Usuario no encontrado", "alert-danger");
		}
	});
});