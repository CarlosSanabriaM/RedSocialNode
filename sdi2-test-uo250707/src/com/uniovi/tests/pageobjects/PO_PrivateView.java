package com.uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_PrivateView extends PO_NavView {
	
	/**
	 * Hacemos click en el botón de Desconectarse y vemos 
	 * que se muestra el mensaje "Desconectado correctamente"
	 * y el texto "Identifícate"
	 */
	public static void logoutAndCheckWasOk(WebDriver driver) {
		clickLinkAndCheckElement(driver, "aLogout", "text", "Desconectado correctamente");
		checkElement(driver, "text", "Identifícate");
	}

	/**
	 * Intenta acceder desde URL a una página de la zona privada 
	 * (donde es necesario estar logeado) y comprueba que
	 * le lleva a la página de login y se le muestra el mensaje de error
	 * "Debes identificarte primero para acceder a esa página"
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param url: la url de la página privada a la que quiere acceder sin estar logeado 
	 */
	public static void checkAccessNotPermittedToPrivateViews(WebDriver driver, String url) {
		// Intenta acceder directamente a la URL
		driver.navigate().to(url);
		// Comprueba que se le lleva a la página de login y se le muestra el mensaje de error
		PO_View.checkElement(driver, "text", "Identifícate");
		PO_View.checkElement(driver, "text", "Debes identificarte primero para acceder a esa página");
	}
	
	/**
	 * Comprueba que el numero de usuarios en la vista actual coincida con el indicado
	 */
	public static void checkNumUsers(WebDriver driver, int numUsers) {
		List<WebElement> elementos = checkElement(driver, "free", "//tbody/tr");
		assertTrue(elementos.size() == numUsers);
	}
	
	/**
	 * Estando en la página /user/list, realiza la búsqueda del texto indicado
	 * 
	 * @param driver: apuntando al navegador abierto actualmente. 
	 * @param searchText: texto a buscar en el listado de usuarios.
	 */
	public static void searchText(WebDriver driver, String searchText) {
		// Obtenemos el input donde se introduce el texto a buscar
		List<WebElement> elementos = PO_PrivateView.checkElement(driver, "id", "inputSearchText");
		WebElement inputST = elementos.get(0); 
		
		// Introducimos el texto a buscar
		inputST.click();
		inputST.clear();
		inputST.sendKeys(searchText);

		// Pulsamos el boton de enviar para realizar la búsqueda
		By boton = By.id("buttonSearchText");
		driver.findElement(boton).click();
	}

	/**
	 * Va al listado de amigos y comprueba que no aparece el email indicado
	 * @param driver
	 * @param userEmail
	 */
	public static void checkUserIsNotFriend(WebDriver driver, String userEmail) {
		PO_PrivateView.clickDropdownMenuOptionAndCheckElement(driver, 
				"aDropdownUsersMenu", "aUserFriendList", "text", "Tus Amigos");
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, userEmail, getTimeout());
	}
	
	/**
	 * Manda una invitación de amistad al usuario con el email indicado
	 */
	private static void sendInvitation(WebDriver driver, String userEmail) {
		// Buscamos una celda que contenga el email indicado. 
		// La celda siguiente de la misma fila contendrá el botón de invitar, así que lo clickamos.
		List<WebElement> elementos = checkElement(driver, "free",
				"//td[contains(text(), '"+ userEmail +"')]/following-sibling::td/div/*[contains(@id, 'invitateUserButton')]");
		elementos.get(0).click();
	}
	
	/**
	 * Manda una invitación de amistad al usuario con el email indicado
	 * y comprueba que se muestra el mensaje "Invitación enviada correctamente"
	 */
	public static void sendInvitationAndCheckWasOk(WebDriver driver, String userEmail) {
		sendInvitation(driver, userEmail);
		checkElement(driver, "text", "Invitación enviada correctamente");
	}
	
	/**
	 * Manda una invitación de amistad al usuario con el email indicado
	 * y comprueba que se muestra el mensaje de error indicado
	 */
	public static void sendInvitationAndCheckWasWrong(WebDriver driver, String userEmail, String errorMessage) {
		sendInvitation(driver, userEmail);
		checkElement(driver, "text", errorMessage);
	}
	
	/**
	 * Acepta una solicitud de amistad del usuario con el nombre indicado, y comprueba
	 * que se ha añadido correctamente como amigo.
	 */
	public static void acceptInvitationAndCheckWasOk(WebDriver driver, String userName) {
		// Acepta la invitación de amistad
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"//td[contains(text(), '" + userName +"')]/following-sibling::td/div/button[contains(@id,'acceptInvitationButton')]");
		elementos.get(0).click();
		
		// Comprueba que aparece en la lista de amigos
		PO_View.checkElement(driver, "text", "Tus Amigos");
		PO_View.checkElement(driver, "text", userName);
	}

}