package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_LoginView extends PO_NavView {

	/**
	 * Espera a que se cargue el formulario de login y lo rellena con los datos indicados
	 * 
	 * @param driver
	 * @param emailp
	 * @param passwordp
	 */
	static public void fillForm(WebDriver driver, String emailp, String passwordp) {
		
		// Si ya está cargado el formulario, no espera, y si no está cargado, espera a que se cargue
		checkElement(driver, "id", "buttonSubmit");
		
		WebElement email = driver.findElement(By.name("email"));
		email.click();
		email.clear();
		email.sendKeys(emailp);
		
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		
		// Pulsar el boton de Alta.
		By boton = By.id("buttonSubmit");
		driver.findElement(boton).click();
	}
	
	/**
	 * Va al formulario de login y lo rellena con los datos indicados
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param emailp: valor para el campo email
	 * @param passwordp: valor para el campo password
	 */
	static public void goToLoginAndfillForm(WebDriver driver, String emailp, String passwordp) {
		PO_HomeView.clickLinkAndCheckElement(driver, "aLogin", "id", "buttonSubmit");
		PO_LoginView.fillForm(driver, emailp, passwordp);
	}

	/**
	 * Va al formulario de login, lo rellena con los datos indicados y comprueba que entra correctamente
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param emailp: valor para el campo email
	 * @param passwordp: valor para el campo password
	 */
	static public void goToLoginFillFormAndCheckWasOk(WebDriver driver, String emailp, String passwordp) {
		goToLoginAndfillForm(driver, emailp, passwordp);
		// Comprobamos que entramos en la pagina privada del usuario
		PO_View.checkElement(driver, "text", "Usuario autenticado: " + emailp);
	}
	
	/**
	 * Va al formulario de login, lo rellena con los datos indicados y 
	 * comprueba que se produce un error en el idioma indicado
	 * 
	 * @param errorKey: clave del error en el fichero de propiedades
	 * @param language: idioma en el que se va a mostrar el error
	 */
	static public void goToLoginFillFormAndCheckWasWrong(WebDriver driver, String usernamep, 
			String passwordp,int language) {
		
		goToLoginAndfillForm(driver, usernamep, passwordp);
		// Comprobamos que volvemos a la pagina de login y se muestra un error en el idioma indicado
		PO_View.checkKey(driver, "Error.login", language);
	}
	
}
