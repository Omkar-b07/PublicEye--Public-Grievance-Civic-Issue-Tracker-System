import express from 'express';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { protect, departmentOrAdmin } from '../middleware/auth.js';

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

router.use(protect, departmentOrAdmin);

router.get('/issues', async (req, res) => {
  try {
    const query = { status: 'IN_PROGRESS' };

    if (req.user.role === 'department') {
      query.assigned_to = req.user.id;
    }

    const issues = await Issue.find(query).sort({ created_at: 1 });
    const responses = await Promise.all(issues.map(toResponse));

    res.json(responses);
  } catch (error) {
    console.error('Department get issues error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/issues/:id/resolve', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    if (req.user.role === 'department' && issue.assigned_to !== req.user.id) {
      return res.status(403).json({ detail: 'You can only resolve issues assigned to you.' });
    }

    issue.status = 'RESOLVED';
    issue.resolved_at = new Date();
    await issue.save();

    const response = await toResponse(issue);
    res.json(response);
  } catch (error) {
    console.error('Department resolve issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/issues/:id/escalate', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    if (req.user.role === 'department' && issue.assigned_to !== req.user.id) {
      return res.status(403).json({ detail: 'You can only escalate issues assigned to you.' });
    }

    issue.escalated_at = new Date();
    await issue.save();

    const response = await toResponse(issue);
    res.json(response);
  } catch (error) {
    console.error('Department escalate issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
