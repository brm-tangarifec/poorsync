var mongoose = require('mongoose');

//Db Connection
mongoose.connect('mongodb://localhost:27017/p1ngu1_mgdb');

//Schema
var Schema = mongoose.Schema;

userSchema = new Schema({
  idUser:{ type: Number, required: true, unique: false },
  pasos:{
  	paso1:Boolean,
	paso2:Boolean,
  	paso3:Boolean,
  	paso4:Boolean
  }
},{ collection:'png_sync_user'});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('png_sync_user',userSchema);

// make this available to our users in our Node applications
module.exports = User;

module.exports={

	InsertUser:function (id,res1,res2,res3,res4)
	{
		var user = new User({idUser: id, pasos:{paso1:res1,paso2:res2,paso3:res3,paso4:res4}});

		user.save(function(err){
		if(err)
		{
			console.log("ha ocurrido un error"+ err);
		}
		else
		{
			console.log(user);
		}
		});
	}

}