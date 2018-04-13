var token;
var URLbase = "https://localhost:8081/api";

// Cargamos el widget-login al acceder a cliente.html
loadWidget("login");

// Si existe una cookie con el token, lo guardamos e intentamos cargar
// un widget (aunque haya token puede estar caducado)
if (Cookies.get('token') != null) {
	token = Cookies.get('token');
	loadWidgetUsingUrl();
}

function showMessage(message, alertType){
	$("#messageContainer").empty();
	$("#messageContainer")
		.prepend("<div class='alert "+ alertType +"'>"+ message +"</div>");
}

function loadWidgetUsingUrl(){
	// Obtenemos el parámetro w de la url y cargamos el widget correspondiente al parámetro
	var url = new URL(window.location.href);
	var w = url.searchParams.get("w");
	switch (w) {
	case "login":
		loadWidget("login");
		break;
	case "friends":
		loadWidget("friends");
		break;
	default:
		// Si no existe el parámetro o su valor no es ninguno de los anteriores, 
		// cargamos el widget-friends
		loadWidget("friends");
	}
}

function loadWidget(widget){
	$("#contenedor-principal").load("widget-"+ widget +".html");
	$("#messageContainer").empty();
}
