package com.uniovi.tests.pageobjects.restclient;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ClientPrivateView extends PO_ClientView {
	
	/**
	 * Comprueba que el numero de amigos del usuario en sesión coincida con el indicado
	 */
	public static void checkNumFriends(WebDriver driver, int numFriends) {
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
		PO_ClientPrivateView.checkElement(driver, "text", messageContent + "<leido>");
	}
	
}