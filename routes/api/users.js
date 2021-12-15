const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
//user model
const User = require('../../models/User');

//@route   POST api/users
//@desc    Register user
//access   public
router.post('/', [
check('name','Name is required').not().isEmpty(),
check('email','Email is required').isEmail(),
check('password','Password is required with  length  6 or more characters').isLength({min: 6})
], 
async (req,res) => {
const errors = validationResult(req);
if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
}
const{name, email, password} = req.body;
try{
    let user = await User.findOne({email});
    //See if user exists already
    if(user){
        res.status(400).json({errors: [{msg:'User already exists'}]});
    }
//Get users garavatar
const avatar = gravatar.url(email,{
    s: '200',
    r: 'pg',
    d: 'mn'
})
//create new user
user = new User({
    name,
    email,
    avatar,
    password
});
//encrypt password
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(password,salt);
//save user to DB
await user.save();

//return jsonwebtoken
res.send('User registered');
}catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');

}


});
module.exports = router;
