let mongoose=require("mongoose");
let schema=mongoose.Schema;

let PostSchema= new schema({
	user:{
		type:schema.Types.ObjectId,
		ref:'user'
	},
	text:{
		type:String,
		required:true
	},
	name:{
		type:String
	},
	avatar:{
		type:String
	},
	likes:[
		{
			user:{
				type:schema.Types.ObjectId,
				ref:'user'
			}
		}
	],
	comments:[{
		users:{
			type:schema.Types.ObjectId,
			ref:'user'
		},
		text:{
			type:String,
			required:true
		},
		name:{
			type:String
		},
		avatar:{
			type:String
		},
		date:{
			type:Date,
			default:Date.now
		}
	}],
	date:{
		type:Date,
		default:Date.now
	}
});

let PostModel=mongoose.model('post',PostSchema);

module.exports=PostModel