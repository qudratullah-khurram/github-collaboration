const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../src/models/User');

const saltRounds = 12;

router.post('/sign-up', async (req, res) => {
  let isProfessional = req.body.isProfessional == "on" ? true : false;

  try {
    const userInDatabase = await User.findOne({ email: req.body.email });

    if (userInDatabase) {
      return res.status(409).json({ err: 'Email already registered.' });
    }

    const user = await User.create({
      name: req.body.name,
      passwordHash: bcrypt.hashSync(req.body.password, saltRounds),
      email: req.body.email,
      isProfessional: isProfessional
    });

    const payload = { name: user.name, _id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});



router.post('/sign-in', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: 'User Not Found.' });
    }
console.log('user.passwordHash:', user.passwordHash);

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.passwordHash
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: 'Incorrect Password!' });
    }
    const payload = {
      _id: user._id,
      name: user.name,
      isProfessional: user.isProfessional,
      role: user.isProfessional ? 'professional' : 'user'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (err) {
     console.error('Sign-in error:', err); 
    res.status(500).json({ err: err.message });
  }
});





module.exports = router;
