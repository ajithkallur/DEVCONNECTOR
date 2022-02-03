const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const {check, validationResult} = require('express-validator');
const config = require('config');
//user model
const User = require('../../models/User');
const auth = require('../../middleware/auth')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

//@route   POST api/posts
//@desc    Create new post
//access   Private
router.post('/', 
[auth, 
[
    check('text','Text is required').notEmpty()
]
],
async (req,res) => {
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()}); 
}
try{
    const user = await User.findById(req.user.id).select('-password');
    const newPost =new Post( {
        text: req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    })
    const post = await newPost.save();
    res.json(post);
}catch(err){
console.error(err.message);
res.status(500).send('Server Error'); 
}

}
);

//@route   GET api/posts
//@desc    get all post
//access   Private
router.get('/', auth,async(req,res) =>{
    try{
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error'); 
    }
}
);

//@route   GET api/posts/:id
//@desc    get  post by id
//access   Private
router.get('/:id', auth,async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({ msg: 'Post not found'}); 
        }  
        res.json(post);
    }catch(err){
    console.error(err.message);

    //if id sent is not id of post we should return below msg
    if(err.kind === 'ObjectId'){
        res.status(404).json({ msg: 'Post not found'}); 
    }  
    res.status(500).send('Server Error'); 
    }
}
);

//@route   DELETE api/posts/:id
//@desc    delete  post by id
//access   Private
router.delete('/:id', auth,async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);

        //if post not found
        if(!post){
            res.status(404).json({ msg: 'Post not found'}); 
        }  
        //check user deleting the post owns the post
        if(post.user.toString() !==req.user.id){
            return res.status(401).json({msg: 'User not Authorized'})
        }
        await post.remove();
        res.json({msg:'Post removed'});
    }
    catch(err){
    console.error(err.message);
    
    //if id sent is not id of post we should return below msg
    if(err.kind === 'ObjectId'){
        res.status(404).json({ msg: 'Post not found'}); 
    }  
    res.status(500).send('Server Error'); 
    }
}
);
//@route   PUT api/posts/like/:id
//@desc    like a post
//access   Private
router.put('/like/:id', auth,async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);

        //if post not found
        if(!post){
            res.status(404).json({ msg: 'Post not found'}); 
        }  
        //check if post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'Post already liked by user'})
        }
        post.likes.unshift({user:req.user.id});
        await post.save();
        res.json(post.likes);
    }
    catch(err){
    console.error(err.message);
    
    //if id sent is not id of post we should return below msg
    if(err.kind === 'ObjectId'){
        res.status(404).json({ msg: 'Post not found'}); 
    }  
    res.status(500).send('Server Error'); 
    }
}
);
//@route   PUT api/posts/like/:id
//@desc    unlike a post
//access   Private
router.put('/unlike/:id', auth,async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);

        //if post not found
        if(!post){
            res.status(404).json({ msg: 'Post not found'}); 
        }  
        //check if post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg: 'Post is not liked by user'})
        }
        
        //Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);
    }
    catch(err){
    console.error(err.message);
    
    //if id sent is not id of post we should return below msg
    if(err.kind === 'ObjectId'){
        res.status(404).json({ msg: 'Post not found'}); 
    }  
    res.status(500).send('Server Error'); 
    }
}
);

//@route   POST api/posts/comments/:id
//@desc    Comment on a post
//access   Private
router.post('/comments/:id', 
[auth, 
[
    check('text','Text is required').notEmpty()
]
],
async (req,res) => {
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()}); 
}
try{
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);
    
    const newComment ={
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    };
    post.comments.unshift(newComment);
    await post.save();
    res.json(post.comments);
}catch(err){
console.error(err.message);
res.status(500).send('Server Error'); 
}

}
);


//@route   POST api/posts/comment/:id/:comment_id
//@desc    Delete a comment in post
//access   Private
router.delete('comment/:id/:comment_id', auth,async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);

        //if post not found
        if(!post){
            res.status(404).json({ msg: 'Post not found'}); 
        } 
        //Pull out comments
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        
        //Make sure comment exists
        if(!comment){
            return res.status(404).json({msg: 'Comment does not exists'})
        } 
        //check user deleting the post owns the post
        if(comment.user.toString() !==req.user.id){
            return res.status(401).json({msg: 'User not Authorized'})
        }
        //Get remove index
        const removeIndex = post.comments
              .map(comment =>comment.user.toString())
              .indexOf(req.user.id);
              post.comments.splice(removeIndex,1);

        await post.save();
        res.json(post.comments);
    }
    catch(err){
    console.error(err.message);

    //if id sent is not id of post we should return below msg
    if(err.kind === 'ObjectId'){
        res.status(404).json({ msg: 'Post not found'}); 
    }  
    res.status(500).send('Server Error'); 
    }
}
);

module.exports = router;