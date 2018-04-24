package com.uniovi.tests.pageobjects.restclient;

import org.openqa.selenium.WebDriver;

import com.uniovi.tests.pageobjects.PO_NavView;
import com.uniovi.tests.pageobjects.PO_PrivateView;

public class PO_ClientPrivateView extends PO_NavView {
	
	/**
	 * Comprueba que el numero de amigos del usuario en sesión coincida con el indicado
	 */
	public static void checkNumFriends(WebDriver driver, int numUsers) {
		PO_PrivateView.checkNumUsers(driver, numUsers);
	}
	
}