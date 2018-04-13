package com.uniovi.tests.webservices;

import org.codehaus.jackson.node.ObjectNode;

public class StatusAndResponseBody {

	private int status;
	private ObjectNode responseBody;
	
	public StatusAndResponseBody(int status, ObjectNode responseBody) {
		this.status = status;
		this.responseBody = responseBody;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public ObjectNode getResponseBody() {
		return responseBody;
	}

	public void setResponseBody(ObjectNode responseBody) {
		this.responseBody = responseBody;
	}

}
