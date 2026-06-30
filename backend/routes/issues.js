import express from 'express';
import Issue from '../models/Issue.js';
import Upvote from '../models/Upvote.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../utils/imageUpload.js';

const router = express.Router();

const attachUpvoteFlag = async (issue, user) => {
  let issueObj;
  if (issue.toObject) {
    issueObj = issue.toObject();
  } else {
    issueObj = { ...issue };
  }
  
  if (issue.created_by) {
    const creator = await User.findById(issue.created_by);
    if (creator) {
      issueObj.creator = creator.toObject();
    } else {
      issueObj.creator = null;
    }
  } else {
    issueObj.creator = null;
  }

  if (issue.assigned_to) {
    const assignee = await User.findById(issue.assigned_to);
    if (assignee) {
      issueObj.assignee = assignee.toObject();
    } else {
      issueObj.assignee = null;
    }
  } else {
    issueObj.assignee = null;
  }

  issueObj.user_has_upvoted = false;
  if (user) {
    const voted = await Upvote.findOne({ user_id: user.id, issue_id: issue.id });
    issueObj.user_has_upvoted = !!voted;
  }
  return issueObj;
};

const toMapPoint = (issue) => {
  return {
    id: issue.id,
    title: issue.title,
    category: issue.category,
    status: issue.status,
    priority: issue.priority,
    upvotes: issue.upvotes,
    latitude: issue.latitude,
    longitude: issue.longitude,
    address: issue.address,
  };
};

router.post('', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, priority } = req.body;

    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
      return res.status(422).json({ detail: 'Missing required fields' });
    }

    const latFloat = parseFloat(latitude);
    const lonFloat = parseFloat(longitude);

    let image_url = null;
    if (req.file) {
      image_url = `/static/uploads/${req.file.filename}`;
    }

    const allowedPriorities = ['HIGH', 'MEDIUM', 'LOW'];
    let priorityUpper = (priority || 'MEDIUM').toUpperCase();
    if (!allowedPriorities.includes(priorityUpper)) {
      priorityUpper = 'MEDIUM';
    }

    const issue = new Issue({
      title,
      description,
      category,
      latitude: latFloat,
      longitude: lonFloat,
      address: address || null,
      priority: priorityUpper,
      image_url,
      created_by: req.user.id,
      status: 'PENDING',
    });

    await issue.save();

    const response = await attachUpvoteFlag(issue, req.user);
    res.status(201).json(response);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ detail: error.message || 'Internal server error' });
  }
});

router.get('', protect, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip || '0');
    const limit = parseInt(req.query.limit || '100');
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;
    const verified_only = req.query.verified_only === 'true';
    const search = req.query.search;

    const query = {};

    if (req.user.role === 'citizen') {
      query.created_by = req.user.id;
    }

    if (verified_only) {
      query.is_verified = true;
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority.toUpperCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const responses = await Promise.all(
      issues.map(issue => attachUpvoteFlag(issue, req.user))
    );

    res.json(responses);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/map', protect, async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'citizen') {
      query.created_by = req.user.id;
    } else {
      query.is_verified = true;
    }

    const issues = await Issue.find(query);
    const mapPoints = issues.map(toMapPoint);

    res.json(mapPoints);
  } catch (error) {
    console.error('Get map issues error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    if (req.user.role === 'citizen' && issue.created_by !== req.user.id) {
      return res.status(403).json({ detail: 'Not authorized to view this issue' });
    }

    const response = await attachUpvoteFlag(issue, req.user);
    res.json(response);
  } catch (error) {
    console.error('Get single issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    const existing = await Upvote.findOne({
      user_id: req.user.id,
      issue_id: req.params.id,
    });

    let user_has_upvoted = false;

    if (existing) {
      await Upvote.findByIdAndDelete(existing.id);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
      user_has_upvoted = false;
    } else {
      const upvote = new Upvote({
        user_id: req.user.id,
        issue_id: req.params.id,
      });
      await upvote.save();
      issue.upvotes += 1;
      user_has_upvoted = true;
    }

    await issue.save();

    res.json({
      issue_id: issue.id,
      upvotes: issue.upvotes,
      user_has_upvoted,
    });
  } catch (error) {
    console.error('Toggle upvote error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(422).json({ detail: 'Missing field: status' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    issue.status = status.toUpperCase();
    await issue.save();

    const response = await attachUpvoteFlag(issue, req.user);
    res.json(response);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    await Upvote.deleteMany({ issue_id: req.params.id });

    res.status(204).end();
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (rating === undefined) {
      return res.status(422).json({ detail: 'Missing field: rating' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    if (issue.created_by !== req.user.id) {
      return res.status(403).json({ detail: 'Only the original creator can submit feedback.' });
    }

    if (issue.status !== 'RESOLVED') {
      return res.status(400).json({ detail: 'Feedback can only be submitted for resolved issues.' });
    }

    if (issue.feedback_rating !== null) {
      return res.status(400).json({ detail: 'Feedback has already been submitted for this issue.' });
    }

    issue.feedback_rating = rating;
    issue.feedback_text = text || null;
    await issue.save();

    const response = await attachUpvoteFlag(issue, req.user);
    res.json(response);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/:id/flag-false', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    if (issue.created_by !== req.user.id) {
      return res.status(403).json({ detail: 'Only the original creator can flag a false resolution.' });
    }

    if (issue.status !== 'RESOLVED') {
      return res.status(400).json({ detail: 'Only resolved issues can be flagged.' });
    }

    if (issue.is_false_resolution) {
      return res.status(400).json({ detail: 'This issue has already been flagged.' });
    }

    issue.is_false_resolution = true;
    issue.escalated_at = new Date();
    await issue.save();

    const response = await attachUpvoteFlag(issue, req.user);
    res.json(response);
  } catch (error) {
    console.error('Flag false resolution error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
