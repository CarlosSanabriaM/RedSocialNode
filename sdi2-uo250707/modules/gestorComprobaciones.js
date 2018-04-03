module.exports = {
	mongo : null,
	init : function(mongo) {
		this.mongo = mongo;
	},
	isNotValidId : function(res, redirectUrl, id) {
		if(! this.mongo.ObjectID.isValid(id)){
			res.redirect(redirectUrl);
			return true;
		}
		else return false;
	}
};