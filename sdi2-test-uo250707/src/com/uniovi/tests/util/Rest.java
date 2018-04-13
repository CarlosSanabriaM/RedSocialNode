package com.uniovi.tests.util;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;

import org.codehaus.jackson.node.ObjectNode;

import com.uniovi.tests.entities.UserCredentials;

public class Rest {
	
	public ObjectNode get(String url) {
		ObjectNode respuestaJSON;
		respuestaJSON = ClientBuilder.newClient()
				.target(url)
				.request()
				.accept(MediaType.APPLICATION_JSON)
				.get()
				.readEntity(ObjectNode.class);

		return respuestaJSON;
	}
	
	public ObjectNode post(String url, Entity<?> entity) {
		ObjectNode respuestaJSON;
		respuestaJSON = ClientBuilder.newClient()
				.target(url)
				.request()
				.accept(MediaType.APPLICATION_JSON)
				.post(entity)
				.readEntity(ObjectNode.class);
		
		return respuestaJSON;
	}
	
	public ObjectNode postAutenticar(String baseURL, String email, String password) {
		// Creamos una entidad con las credenciales 
		UserCredentials userCredentials = new UserCredentials(email, password);
		Entity<UserCredentials> entityUC = Entity.json(userCredentials);
		
		// Realizamos la petición post a la URL para autenticarse, 
		// pasandole en JSON el email y el password
		return post(baseURL + "/api/autenticar", entityUC);
	}
	
}
