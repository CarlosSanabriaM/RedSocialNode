package com.uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_View {
	
	protected static int timeout = 10;

	public static int getTimeout() {
		return timeout;
	}

	public static void setTimeout(int timeout) {
		PO_View.timeout = timeout;
	}
	
	/**
	 *  Espera por la visibilidad de un elemento/s en la vista actualmente cargandose en driver..
	 * 
	 * @param driver: apuntando al navegador abierto actualmente.
	 * @param criterio: "id" or "class" or "text" or "@attribute" or "free". 
	 * 					Si el valor de criterio es free es una expresion xpath completa. 
	 * @param text: texto correspondiente al criterio.
	 * @return Se retornará la lista de elementos resultantes de la búsqueda.
	 */
	static public List<WebElement> checkElement(WebDriver driver, String criterio, String text) {
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, criterio, text, getTimeout());
		return elementos;		
	}
	
	/**
	 *  Comprueba que el texto NO está presente en la página actual
	 * 
	 * @param driver: apuntando al navegador abierto actualmente.
	 * @param text: texto a comprobar que NO aparece.
	 */
	static public void checkTextNotPresent(WebDriver driver, String text) {
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, text, getTimeout());
	}
	
	/**
	 * Clicka en un enlace (a href) y comprueba que se vaya a una vista
	 * en la que haya un texto correspondiente al criterio.
	 * 
	 * @param driver: apuntando al navegador abierto actualmente.
	 * @param idLink: id del elemento html "a" que se va a clickar
	 * @param criterio: "id" or "class" or "text" or "@attribute" or "free". Si el valor
	 *           		de criterio es free es una expresion xpath completa.
	 * @param textoDestino: texto correspondiente al criterio.
	 */
	public static void clickLinkAndCheckElement(WebDriver driver, String idLink, String criterio, String textoDestino) {
		// Obtenemos el elemento "a" que tiene el id indicado
		List<WebElement> elementos = PO_View.checkElement(driver, "id", idLink);
		// Tiene que haber un sólo elemento.
		assertTrue(elementos.size() == 1);
		// Ahora lo clickamos
		elementos.get(0).click();
		
		// Esperamos a que sea visible un elemento concreto
		elementos = PO_NavView.checkElement(driver, criterio, textoDestino);
		// Tiene que haber un sólo elemento.
		assertTrue(elementos.size() == 1);
	}
	
	/**
	 * Comprueba que el cuerpo de la tabla presente en la vista actual tenga el numero de filas indicado
	 */
	public static void checkNumRowsInTableBody(WebDriver driver, int numRows) {// TODO - modificar para que no falle
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//tbody/tr");
		assertTrue(elementos.size() == numRows);
	}
	
}
