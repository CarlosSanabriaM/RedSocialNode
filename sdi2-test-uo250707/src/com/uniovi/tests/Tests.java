package com.uniovi.tests;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.uniovi.tests.pageobjects.PO_LoginView;
import com.uniovi.tests.pageobjects.PO_PrivateView;
import com.uniovi.tests.pageobjects.PO_SignupView;
import com.uniovi.tests.pageobjects.PO_View;
import com.uniovi.tests.util.Mongo;
import com.uniovi.tests.webservices.Rest_Autenticar;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class Tests {
	
	// Indicar la ruta donde está situado el firefox 46.0
	static String PathFirefox = "/Applications/Firefox_46.0.app/Contents/MacOS/firefox-bin"; // Mac
	
	static WebDriver driver = getDriver(PathFirefox);
	static String URL = "http://localhost:8081";

	public static WebDriver getDriver(String PathFirefox) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}
	
	// Credenciales de inicio de sesión de varios usuarios
	private static String user1Email = "user01@gmail.com";
	private static String user1Password = "1234";
	private static String user1Name = "Juan Pérez Martínez";
	private static String user2Email = "user02@gmail.com";
	private static String user2Password = "1234";
	
	/**
	 * Antes de cada prueba se navega al URL home de la aplicaciónn
	 */
	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	/**
	 * Después de cada prueba se borran las cookies del navegador
	 */
	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	/**
	 * Antes de la primera prueba, nos conectamos a la BD en la nube y borramos:
	 * - todos los documentos de las colecciones 'invitations' y 'friends'
	 * - el usuario con email 'newUser@gmail.com', si existe
	 * Con esto, dejamos la BD preparada para las pruebas.
	 */
	@BeforeClass
	static public void begin() {
		Mongo mongo = new Mongo();
		
		// Borramos todas las invitaciones y las relaciones de amistad
		mongo.deleteAllDocumentsInCollection("invitations");
		mongo.deleteAllDocumentsInCollection("friends");
		
		// Borramos al usuario newUser@gmail.com, si existe
		mongo.deleteUserWithEmail("newUser@gmail.com");
	}

	/**
	 * Al finalizar la última prueba cerramos el navegador
	 */
	@AfterClass
	static public void end() {
		driver.quit();
	}
	
	/**
	 * 1.1 [RegVal] Registro de Usuario con datos válidos.
	 */
	@Test
	public void PR01() {
		PO_SignupView.goToSignup(driver);
		PO_SignupView.fillFormAndCheckWasOk(driver, 
				"newUser@gmail.com", "NewUserName", "NewUserLastName", "1234", "1234");
	}
	
	/**
	 * 1.2 [RegInval] Registro de Usuario con datos inválidos (repetición de contraseña invalida).
	 */
	@Test
	public void PR02() {
		PO_SignupView.goToSignup(driver);
		PO_SignupView.fillFormAndCheckError(driver, 
				"newUser2@gmail.com", "NewUserName2", "NewUserLastName2", "1234", "54321", 
				"Las contraseñas no coinciden");
	}
	
	/**
	 * 2.1 [InVal] Inicio de sesión con datos válidos.
	 */
	@Test
	public void PR03() {
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user1Email, user1Password);
		
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	
	/**
	 * 2.2 [InInVal] Inicio de sesión con datos inválidos (usuario no existente en la aplicación).
	 */
	@Test
	public void PR04() {
		PO_LoginView.goToLoginFillFormAndCheckWasWrong(driver, "notExists@gmail.com", "123456");
	}

	/**
	 * 3.1 [LisUsrVal] Acceso al listado de usuarios desde un usuario en sesión.
	 */
	@Test
	public void PR05() {
		// Iniciamos sesión, pinchamos en "Usuarios" -> "Ver Todos" en el menú de navegación
		// (para asegurarnos de que dicho enlace también funciona, aunque ya estemos en dicho listado)
		// y comprobamos que aparece el texto "Todos los usuarios"
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user1Email, user1Password);
		
		PO_PrivateView.clickDropdownMenuOptionAndCheckElement(driver, 
				"aDropdownUsersMenu", "aUserList", "text", "Todos los usuarios");
		// Comprobamos que hay 5 usuarios en la pagina actual (la primera pagina del listado de usuarios)
		PO_PrivateView.checkNumUsers(driver, 5);
		
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	/**
	 * 3.2 [LisUsrInVal] Intento de acceso con URL desde un usuario no identificado al listado 
	 * de usuarios desde un usuario en sesión. Debe producirse un acceso no permitido a vistas privadas.
	 */
	@Test
	public void PR06() {
		// Acceder al listado de usuarios sin estar logeados 
		// nos lleva a la página de login y nos muestra un mensaje de error
		PO_PrivateView.checkAccessNotPermittedToPrivateViews(driver, URL + "/user/list");
	}

	/**
	 * 4.1 [BusUsrVal] Realizar una búsqueda valida en el listado de usuarios desde un usuario en sesión.
	 */
	@Test
	public void PR07() {
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user1Email, user1Password);
		
		/* Realizamos una busqueda por el texto "mar" y comprobamos que sólo salen 4 usuarios, cuyos datos son:
		 * - Juan Pérez Martínez	- user01@gmail.com
		 * - Marta Roces Lara 	- user03@gmail.com
		 * - María Torres Viesca	- user04@gmail.com
		 * - Álvaro Alonso Pérez	- user06@marte.com [Notese que aquí la coincidencia se da por el email]
		 */

		PO_PrivateView.searchText(driver, "mar");

		PO_PrivateView.checkNumUsers(driver, 4);
		
		PO_PrivateView.checkElement(driver, "text", "Juan Pérez Martínez");
		PO_PrivateView.checkElement(driver, "text", "Marta Roces Lara");
		PO_PrivateView.checkElement(driver, "text", "María Torres Viesca");
		PO_PrivateView.checkElement(driver, "text", "Álvaro Alonso Pérez");
		
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	/**
	 * 4.2 [BusUsrInVal] Intento de acceso con URL a la búsqueda de usuarios desde 
	 * un usuario no identificado. Debe producirse un acceso no permitido a vistas privadas.
	 */
	@Test
	public void PR08() {
		// Acceder a la búsqueda de usuarios sin estar logeados 
		// nos lleva a la página de login y nos muestra un mensaje de error
		PO_PrivateView.checkAccessNotPermittedToPrivateViews(driver, URL + "/user/list?searchText=mar");
	}
	
	/**
	 * 5.1 [InvVal] Enviar una invitación de amistad a un usuario de forma valida.
	 */
	@Test
	public void PR09() {
		// Iniciar sesión como user1 y mandar una invitación de amistad a user2
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user1Email, user1Password);
		PO_PrivateView.sendInvitationAndCheckWasOk(driver, user2Email);
		PO_PrivateView.logoutAndCheckWasOk(driver);
		
		// Iniciar sesión como user2 y comprobar que tenemos una invitación de Juan Pérez Martinez (nombre de user1)
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user2Email, user2Password);
		PO_PrivateView.clickDropdownMenuOptionAndCheckElement(driver, 
				"aDropdownUsersMenu", "aUserFriendRequestList", "text", user1Name);
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	/**
	 * 5.2 [InvInVal] Enviar una invitación de amistad a un usuario al que ya le habíamos 
	 * invitado la invitación previamente. No debería dejarnos enviar la invitación, 
	 * se podría ocultar el botón de enviar invitación o notificar que ya había sido enviada previamente.
	 */
	@Test
	public void PR10() {
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user1Email, user1Password);
		
		// Intentamos volver a enviarle invitacion a user2 y comprobamos que se muestra un error
		PO_PrivateView.sendInvitationAndCheckWasWrong(driver, user2Email, 
				"Error al enviar la invitación. ¡Ya has enviado una invitación de amistad a ese usuario!");
		
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	/**
	 * 6.1 [LisInvVal] Listar las invitaciones recibidas por un usuario, realizar 
	 * la comprobación con una lista que al menos tenga una invitación recibida.
	 */
	@Test
	public void PR11() {
		// Nos conectamos como user2, accedemos al listado de invitaciones, 
		// y comprobamos que tenemos sólo una, de user1 (cuyo nombre es "Juan Pérez Martinez")
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user2Email, user2Password);
		
		PO_PrivateView.clickDropdownMenuOptionAndCheckElement(driver, 
				"aDropdownUsersMenu", "aUserFriendRequestList", "text", "Solicitudes de amistad");		
		PO_PrivateView.checkNumUsers(driver, 1);
		PO_PrivateView.checkElement(driver, "text", user1Name);
		
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	/**
	 * 7.1 [AcepInvVal] Aceptar una invitación recibida.
	 */
	@Test
	public void PR12() {
		// Nos conectamos como user2, accedemos al listado de invitaciones, 
		// y aceptamos la invitación de user1 (cuyo nombre es "Juan Pérez Martinez")
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user2Email, user2Password);
		
		PO_PrivateView.clickDropdownMenuOptionAndCheckElement(driver, 
				"aDropdownUsersMenu", "aUserFriendRequestList", "text", "Solicitudes de amistad");		
		PO_PrivateView.acceptInvitationAndCheckWasOk(driver, user1Name);
		
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	/**
	 * 8.1 [ListAmiVal] Listar los amigos de un usuario, realizar la 
	 * comprobación con una lista que al menos tenga un amigo.
	 */
	@Test
	public void PR13() {
		// Nos conectamos como user2, accedemos al listado de amigos 
		// y comprobamos como tiene un amigo, user1 (cuyo nombre es "Juan Pérez Martinez")
		PO_LoginView.goToLoginFillFormAndCheckWasOk(driver, user2Email, user2Password);
		
		PO_PrivateView.clickDropdownMenuOptionAndCheckElement(driver, 
				"aDropdownUsersMenu", "aUserFriendList", "text", "Tus Amigos");
		PO_PrivateView.checkNumUsers(driver, 1);
		// Comprobamos que aparece el nombre y el email de su unico amigo (user1)
		PO_View.checkElement(driver, "text", user1Name);
		PO_View.checkElement(driver, "text", user1Email);
		
		PO_PrivateView.logoutAndCheckWasOk(driver);
	}
	
	/**
	 * C1.1[[CInVal] Inicio de sesión con datos válidos.
	 */
	@Test
	public void PR14() {
		// Realizamos una petición POST a la URL /api/autenticar, pasando
		// las credenciales de user1, y comprobamos que nos retorna un campo token 
		// y un campo "authenticated" con valor true
		Rest_Autenticar.postAutenticarAndCheckWasOk(URL, user1Email, user1Password);
	}
	
	/**
	 * C1.2 [CInInVal] Inicio de sesión con datos inválidos (usuario no existente en la aplicación).
	 */
	@Test
	public void PR15() {
		// Realizamos una petición POST a la URL /api/autenticar, pasando
		// las credenciales de un usuario NO existente, y comprobamos que retorna 
		// un campo "authenticated" con valor false, NO retorna un campo token,
		// y retorna un campo message con valor "Inicio de sesión no correcto"
		Rest_Autenticar.postAutenticarAndCheckWasWrong(URL, "notExists@gmail.com", "123456");
	}
	
}
