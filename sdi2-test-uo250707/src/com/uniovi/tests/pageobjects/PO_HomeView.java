package com.uniovi.tests.pageobjects;

import org.openqa.selenium.WebDriver;

public class PO_HomeView extends PO_NavView {

	/**
	 * Comprueba que se carga el saludo de bienvenida correctamente
	 */
	static public void checkWelcome(WebDriver driver, int language) {
		PO_View.checkElement(driver, "text", "¡Bienvenidos a Red Social!");
	}
	
}
