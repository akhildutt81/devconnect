let express = require('express');
let router = express.Router();
let auth = require('../../middleware/auth');
let Profiles = require('../../models/Profile');
let Users = require('../../models/User');
let { check, validationResult } = require('express-validator/check');

// public
router.get('/', async (req, res) => {
  try {
    let profiles = await Profiles.find().populate('user', ['name', 'gravatar']);
    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: 'Server Error' });
  }
});

//public
router.get('/user/:user_id', async (req, res) => {
  try {
    let profile = await Profiles.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'gravatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.json(profile);
  } catch (err) {
    console.log(err);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send({ msg: 'Server Error' });
  }
});

//private
router.delete('/user/:user_id', auth, async (req, res) => {
  try {
    console.log(await Profiles.findOneAndRemove({ user: req.user.id }));
    console.log(await Users.findOneAndRemove({ _id: req.user.id }));
    res.json({ msg: 'Removed User and profile' });
  } catch (err) {
    console.log(err);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send({ msg: 'Server Error' });
  }
});

// private
router.get('/me', auth, async (req, res) => {
  try {
    let userProfile = await Profiles.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!userProfile) {
      return res
        .status(400)
        .json({ error: { mgs: 'No profile associated with this user' } });
    }
    return res.json(userProfile);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal error');
  }
});
module.exports = router;

// private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let profileFields = { social: {} };
    Object.keys(req.body).forEach(key => {
      if (key == 'skills') {
        profileFields[key] = req.body[key]
          .split(',')
          .map(skill => skill.trim());
      } else if (
        key == 'facebook' ||
        key == 'twitter' ||
        key == 'linkedin' ||
        key == 'instagram'
      ) {
        profileFields.social[key] = req.body[key];
      } else {
        profileFields[key] = req.body[key];
      }
    });
    profileFields.user = req.user.id;
    console.log(await Profiles.findOne({ user: req.user.id }));
    try {
      let profile = await Profiles.findOne({ user: req.user.id });
      console.log(profile);
      if (profile) {
        profile = await Profiles.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profiles(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  }
);

router.put('/user/experience', [
  auth,
  [
    check('title', 'title is required')
      .not()
      .isEmpty(),
    check('company', 'company is required')
      .not()
      .isEmpty(),
    check('from', 'from is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { title, company, location, from, to, current, description } = req.body;
    let newExp = { title, company, location, from, to, current, description };
    try {
      let profile = await Profiles.findOne({ user: req.user.id });
      profile.experience.push(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errors: err });
    }
  }
]);

//private
router.delete('/user/experience/:exp_id', auth, async (req, res) => {
  try {
    let profile = await Profiles.findOne({ user: req.user.id });
    let removeInd = -1;
    //console.log(profile);
    profile.experience.forEach((exp, ind) => {
      if (exp._id == req.params.exp_id) {
        removeInd = ind;
      }
    });
    if (removeInd >= 0) {
      profile.experience.splice(removeInd);
    }
    console.log(removeInd);
    profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send({ msg: 'Server Error' });
  }
});

router.put('/user/education', [
  auth,
  [
    check('school', 'title is required')
      .not()
      .isEmpty(),
    check('degree', 'company is required')
      .not()
      .isEmpty(),
    check('fieldofstudy', 'from is required')
      .not()
      .isEmpty(),
    check('from', 'from is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;
    let newExp = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };
    try {
      let profile = await Profiles.findOne({ user: req.user.id });
      profile.education.push(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errors: err });
    }
  }
]);

//private
router.delete('/user/education/:edu_id', auth, async (req, res) => {
  try {
    let profile = await Profiles.findOne({ user: req.user.id });
    let removeInd = -1;
    //console.log(profile);
    profile.education.forEach((edu, ind) => {
      if (edu._id == req.params.edu_id) {
        removeInd = ind;
      }
    });
    if (removeInd >= 0) {
      profile.education.splice(removeInd);
    }
    profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send({ msg: 'Server Error' });
  }
});
