const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
//user model
const User = require('../../models/User');


//@route   POST api/users
//@desc    Authenticate User and get token
//access   public
router.post('/', [
    check('email','Email is required').isEmail(),
    check('password','Password is required with  length  6 or more characters').exists()
    ], 
    async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    
    const{email, password} = req.body;
    
    try{
        let user = await User.findOne({email});
        //See if user exists
        if(!user){
            return res.status(400).json({errors: [{msg:'Invalid Credentials'}]});
        }
        
      const isMatch = await bcrypt.compare(password, user.password);
      if(!isMatch)  {
        return res.status(400).json({errors: [{msg:'Invalid Credentials'}]});
      }
    //return jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }
    jwt.sign(payload, 
        config.get('jwtSecret'),
        {expiresIn: 360000},
       (err,token) => {
           if(err) throw err;
           res.json({token});
       }
        );
    
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    });
module.exports = router;