package com.uniovi.tests.webservices;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jackson.node.ObjectNode;

public class Rest {
	
	public static StatusAndResponseBody get(String url) {
		Response response = ClientBuilder.newClient()
				.target(url)
				.request()
				.accept(MediaType.APPLICATION_JSON)
				.get();

		int status = response.getStatus();
		ObjectNode respuestaJSON = response.readEntity(ObjectNode.class);
		
		return new StatusAndResponseBody(status, respuestaJSON);
	}
	
	public static StatusAndResponseBody post(String url, Entity<?> entity) {
		Response response = ClientBuilder.newClient()
				.target(url)
				.request()
				.accept(MediaType.APPLICATION_JSON)
				.post(entity);
		
		int status = response.getStatus();
		ObjectNode respuestaJSON = response.readEntity(ObjectNode.class);
		
		return new StatusAndResponseBody(status, respuestaJSON);
	}
	
}
