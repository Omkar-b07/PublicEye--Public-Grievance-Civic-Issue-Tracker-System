/**
 * Centralized API functions for all issue-related endpoints.
 * Import and use these instead of calling api directly from pages.
 */
import api from './axios';

// ─── Issues ──────────────────────────────────────────────────────────────────

export const fetchIssues = (params = {}) =>
    api.get('/issues', { params }).then(r => r.data);

export const fetchMapIssues = () =>
    api.get('/issues/map').then(r => r.data);

export const fetchIssue = (id) =>
    api.get(`/issues/${id}`).then(r => r.data);

export const createIssue = (formData) =>
    api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);

export const upvoteIssue = (id) =>
    api.post(`/issues/${id}/upvote`).then(r => r.data);

export const updateIssueStatus = (id, newStatus) =>
    api.put(`/issues/${id}/status`, { status: newStatus }).then(r => r.data);

export const deleteIssueById = (id) =>
    api.delete(`/issues/${id}`);

export const submitIssueFeedback = (id, feedbackData) =>
    api.post(`/issues/${id}/feedback`, feedbackData).then(r => r.data);

export const flagFalseResolution = (id) =>
    api.post(`/issues/${id}/flag-false`).then(r => r.data);


// ─── Admin ───────────────────────────────────────────────────────────────────

export const fetchAdminIssues = (params = {}) =>
    api.get('/admin/issues', { params }).then(r => r.data);

export const fetchDepartments = () =>
    api.get('/admin/departments').then(r => r.data);

export const verifyIssue = (id) =>
    api.put(`/admin/issues/${id}/verify`).then(r => r.data);

export const rejectIssue = (id) =>
    api.put(`/admin/issues/${id}/reject`).then(r => r.data);

export const assignIssue = (id, assigned_to) =>
    api.put(`/admin/issues/${id}/assign`, { assigned_to }).then(r => r.data);

export const adminUpdateStatus = (id, status) =>
    api.put(`/admin/issues/${id}/status`, { status }).then(r => r.data);

export const checkDuplicates = (id) =>
    api.get(`/admin/issues/${id}/duplicates`).then(r => r.data);

export const adminDeleteIssue = (id) =>
    api.delete(`/admin/issues/${id}`);


// ─── Department ───────────────────────────────────────────────────────────────

export const fetchDepartmentIssues = () =>
    api.get('/department/issues').then(r => r.data);

export const resolveIssue = (id) =>
    api.put(`/department/issues/${id}/resolve`).then(r => r.data);

export const escalateIssue = (id) =>
    api.put(`/department/issues/${id}/escalate`).then(r => r.data);


// ─── Escalation / Senior Authority ───────────────────────────────────────────

export const fetchEscalatedIssues = () =>
    api.get('/escalation/issues').then(r => r.data);

export const fetchOverdueIssues = () =>
    api.get('/escalation/overdue').then(r => r.data);

export const interveneIssue = (id) =>
    api.put(`/escalation/issues/${id}/intervene`).then(r => r.data);

export const triggerAutoEscalation = () =>
    api.post('/escalation/auto-escalate').then(r => r.data);
