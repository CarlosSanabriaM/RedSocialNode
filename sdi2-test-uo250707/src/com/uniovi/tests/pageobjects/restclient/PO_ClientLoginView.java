package com.uniovi.tests.pageobjects.restclient;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ClientLoginView extends PO_ClientView {

	/**
	 * Espera a que se cargue el widget de login y lo rellena con los datos indicados
	 * 
	 * @param driver
	 * @param emailp
	 * @param passwordp
	 */
	static public void fillForm(WebDriver driver, String emailp, String passwordp) {
		
		// Si ya está cargado el widget, no espera, y si no está cargado, espera a que se cargue
		checkElement(driver, "id", "loginButton");
		
		WebElement email = driver.findElement(By.name("email"));
		email.click();
		email.clear();
		email.sendKeys(emailp);
		
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		
		// Pulsar el boton de Iniciar sesión.
		By boton = By.id("loginButton");
		driver.findElement(boton).click();
	}
	
	/**
	 * Va al widget de login y lo rellena con los datos indicados
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param baseUrl: url base de la aplicación
	 * @param emailp: valor para el campo email
	 * @param passwordp: valor para el campo password
	 */
	static public void goToLoginAndfillForm(WebDriver driver, String baseUrl, String emailp, String passwordp) {
		PO_ClientView.goToWidget(driver, baseUrl, "login");
		
		// Comprobamos que aparece el título del widget y rellenamos el formulario
		PO_ClientLoginView.checkElement(driver, "text", "Indentifícate para acceder a los chats");
		PO_ClientLoginView.fillForm(driver, emailp, passwordp);
	}

	/**
	 * Va al widget de login, lo rellena con los datos indicados y 
	 * comprueba que aparece el widget con el listado de amigos
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param baseUrl: url base de la aplicación
	 * @param emailp: valor para el campo email
	 * @param passwordp: valor para el campo password
	 */
	static public void goToLoginFillFormAndCheckWasOk(WebDriver driver, String baseUrl, String emailp, String passwordp) {
		goToLoginAndfillForm(driver, baseUrl, emailp, passwordp);
		
		// Comprobamos que se muestra el título del widget con el listado de amigos y que el texto
		// con el email del usuario autenticado coincide con el email del usuario que inició sesión
		PO_ClientView.checkElement(driver, "text", "Listado de tus amigos");
		PO_ClientView.checkElement(driver, "text", "Selecciona el nombre de un amigo para acceder a su chat");
		PO_ClientView.checkElement(driver, "text", "Usuario autenticado: " + emailp);
	}
	
	/**
	 * Va al widget de login, lo rellena con los datos indicados y 
	 * comprueba que seguimos en el widget de login y
	 * se muestra el mensaje de error "Email o password incorrecto"
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param baseUrl: url base de la aplicación
	 * @param emailp: valor para el campo email
	 * @param passwordp: valor para el campo password
	 */
	static public void goToLoginFillFormAndCheckWasWrong(WebDriver driver, String baseUrl, String emailp, String passwordp) {
		goToLoginAndfillForm(driver, baseUrl, emailp, passwordp);
		
		// Comprobamos que seguimos en el widget de login y se muestra el mensaje de error
		PO_ClientView.checkElement(driver, "text", "Indentifícate para acceder a los chats");
		PO_ClientView.checkElement(driver, "text", "Usuario no encontrado");
	}
	
}
