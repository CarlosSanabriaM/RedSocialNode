package com.uniovi.tests.pageobjects.restclient;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.pageobjects.PO_View;

public class PO_ClientPrivateView extends PO_ClientView {

	private static String getUserNameFromWebElement(WebElement elemento) {
		String friendName = elemento.getText();
		return friendName.substring(0, friendName.length() - 4); // quitamos el " [n] "
	}
	
	/**
	 * Comprueba que el numero de amigos del usuario en sesión coincida con el indicado
	 */
	public static void checkNumFriends(WebDriver driver, int numFriends) {
		// Esperamos a que aparezca el mensaje "Todos los amigos cargados"
		PO_ClientView.checkElement(driver, "text", "Todos los amigos cargados");
		
		// Comprobamos que el numero de filas de la tabla coincida con el numero de amigos esperado
		PO_ClientView.checkNumRowsInTableBody(driver, numFriends);
	}

	/**
	 * Comprueba que el numero de mensajes del chat actual coincida con el indicado
	 */
	public static void checkNumMessages(WebDriver driver, int numMessages) {
		PO_ClientView.checkNumRowsInTableBody(driver, numMessages);		
	}
	
	/**
	 * Estando en el listado de amigos del usuario, filtra los amigos por el nombre indicado
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param filterName: nombre por el que se va a filtrar a los usuarios amigos.
	 */
	public static void filterFriendsByName(WebDriver driver, String filterName) {
		// Obtenemos el input donde se introduce el texto por el que se va a filtrar
		List<WebElement> elementos = PO_ClientView.checkElement(driver, "id", "filterName");
		WebElement inputFN = elementos.get(0); 
		
		// Introducimos el texto a buscar caracter a caracter, 
		// para simular como lo introduciría un usuario
		inputFN.click();
		inputFN.clear();
		
		for (String caracter : filterName.split(""))
			inputFN.sendKeys(caracter);
	}

	/**
	 * Estando en el listado de amigos del usuario, accede al chat con el amigo
	 * cuyo nombre coincide con el indicado, y comprueba que se muestra los textos:
	 * "Usuario autenticado: <emailUserSession>"
	 * "Chat con el usuario: <userNameChat>"
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param emailUserSession: email del usuario en sesión.
	 * @param userName: nombre del amigo del chat al que quieres acceder.
	 */
	public static void goToChatAndCheckWasOk(WebDriver driver, String emailUserSession, String userNameChat) {
		// Buscamos un enlace que contenga el nombre indicado y lo clickamos
		List<WebElement> elementos = PO_ClientView.checkElement(driver, "free", 
				"//a[contains(text(), '"+ userNameChat +"')]");
		elementos.get(0).click();
		
		// Comprobamos que se muestran los textos "Usuario autenticado: <emailUserSession>" 
		// y "Chat con el usuario: <userName>"
		PO_ClientPrivateView.checkElement(driver, "text", "Usuario autenticado: " + emailUserSession);
		PO_ClientPrivateView.checkElement(driver, "text", "Chat con el usuario: " + userNameChat);
	}
	
	/**
	 * Estando en el listado de amigos del usuario, accede al chat con 
	 * el ultimo amigo de la lista, y comprueba que se muestra los textos:
	 * "Usuario autenticado: <emailUserSession>"
	 * "Chat con el usuario: <friendName>"
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param emailUserSession: email del usuario en sesión.
	 */
	public static String goToChatOfLastFriendAndCheckWasOk(WebDriver driver, String emailUserSession) {
		// Buscamos el enlace de la ultima fila de la tabla de amigos, que contenga un "["
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//tbody/tr[last()]/td[1]/a[contains(text(),'[')]");
		
		// Sacamos el nombre del amigo
		String lastFriendName = getUserNameFromWebElement(elementos.get(0));
		
		// Clickamos el enlace para acceder a su chat
		elementos.get(0).click();
		
		// Comprobamos que se muestran los textos "Usuario autenticado: <emailUserSession>" 
		// y "Chat con el usuario: <lastFriendName>"
		PO_ClientPrivateView.checkElement(driver, "text", "Usuario autenticado: " + emailUserSession);
		PO_ClientPrivateView.checkElement(driver, "text", "Chat con el usuario: " + lastFriendName);
		
		return lastFriendName;
	}

