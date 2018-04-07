package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_SignupView extends PO_NavView {

	/**
	 * Nos lleva al formulario de registro
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 */
	public static void goToSignup(WebDriver driver) {
		PO_HomeView.clickLinkAndCheckElement(driver, "aSignup", "id", "buttonSubmit");
	}
	
	/**
	 * Espera a que se cargue el formulario de registro y lo rellena con los datos indicados
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param emailp: valor a introducir en el campo email
	 * @param namep: valor a introducir en el campo name
	 * @param lastnamep: valor a introducir en el campo lastName
	 * @param passwordp: valor a introducir en el campo password
	 * @param passwordconfp: valor a introducir en el campo passwordConfirm
	 */
	static public void fillForm(WebDriver driver, String emailp, String namep, 
			String lastnamep, String passwordp, String passwordconfp) {
		
		// Si ya está cargado el formulario, no espera, y si no está cargado, espera a que se cargue
		checkElement(driver, "id", "buttonSubmit");
		
		WebElement email = driver.findElement(By.name("email"));
		email.click();
		email.clear();
		email.sendKeys(emailp);
		
		WebElement name = driver.findElement(By.name("name"));
		name.click();
		name.clear();
		name.sendKeys(namep);
		
		WebElement lastName = driver.findElement(By.name("lastName"));
		lastName.click();
		lastName.clear();
		lastName.sendKeys(lastnamep);
		
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		
		WebElement passwordConfirm = driver.findElement(By.name("passwordConfirm"));
		passwordConfirm.click();
		passwordConfirm.clear();
		passwordConfirm.sendKeys(passwordconfp);
		
		// Pulsar el boton de Alta.
		By boton = By.id("buttonSubmit");
		driver.findElement(boton).click();
	}
	
	/**
	 * Espera a que se cargue el formulario, lo rellena y comprueba que
	 * aparece el texto "Usuario registrado correctamente"
	 */
	public static void fillFormAndCheckWasOk(WebDriver driver, String emailp, String namep, 
			String lastnamep, String passwordp, String passwordconfp) {
		
		PO_SignupView.fillForm(driver, emailp, namep, lastnamep, passwordp, passwordconfp);
		PO_View.checkElement(driver, "text", "Usuario registrado correctamente");
	}
	
	/**
	 * Espera a que se cargue el formulario, lo rellena 
	 * y comprueba que se produce el error indicado
	 * 
	 * @param errorMessage: mensaje de error que se ha de producir
	 */
	public static void fillFormAndCheckError(WebDriver driver, String emailp, String namep, 
			String lastnamep, String passwordp, String passwordconfp, String errorMessage) {
		 
		PO_SignupView.fillForm(driver, emailp, namep, lastnamep, passwordp, passwordconfp);
		PO_SignupView.checkElement(driver, "text", errorMessage);
	}

}
