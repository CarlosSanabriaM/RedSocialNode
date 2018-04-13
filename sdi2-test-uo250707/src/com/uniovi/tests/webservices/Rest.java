package com.uniovi.tests.webservices;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;

import org.codehaus.jackson.node.ObjectNode;

public class Rest {
	
	public static ObjectNode get(String url) {
		ObjectNode respuestaJSON;
		respuestaJSON = ClientBuilder.newClient()
				.target(url)
				.request()
				.accept(MediaType.APPLICATION_JSON)
				.get()
				.readEntity(ObjectNode.class);

		return respuestaJSON;
	}
	
	public static ObjectNode post(String url, Entity<?> entity) {
		ObjectNode respuestaJSON;
		respuestaJSON = ClientBuilder.newClient()
				.target(url)
				.request()
				.accept(MediaType.APPLICATION_JSON)
				.post(entity)
				.readEntity(ObjectNode.class);
		
		return respuestaJSON;
	}
	
}
