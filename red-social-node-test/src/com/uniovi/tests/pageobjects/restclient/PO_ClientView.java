package com.uniovi.tests.pageobjects.restclient;

import org.openqa.selenium.WebDriver;

import com.uniovi.tests.pageobjects.PO_View;

public class PO_ClientView extends PO_View{
	
	/**
	 * Va al widget indicado
	 * 
	 * @param driver: apuntando al navegador abierto actualmente
	 * @param baseUrl: url base de la aplicación
	 * @param widget: widget al que se quiere ir
	 */
	static public void goToWidget(WebDriver driver, String baseUrl, String widget) {
		driver.navigate().to(baseUrl + "/cliente.html?w=" + widget);
	}
	
}
