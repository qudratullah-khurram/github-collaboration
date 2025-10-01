const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/token');

const User = require('../src/models/User');

router.get('/:userId', authMiddleware.authMiddleware, async (req, res) => {

  try {
    if (req.user._id !== req.params.userId){
      return res.status(403).json({ err: "Unauthorized"});
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found.'});
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
