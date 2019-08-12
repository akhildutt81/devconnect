let express = require('express');
let router = express.Router();
let auth = require('../../middleware/auth');
let Profiles = require('../../models/Profile');
let Users = require('../../models/User');
let Posts = require('../../models/Post');
let config=require('config');
let { check, validationResult } = require('express-validator/check');

// private
router.post('/', [
	auth,
	[
		check('text','post cannot be empty').not().isEmpty()
	]],async (req, res) => {
		let errors=validationResult(req);
		if(!errors.isEmpty()){
			return res.status(400).json({errors:errors.array()})
		}
		try{
			let user=await Users.findById(req.user.id).select("-password");
			let newPost=new Posts({
				text:req.body.text,
				name:user.name,
				avatar:user.avatar,
				user:req.user.id
			})
			let post=await newPost.save();
			return res.json(post);
		}
		catch(err){
			return res.json(500).send("Server Error");
		}
});

// private
router.get('/',auth,async (req,res)=>{
	try{
		let post=await Posts.find().sort({date:-1});
		return res.json(post);
	}
	catch(err){
		return res.status(500).json({"msg":"Server error"});
	}
});

// private
router.get('/:post_id',auth,async (req,res)=>{
	try{
		let post=await Posts.findById({_id:req.params.post_id});
		if(!post){
			return res.status(400).return("post not found");
		}
		return res.json(post);
	}
	catch(err){
		if(err.kind=="ObjectId"){
			return res.status(400).return("post not found");
		}
		return res.status(500).json({"msg":"Server error"});
	}
})

// private
router.delete('/:post_id',auth,async (req,res)=>{
	try{
		let post=await Posts.findById({_id:req.params.post_id});
		if(!post){
			return res.status(400).send("post not found");
		}
		if(post.user.toString()!==req.user.id){
			return res.status(401).send("not authorized");
		}
		await post.remove();
		return res.json({"msg":"deleted"});
	}
	catch(err){
		console.log(err)
		if(err.kind=="ObjectId"){
			return res.status(400).send("post not found");
		}
		return res.status(500).json({"msg":"Server error"});
	}
})

//private
router.put('/like/:post_id',auth,async (req,res)=>{
	try{
		let posts= await Posts.findById(req.params.post_id);
		console.log(posts)
		if(posts.likes.some((like)=>like.user.toString()==req.user.id)){
			return res.status(400).send("post already liked")
		}
		posts.likes.push({user:req.user.id})
		posts.save();
		return res.json(posts.likes);
	}
	catch(err){
		console.log(err);
		res.status(500).send("Server error");
	}
})

//private
router.delete('/like/:post_id',auth,async (req,res)=>{
	try{
		let posts= await Posts.findById(req.params.post_id);
		let removeInd=-1;
		posts.likes.forEach((like,ind)=>{
			if(like.user.toString()==req.user.id){
				removeInd=ind;
			}
		})
		if(removeInd<0){
			return res.status(400).send("Not liked");
		}
		posts.likes.splice(removeInd);
		await posts.save();
		return res.json(posts.likes);
	}
	catch(err){
		console.log(err);
		res.status(500).send("Server error");
	}
})

//private
router.post('/comment/:id', [
	auth,
	[
		check('text','post cannot be empty').not().isEmpty()
	]],async (req, res) => {
		let errors=validationResult(req);
		if(!errors.isEmpty()){
			return res.status(400).json({errors:errors.array()})
		}
		try{
			let user=await Users.findById(req.user.id).select("-password");
			let post=await Posts.findById(req.params.id);
			let newComment=({
				text:req.body.text,
				name:user.name,
				avatar:user.avatar,
				user:req.user.id
			})
			post.comments.unshift(newComment);
			await post.save();
			return res.send("posted");
		}
		catch(err){
			return res.json(500).send("Server Error");
		}
});

router.delete('/comment/:id/:com_id',auth,async (req,res)=>{
	try{
		let posts=await Posts.findById(req.params.id);
		let removeInd=-1;
		//console.log(posts);
		if(posts.user.toString()==req.user.id){
			return res.status(401).send("not authorized");
		}
		posts.comments.forEach((comment,ind)=>{
			console.log(comment._id.toString(),req.params.com_id);
			if(comment._id.toString()==req.params.com_id){
				removeInd=ind;
			}
		})
		if(removeInd<0){
			return res.status(400).send("Not commented");
		}
		posts.comments.splice(removeInd);
		await posts.save();
		return res.json(posts.comments);
	}
	catch(err){
		console.log(err);
		res.status(500).send("deleted");
	}
})
module.exports = router;