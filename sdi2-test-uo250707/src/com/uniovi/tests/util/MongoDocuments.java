package com.uniovi.tests.util;

import org.bson.BsonDocument;
import org.bson.Document;
import static org.junit.Assert.*;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

public class MongoDocuments {
	
	private static MongoClientURI connectionString = new MongoClientURI("mongodb://admin:sdi_2018@ds129593.mlab.com:29593/sdi2-uo250707");
	private static MongoClient mongoClient = new MongoClient(connectionString);
	private static MongoDatabase db = mongoClient.getDatabase("sdi2-uo250707");

	public static void deleteAllDocumentsInCollection(String collectionName) {

		MongoCollection<Document> collection = db.getCollection(collectionName);
		
		long numDocuments = collection.count();

		DeleteResult deleteResult = collection.deleteMany(new BsonDocument());
		long numDeletedDocuments = deleteResult.getDeletedCount();
		
		// Comprobamos que se hayan eliminado todos los documentos de la coleccion
		assertTrue(numDocuments == numDeletedDocuments);
	}
	
	
}
