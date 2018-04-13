package com.uniovi.tests.webservices;

import static org.junit.Assert.assertTrue;

import javax.ws.rs.client.Entity;

import org.codehaus.jackson.node.ObjectNode;

import com.uniovi.tests.entities.UserCredentials;

public class Rest_Autenticar extends Rest {

	/**
	 * Envía una petición POST a la url /api/autenticar, pasandole en el body
	 * un objeto JSON con los campos email y password dados como parámetro
	 * 
	 * @param baseURL: la url base de la aplicación
	 * @param email: email que se va a enviar con la petición
	 * @param password: password que se va a enviar con la petición
	 */
	private static StatusAndResponseBody postAutenticar(String baseURL, String email, String password) {
		// Creamos una entidad con las credenciales 
		UserCredentials userCredentials = new UserCredentials(email, password);
		Entity<UserCredentials> entityUC = Entity.json(userCredentials);
		
		// Realizamos la petición post a la URL para autenticarse, 
		// pasandole en JSON el email y el password
		return post(baseURL + "/api/autenticar", entityUC);
	}
	
	/**
	 * Envía una petición POST a la url /api/autenticar, pasandole en el body
	 * un objeto JSON con los campos email y password dados como parámetro.
	 * Comprueba que el estado sea 200 OK, que se retorne un campo "authenticated" 
	 * con valor true y un campo token.
	 * 
	 * @param baseURL: la url base de la aplicación
	 * @param email: email que se va a enviar con la petición
	 * @param password: password que se va a enviar con la petición
	 */
	public static void postAutenticarAndCheckWasOk(String baseURL, String email, String password) {
		// Enviamos la petición post para autenticarnos
		StatusAndResponseBody response = postAutenticar(baseURL, email, password);
		
		// Comprobamos que devuelve una respuesta 200 OK
		assertTrue( response.getStatus() == 200 );
		
		// Comprobamos que retorna un campo token y un campo "authenticated" con valor true
		ObjectNode responseBody = response.getResponseBody();
		assertTrue( responseBody.get("authenticated").asBoolean() );
		assertTrue( responseBody.get("token") != null );//TODO - mejorar?? Como comprobar que sea String??
	}
	
	/**
	 * Envía una petición POST a la url /api/autenticar, pasandole en el body
	 * un objeto JSON con los campos email y password dados como parámetro.
	 * Comprueba que el estado sea 200 OK, que se retorne un campo "authenticated" 
	 * con valor false, que NO se retorne un campo token, y que se retorne un campo
	 * "message" con valor "Inicio de sesión no correcto"
	 * 
	 * @param baseURL: la url base de la aplicación
	 * @param email: email que se va a enviar con la petición
	 * @param password: password que se va a enviar con la petición
	 */
	public static void postAutenticarAndCheckWasWrong(String baseURL, String email, String password) {
		// Enviamos la petición post para autenticarnos
		StatusAndResponseBody response = postAutenticar(baseURL, email, password);
		
		// Comprobamos que devuelve una respuesta 401 Unauthorized
		assertTrue( response.getStatus() == 401 );
		
		// Comprobamos que retorna un campo "authenticated" con valor false, NO retorna un campo token,
		// y retorna un campo message con valor "Inicio de sesión no correcto"
		ObjectNode responseBody = response.getResponseBody();
		assertTrue( !responseBody.get("authenticated").asBoolean() );
		assertTrue( responseBody.get("token") == null );
		assertTrue( "Inicio de sesión no correcto".equalsIgnoreCase(responseBody.get("message").asText()) );
	}
	
}
