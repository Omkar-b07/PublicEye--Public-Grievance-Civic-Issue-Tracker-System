import express from 'express';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { protect, seniorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

const HIGH_PRIORITY_HOURS = 24;
const MEDIUM_PRIORITY_HOURS = 72;
const LOW_PRIORITY_HOURS = 120;

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

router.use(protect, seniorOrAdmin);

router.get('/issues', async (req, res) => {
  try {
    const query = {
      escalated_at: { $ne: null },
      $or: [
        { status: { $ne: 'RESOLVED' } },
        { is_false_resolution: true },
      ],
    };

    const issues = await Issue.find(query).sort({ escalated_at: 1 });
    const responses = await Promise.all(issues.map(toResponse));

    res.json(responses);
  } catch (error) {
    console.error('Get escalated issues error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/overdue', async (req, res) => {
  try {
    const now = new Date();
    const highCutoff = new Date(now.getTime() - HIGH_PRIORITY_HOURS * 60 * 60 * 1000);
    const mediumCutoff = new Date(now.getTime() - MEDIUM_PRIORITY_HOURS * 60 * 60 * 1000);
    const lowCutoff = new Date(now.getTime() - LOW_PRIORITY_HOURS * 60 * 60 * 1000);

    const query = {
      status: 'IN_PROGRESS',
      resolved_at: null,
      $or: [
        { priority: 'HIGH', created_at: { $lt: highCutoff } },
        { priority: 'MEDIUM', created_at: { $lt: mediumCutoff } },
        { priority: 'LOW', created_at: { $lt: lowCutoff } },
      ],
    };

    const issues = await Issue.find(query).sort({ created_at: 1 });
    const responses = await Promise.all(issues.map(toResponse));

    res.json(responses);
  } catch (error) {
    console.error('Get overdue issues error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/issues/:id/intervene', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found' });
    }

    issue.status = 'RESOLVED';
    issue.resolved_at = new Date();
    await issue.save();

    const response = await toResponse(issue);
    res.json(response);
  } catch (error) {
    console.error('Intervene issue error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/auto-escalate', async (req, res) => {
  try {
    const now = new Date();
    const highCutoff = new Date(now.getTime() - HIGH_PRIORITY_HOURS * 60 * 60 * 1000);
    const mediumCutoff = new Date(now.getTime() - MEDIUM_PRIORITY_HOURS * 60 * 60 * 1000);
    const lowCutoff = new Date(now.getTime() - LOW_PRIORITY_HOURS * 60 * 60 * 1000);

    const query = {
      status: 'IN_PROGRESS',
      escalated_at: null,
      $or: [
        { priority: 'HIGH', created_at: { $lt: highCutoff } },
        { priority: 'MEDIUM', created_at: { $lt: mediumCutoff } },
        { priority: 'LOW', created_at: { $lt: lowCutoff } },
      ],
    };

    const overdueIssues = await Issue.find(query);

    let count = 0;
    for (const issue of overdueIssues) {
      issue.escalated_at = new Date();
      await issue.save();
      count++;
    }

    res.json({ message: `Auto-escalated ${count} overdue issues.` });
  } catch (error) {
    console.error('Auto escalate error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