	/**
	 * Estando en un chat con un amigo, escribe un mensaje y lo envía.
	 * Comprueba que aparece el mensaje en el chat.
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param messageContent: contenido del mensaje a crear.
	 */
	public static void createMessageAndCheckWasOk(WebDriver driver, String messageContent) {
		// Obtenemos el input donde se introduce el texto del mensaje
		List<WebElement> elementos = PO_ClientView.checkElement(driver, "id", "messageContent");
		WebElement inputMC = elementos.get(0); 
		
		// Introducimos el texto a buscar
		inputMC.click();
		inputMC.clear();
		inputMC.sendKeys(messageContent);
		
		// Pulsamos el boton de enviar
		By boton = By.id("buttonMessage");
		driver.findElement(boton).click();
		
		// Comprobamos que aparece el texto del mensaje creado
		PO_ClientPrivateView.checkElement(driver, "text", messageContent);
	}
	
	/**
	 * Estando en un chat con un amigo, comprueba que el mensaje indicado
	 * se muestra como leido.
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param messageContent: contenido del mensaje a verificar si está leido.
	 */
	public static void checkMessageIsRead(WebDriver driver, String messageContent) {
		// Comprobamos que aparece el texto del mensaje + <leido>
		PO_ClientPrivateView.checkElement(driver, "text", messageContent + " <leido>");
	}

	/**
	 * Estando en un chat con un amigo, comprueba que el mensaje indicado
	 * aparece, pero NO se muestra como leido.
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param messageContent: contenido del mensaje a verificar que NO está leido.
	 */
	public static void checkMessageIsNotRead(WebDriver driver, String messageContent) {
		// Comprobamos que aparece el texto del mensaje
		PO_ClientPrivateView.checkElement(driver, "text", messageContent);
		
		// y que NO aparece el texto del mensaje + <leido>
		PO_ClientPrivateView.checkTextNotPresent(driver, messageContent + " <leido>");
	}
	
	/**
	 * Estando en la lista de amigos, comprueba que el numero de mensajes
	 * sin leer con el amigo de nombre indicado coincida con el numero indicado.
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param friendName: nombre del amigo cuyo numero de mensajes sin leer quieres comprobar.
	 * @param numMessagesNotRead: numero de mensajes sin leer que deberia haber de ese amigo.
	 */
	public static void checkNumMessagesNotReadInFriendsList(WebDriver driver, String friendName, int numMessagesNotRead) {
		// Comprobamos que aparece ese amigo en la lista de amigos
		PO_ClientPrivateView.checkElement(driver, "text", friendName);
		
		// Comprobamos que el numero de mensajes sin leer de dicho amigo coincide con el indicado
		PO_ClientPrivateView.checkElement(driver, "text", friendName + " [" + numMessagesNotRead + "]");
	}

	/**
	 * Estando en la lista de amigos, comprueba que el amigo con el nombre
	 * dado está el primero en la lista.
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param friendName: nombre del amigo que quieres comprobar que es el primero
	 */
	public static void checkFriendIsFirst(WebDriver driver, String friendName) {
		// Esperamos a que aparezca el mensaje "Todos los amigos cargados"
		PO_ClientView.checkElement(driver, "text", "Todos los amigos cargados");
		
		// Buscamos el enlace de la primera fila de la tabla de amigos, que contenga un "["
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//tbody/tr[1]/td[1]/a[contains(text(),'[')]");
		
		// Sacamos el nombre del amigo
		String firstFriendName = getUserNameFromWebElement(elementos.get(0));
		
		// Comprobamos que coincide con el nombre dado
		assertTrue("El usuario con nombre '" + friendName +"' NO se muestra el primero en la lista."
				+ "El nombre del primer usuario es: " + firstFriendName, 
				firstFriendName.equals(friendName));
	}
	
}