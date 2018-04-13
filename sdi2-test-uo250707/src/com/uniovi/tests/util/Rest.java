package com.uniovi.tests.util;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.MediaType;

import org.codehaus.jackson.node.ObjectNode;

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
	
}
