package com.uniovi.tests.pageobjects.restclient;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.pageobjects.PO_NavView;
import com.uniovi.tests.pageobjects.PO_PrivateView;
import com.uniovi.tests.pageobjects.PO_View;

public class PO_ClientPrivateView extends PO_NavView {
	
	/**
	 * Comprueba que el numero de amigos del usuario en sesión coincida con el indicado
	 */
	public static void checkNumFriends(WebDriver driver, int numUsers) {
		PO_PrivateView.checkNumUsers(driver, numUsers);
	}

	public static void filterFriendsByName(WebDriver driver, String filterName) {
		// Obtenemos el input donde se introduce el texto por el que se va a filtrar
		List<WebElement> elementos = PO_View.checkElement(driver, "id", "filterName");
		WebElement inputFN = elementos.get(0); 
		
		// Introducimos el texto a buscar caracter a caracter, 
		// para simular como lo introduciría un usuario
		inputFN.click();
		inputFN.clear();
		
		for (String caracter : filterName.split(""))
			inputFN.sendKeys(caracter);
		
	}
	
}