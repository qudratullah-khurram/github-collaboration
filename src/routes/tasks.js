const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router(); 

// Create a task (only by users, not professionals)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, comment, dueDate } = req.body;

    if (req.user.isProfessional) {
      return res.status(403).json({ message: 'Only users can create tasks. Professionals are not allowed.' });
    }
    const task = await Task.create({
      owner: req.user._id, title, description, comment, dueDate});
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// - Users see only their own tasks
// - Professionals see all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const q = {};
    if (!req.user.isProfessional) {
      q.owner = req.user._id;
    }
    const tasks = await Task.find(q)
      .select('title description dueDate status owner offers.createdAt')
      .populate('owner', 'name');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit a task (only owner and if not accepted)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    // don't allow edits if any offer is accepted or status != open
    const accepted = task.offers.some(o => o.status === 'accepted');
    if (accepted || task.status !== 'open') return res.status(400).json({ message: 'Cannot edit task once in progress or accepted' });
    const updatable = ['title','description','comment','dueDate','category','location','urgency'];
    updatable.forEach(k => { if (req.body[k] !== undefined) task[k] = req.body[k]; });
    await task.save();
    res.json(task);
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// Delete a task (only owner and before accepted)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const accepted = task.offers.some(o => o.status === 'accepted');
    if (accepted) return res.status(400).json({ message: 'Cannot delete task after an offer was accepted' });
    await task.remove();
    res.json({ message: 'Task deleted' });
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// Professionals: send an offer to a task
router.post('/:id/offers', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isProfessional) {
      return res.status(403).json({ message: 'Only professionals can send offers.' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const { price, message } = req.body;
    task.offers.push({
      professional: req.user._id, price, message});
    await task.save();
    res.json({ message: 'Offer sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Owner: accept or reject an offer
router.post('/:taskId/offers/:offerId/decision', authMiddleware, async (req, res) => {
  try {
    const { decision } = req.body; // 'accept' or 'reject'
    const task = await Task.findById(req.params.taskId).populate('offers.professional');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const offer = task.offers.id(req.params.offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (decision === 'accept') {
      // mark offer accepted and others rejected
      task.offers.forEach(o => { o.status = (o._id.toString() === offer._id.toString()) ? 'accepted' : (o.status === 'accepted' ? 'rejected' : o.status); });
      task.status = 'in_progress';
      await task.save();
      return res.json({ message: 'Offer accepted' });
    } else if (decision === 'reject') {
      offer.status = 'rejected';
      await task.save();
      return res.json({ message: 'Offer rejected' });
    } else {
      return res.status(400).json({ message: 'Invalid decision' });
    }
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// Professionals: mark a task as complete (only if their offer was accepted)
router.post('/:taskId/complete', authMiddleware, requireRole('professional'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const acceptedOffer = task.offers.find(o => o.status === 'accepted');
    if (!acceptedOffer) return res.status(400).json({ message: 'No accepted offer' });
    if (acceptedOffer.professional.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'You are not assigned to this task' });
    task.status = 'completed';
    await task.save();
    // update professional stats
    const prof = await User.findById(req.user._id);
    prof.profile.completedTasks = (prof.profile.completedTasks || 0) + 1;
    await prof.save();
    res.json({ message: 'Task marked as complete' });
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// Comment on a task
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!req.user.isProfessional && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Users can comment only on their own tasks' });
    }
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Missing text' });
    }
    task.comments.push({
      author: req.user._id,
      text
    });
    await task.save();
    res.json({ message: 'Comment added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
