const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const request = require('request');
const config = require('config');
const {check, validationResult} = require('express-validator');

//@route   GET api/profile/me
//@desc    Get current user profile
//access   Private
router.get('/me', auth, async (req,res) => {
try{
const profile = await Profile.findOne({user: req.user.id}).populate(
    'user',
    ['name','avatar']
);
if(!profile){
    return res.status(400).json({msg: 'There is no profile for this user'})
}

res.json(profile);
}catch(error){
console.error(error.message);
res.status(500).send('Server Error');
}
});


//@route   POST api/profile/
//@desc    Create current user profile
//access   Private
router.post('/', [auth, [
    check('status','Status is Required').not().isEmpty(),
    check('skills','skills is Required').not().isEmpty()
]
],
 async (req,res) =>{
     const errors = validationResult(req);
     if (!errors.isEmpty()){
         return res.status(400).json({errors: errors.array()});
     } 
 // destructure the request
 const {
   company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
    // spread the rest of the fields we don't need to check
    //...rest
  } = req.body;

  // build a profile
  const profileFields = {}
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;
if(skills){
  profileFields.skills = skills.split(',').map(skills =>skills.trim());

}
console.log(profileFields.skills);

//Build social object
profileFields.social ={}
if(youtube) profileFields.social.youtube = youtube;
if(twitter) profileFields.social.twitter = twitter;
if(facebook) profileFields.social.facebook = facebook;
if(linkedin) profileFields.social.linkedin = linkedin;
if(instagram) profileFields.social.instagram = instagram;
  try {
    // Using upsert option (creates new doc if no match is found):
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
}
);

//@route   GET api/profile
//@desc    Get all user profile
//access   Public
router.get('/', async (req,res) => {
  try{
  const profiles = await Profile.find().populate('user',['name','avatar']);
  if(!profiles){
      return res.status(400).json({msg: 'There is no profile for this user'})
  }
  
  res.json(profiles);
  }catch(error){
  console.error(error.message);
  res.status(500).send('Server Error');
  }
  });

//@route   GET api/profile/user/:user_id
//@desc    Get profile by user ID
//access   Public
router.get('/user/:user_id', async (req,res) => {
  try{
  const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);
  if(!profile){
      return res.status(400).json({msg: 'Profile not found'})
  }
  res.json(profile);
  }catch(err){
  console.error(err.message);
  if(err.kind == 'ObjectId'){
    return res.status(400).json({msg:'Profile not found'});
  }
  res.status(500).send('Server Error');
  }
  });

//@route   DELETE api/profile
//@desc    Delete user profile, user , posts
//access   Private
router.delete('/', auth, async (req,res) => {
  try{
    //@todo- remove user
    //Remove Profile
    await Profile.findOneAndRemove({user:req.user.id})
    await User.findOneAndRemove({_id:req.user.id})
  res.json({msg: 'User deleted'});
  }catch(error){
  console.error(error.message);
  res.status(500).send('Server Error');
  }
  });

//@route   PUT api/profile/experience
//@desc    Update profile experience
//access   Private
router.put('/experience', [auth,[
  check('title', 'title is required').notEmpty(),
  check('company', 'company is required').notEmpty(),
  check('from', 'from date is required').notEmpty()
]
],
async (req,res) => {
const errors = validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors: errors.array()});
}
const{
  title,
  company, 
  location, 
  from, 
  to, 
  current, 
  description
} = req.body;

const newExp ={title,
  company, 
  location, 
  from, 
  to, 
  current, 
  description
}

  try{
   const profile = await Profile.findOne({ user: req.user.id});
   //push into exp array at the beginningt
   profile.experience.unshift(newExp);
   await profile.save();
  res.json(profile);
  }catch(error){
  console.error(error.message);
  res.status(500).send('Server Error');
  }
  });

//@route   DELETE api/profile/experience/:exp_id
//@desc    Delete user profile experience
//access   Private
router.delete('/experience/:exp_id', auth, async (req,res) => {
  try{
    const profile = await Profile.findOne({ user: req.user.id});
    //get remove index
    const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
    //remove profile
    profile.experience.splice(removeIndex,1);
    await profile.save();
   res.json(profile);
   }catch(error){
   console.error(error.message);
   res.status(500).send('Server Error');
   }
   });




//@route   PUT api/profile/education
//@desc    Update profile education
//access   Private
router.put('/education', [auth,[
  check('school', 'school is required').notEmpty(),
  check('degree', 'degree is required').notEmpty(),
  check('fieldofstudy', 'fieldofstudy is required').notEmpty(),
  check('from', 'from date is required').notEmpty()
]
],
async (req,res) => {
const errors = validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors: errors.array()});
}
const{
  school,
  degree, 
  fieldofstudy, 
  from, 
  to, 
  current, 
  description
} = req.body;

const newEdu ={
  school,
  degree, 
  fieldofstudy, 
  from, 
  to, 
  current, 
  description
}

  try{
   const profile = await Profile.findOne({ user: req.user.id});
   //push into exp array at the beginningt
   profile.education.unshift(newEdu);
   await profile.save();
  res.json(profile);
  }catch(error){
  console.error(error.message);
  res.status(500).send('Server Error');
  }
  });

//@route   DELETE api/profile/education/:edu_id
//@desc    Delete user education
//access   Private
router.delete('/education/:edu_id', auth, async (req,res) => {
  try{
    const profile = await Profile.findOne({ user: req.user.id});
    //get remove index
    const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);
    //remove education
    profile.education.splice(removeIndex,1);
    await profile.save();
   res.json(profile);
   }catch(error){
   console.error(error.message);
   res.status(500).send('Server Error');
   }
   });


//@route   GET api/profile/github/:username
//@desc    Get github profile by user name
//access   Public
// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: 'No Github profile found' });
  }
});

module.exports = router;

