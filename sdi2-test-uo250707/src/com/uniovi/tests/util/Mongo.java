package com.uniovi.tests.util;

import static org.junit.Assert.assertTrue;

import java.util.logging.Level;

import org.bson.BsonDocument;
import org.bson.BsonString;
import org.bson.Document;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

public class Mongo {
	
	private static String database = "sdi2-uo250707";
	
	public Mongo() {
		// Configuramos el log del driver de mongo, para que solo muestre los mensajes críticos
		java.util.logging.Logger.getLogger("org.mongodb.driver").setLevel(Level.SEVERE);
	}
	
	private MongoClient createMongoDBClient() {
		MongoClientURI connectionString = 
				new MongoClientURI("mongodb://admin:sdi_2018@ds129593.mlab.com:29593/sdi2-uo250707");
		
		return new MongoClient(connectionString);
	}
	
	public void deleteAllDocumentsInCollection(String collectionName) {
		MongoClient mongoClient = createMongoDBClient();
		MongoDatabase db = mongoClient.getDatabase(database);
		
		MongoCollection<Document> collection = db.getCollection(collectionName);
		
		long numDocuments = collection.count();

		DeleteResult deleteResult = collection.deleteMany(new BsonDocument());
		long numDeletedDocuments = deleteResult.getDeletedCount();
		
		mongoClient.close();
		
		// Comprobamos que se hayan eliminado todos los documentos de la coleccion
		assertTrue(numDocuments == numDeletedDocuments);
	}

	public void deleteUserWithEmail(String email) {
		MongoClient mongoClient = createMongoDBClient();
		MongoDatabase db = mongoClient.getDatabase(database);
		
		MongoCollection<Document> collection = db.getCollection("users");
		
		BsonDocument criterio = new BsonDocument().append("email", new BsonString(email));
		collection.deleteOne(criterio);
		
		mongoClient.close();
	}	
	
	private void insertDocumentInCollection(Document document, String collectionName) {
		MongoClient mongoClient = createMongoDBClient();
		MongoDatabase db = mongoClient.getDatabase(database);
		
		MongoCollection<Document> collection = db.getCollection(collectionName);
		
		collection.insertOne(document);
		
		mongoClient.close();
	}	
	
	public void insertFriendshipInFriendsCollection(String userEmail, String otherUserEmail) {
		// Creamos el documento friendship
		Document friendship = new Document();
		friendship.append("userEmail", userEmail);
		friendship.append("otherUserEmail", otherUserEmail);
		
		// Lo insertamos en la colección 'friends'
		insertDocumentInCollection(friendship, "friends");
	}	
	
}
