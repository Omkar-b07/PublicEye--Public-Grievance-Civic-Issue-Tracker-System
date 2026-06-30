import express from 'express';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import Upvote from '../models/Upvote.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { findSimilarIssues } from '../utils/duplicateDetection.js';

const router = express.Router();

const toResponse = async (issue) => {
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
  return issueObj;
};

router.use(protect, adminOnly);

router.get('/issues', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip || '0');
    const limit = parseInt(req.query.limit || '200');
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;
    const search = req.query.search;
    const verified_only = req.query.verified_only === 'true';

    const query = {};

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

    const responses = await Promise.all(issues.map(toResponse));
    res.json(responses);
  } catch (error) {
    console.error('Admin get issues error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const depts = await User.find({ role: 'department' });
    res.json(depts);
  } catch (error) {
    console.error('Admin get departments error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/issues/:id/verify', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    issue.is_verified = true;
    issue.is_rejected = false;
    issue.status = 'VERIFIED';
    await issue.save();

    const response = await toResponse(issue);
    res.json(response);
  } catch (error) {
    console.error('Admin verify issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/issues/:id/reject', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    issue.is_rejected = true;
    issue.is_verified = false;
    issue.status = 'REJECTED';
    await issue.save();

    const response = await toResponse(issue);
    res.json(response);
  } catch (error) {
    console.error('Admin reject issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/issues/:id/assign', async (req, res) => {
  try {
    const { assigned_to } = req.body;
    if (!assigned_to) {
      return res.status(422).json({ detail: 'Missing assigned_to field' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    const deptUser = await User.findById(assigned_to);
    if (!deptUser || deptUser.role !== 'department') {
      return res.status(400).json({ detail: 'Assigned user must be a valid department user' });
    }

    issue.assigned_to = assigned_to;
    issue.status = 'IN_PROGRESS';
    await issue.save();

    const response = await toResponse(issue);
    res.json(response);
  } catch (error) {
    console.error('Admin assign issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/issues/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(422).json({ detail: 'Missing status field' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    issue.status = status.toUpperCase();
    if (issue.status === 'RESOLVED') {
      issue.resolved_at = new Date();
    }
    await issue.save();

    const response = await toResponse(issue);
    res.json(response);
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/issues/:id/duplicates', async (req, res) => {
  try {
    const target = await Issue.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    const allIssues = await Issue.find({ _id: { $ne: req.params.id } });
    const duplicates = findSimilarIssues(target, allIssues, req.params.id);

    const formattedDuplicates = duplicates.map(issue => ({
      id: issue.id,
      title: issue.title,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      upvotes: issue.upvotes,
      latitude: issue.latitude,
      longitude: issue.longitude,
      address: issue.address,
    }));

    res.json({
      checked_issue_id: req.params.id,
      duplicates: formattedDuplicates,
      count: formattedDuplicates.length,
    });
  } catch (error) {
    console.error('Admin duplicate detection error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.delete('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    await Upvote.deleteMany({ issue_id: req.params.id });

    res.status(204).end();
  } catch (error) {
    console.error('Admin delete issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
