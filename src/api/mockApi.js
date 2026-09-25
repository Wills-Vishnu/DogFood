// Mock API layer - simulates REST API calls with realistic latency
import * as mockData from '../mocks/data';

const DELAY = 300; // ms

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createResponse(data, status = 'success') {
  return Promise.resolve({ status, data, timestamp: new Date() });
}

function createError(message, status = 'error') {
  return Promise.reject({ status, message, timestamp: new Date() });
}

// Authentication
export const authApi = {
  async login(email, password) {
    await delay(DELAY);
    const user = Object.values(mockData.mockUsers).find(u => u.email === email);
    if (!user || password !== 'password') {
      return createError('Invalid credentials');
    }
    mockData.setCurrentUser(user);
    return createResponse({ user, token: 'mock-jwt-token-' + user.id });
  },

  async logout() {
    await delay(DELAY);
    return createResponse({ success: true });
  },

  async getCurrentUser() {
    await delay(DELAY);
    return createResponse(mockData.currentUser);
  },

  async register(email, password, name) {
    await delay(DELAY);
    if (Object.values(mockData.mockUsers).find(u => u.email === email)) {
      return createError('Email already exists');
    }
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role: mockData.ROLES.PARTICIPANT,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };
    mockData.setCurrentUser(user);
    return createResponse({ user, token: 'mock-jwt-token-' + user.id });
  },
};

// Events
export const eventsApi = {
  async getEvents(filters = {}) {
    await delay(DELAY);
    let events = [...mockData.mockEvents];

    if (filters.status) {
      events = events.filter(e => e.status === filters.status);
    }

    return createResponse(events);
  },

  async getEventById(id) {
    await delay(DELAY);
    const event = mockData.mockEvents.find(e => e.id === id);
    if (!event) return createError('Event not found');
    return createResponse(event);
  },

  async createEvent(eventData) {
    await delay(DELAY);
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      ...eventData,
      organizer: mockData.currentUser,
      participantCount: 0,
      teamCount: 0,
      submissionCount: 0,
    };
    mockData.mockEvents.push(event);
    return createResponse(event);
  },

  async updateEvent(id, updates) {
    await delay(DELAY);
    const event = mockData.mockEvents.find(e => e.id === id);
    if (!event) return createError('Event not found');
    Object.assign(event, updates);
    return createResponse(event);
  },
};

// Teams
export const teamsApi = {
  async getTeams(eventId, filters = {}) {
    await delay(DELAY);
    let teams = mockData.mockTeams.filter(t => t.eventId === eventId);
    return createResponse(teams);
  },

  async getTeamById(id) {
    await delay(DELAY);
    const team = mockData.mockTeams.find(t => t.id === id);
    if (!team) return createError('Team not found');
    return createResponse(team);
  },

  async createTeam(eventId, teamData) {
    await delay(DELAY);
    const team = {
      id: 'team' + Math.random().toString(36).substr(2, 9),
      eventId,
      ...teamData,
      members: [mockData.currentUser],
      createdAt: new Date(),
    };
    mockData.mockTeams.push(team);
    return createResponse(team);
  },

  async joinTeam(teamId) {
    await delay(DELAY);
    const team = mockData.mockTeams.find(t => t.id === teamId);
    if (!team) return createError('Team not found');
    if (team.members.length >= 4) return createError('Team is full');
    team.members.push(mockData.currentUser);
    return createResponse(team);
  },

  async leaveTeam(teamId) {
    await delay(DELAY);
    const team = mockData.mockTeams.find(t => t.id === teamId);
    if (!team) return createError('Team not found');
    team.members = team.members.filter(m => m.id !== mockData.currentUser.id);
    return createResponse(team);
  },
};

// Submissions
export const submissionsApi = {
  async getSubmissions(eventId, filters = {}) {
    await delay(DELAY);
    let submissions = mockData.mockSubmissions.filter(s => s.eventId === eventId);

    if (filters.status) {
      submissions = submissions.filter(s => s.status === filters.status);
    }
    if (filters.track) {
      submissions = submissions.filter(s => s.track === filters.track);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      submissions = submissions.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    return createResponse(submissions);
  },

  async getSubmissionById(id) {
    await delay(DELAY);
    const submission = mockData.mockSubmissions.find(s => s.id === id);
    if (!submission) return createError('Submission not found');
    return createResponse(submission);
  },

  async createSubmission(eventId, teamId, submissionData) {
    await delay(DELAY);
    const submission = {
      id: 'sub' + Math.random().toString(36).substr(2, 9),
      eventId,
      teamId,
      ...submissionData,
      status: 'draft',
      submittedAt: null,
      scores: [],
      votes: 0,
      votesByUser: {},
    };
    mockData.mockSubmissions.push(submission);
    return createResponse(submission);
  },

  async updateSubmission(id, updates) {
    await delay(DELAY);
    const submission = mockData.mockSubmissions.find(s => s.id === id);
    if (!submission) return createError('Submission not found');
    Object.assign(submission, updates);
    return createResponse(submission);
  },

  async submitSubmission(id) {
    await delay(DELAY);
    const submission = mockData.mockSubmissions.find(s => s.id === id);
    if (!submission) return createError('Submission not found');
    submission.status = 'submitted';
    submission.submittedAt = new Date();
    return createResponse(submission);
  },
};

// Judging
export const judgingApi = {
  async getAssignments(eventId) {
    await delay(DELAY);
    const assignments = mockData.mockJudgeAssignments.filter(a => a.eventId === eventId);
    return createResponse(assignments);
  },

  async getAssignmentForJudge(eventId, judgeId) {
    await delay(DELAY);
    const assignment = mockData.mockJudgeAssignments.find(
      a => a.eventId === eventId && a.judgeId === judgeId
    );
    if (!assignment) return createError('Assignment not found');
    return createResponse(assignment);
  },

  async scoreSubmission(submissionId, scores, feedback) {
    await delay(DELAY);
    const submission = mockData.mockSubmissions.find(s => s.id === submissionId);
    if (!submission) return createError('Submission not found');

    submission.scores.push({
      judgeId: mockData.currentUser.id,
      criteria: scores,
      feedback,
    });

    return createResponse(submission);
  },

  async getRubric(eventId) {
    await delay(DELAY);
    return createResponse(mockData.mockRubric);
  },
};

// Voting & Gallery
export const galleryApi = {
  async voteSubmission(submissionId, userId) {
    await delay(DELAY);
    const submission = mockData.mockSubmissions.find(s => s.id === submissionId);
    if (!submission) return createError('Submission not found');

    if (!submission.votesByUser[userId]) {
      submission.votesByUser[userId] = true;
      submission.votes += 1;
    }

    return createResponse(submission);
  },

  async unvoteSubmission(submissionId, userId) {
    await delay(DELAY);
    const submission = mockData.mockSubmissions.find(s => s.id === submissionId);
    if (!submission) return createError('Submission not found');

    if (submission.votesByUser[userId]) {
      delete submission.votesByUser[userId];
      submission.votes -= 1;
    }

    return createResponse(submission);
  },

  async addComment(submissionId, text) {
    await delay(DELAY);
    const comment = {
      id: 'comment' + Math.random().toString(36).substr(2, 9),
      submissionId,
      userId: mockData.currentUser.id,
      user: mockData.currentUser,
      text,
      createdAt: new Date(),
      votes: 0,
      replies: [],
    };
    mockData.mockComments.push(comment);
    return createResponse(comment);
  },

  async getComments(submissionId) {
    await delay(DELAY);
    const comments = mockData.mockComments.filter(c => c.submissionId === submissionId);
    return createResponse(comments);
  },
};

// Audit Logs
export const auditApi = {
  async getLogs(eventId, filters = {}) {
    await delay(DELAY);
    let logs = mockData.mockAuditLog.filter(l => l.eventId === eventId);

    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }
    if (filters.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }

    return createResponse(logs.sort((a, b) => b.timestamp - a.timestamp));
  },
};

// Invitations
export const invitationsApi = {
  async getInvitationByToken(token) {
    await delay(DELAY);
    const invitation = mockData.mockInvitations.find(i => i.token === token);
    if (!invitation) return createError('Invitation not found');
    if (new Date() > invitation.expiresAt) {
      return createError('Invitation expired');
    }
    return createResponse(invitation);
  },

  async acceptInvitation(token) {
    await delay(DELAY);
    const invitation = mockData.mockInvitations.find(i => i.token === token);
    if (!invitation) return createError('Invitation not found');
    if (new Date() > invitation.expiresAt) {
      return createError('Invitation expired');
    }
    invitation.status = 'accepted';
    return createResponse(invitation);
  },

  async declineInvitation(token) {
    await delay(DELAY);
    const invitation = mockData.mockInvitations.find(i => i.token === token);
    if (!invitation) return createError('Invitation not found');
    invitation.status = 'declined';
    return createResponse(invitation);
  },
};

// Participant
export const participantApi = {
  async getDashboard(userId, eventId) {
    await delay(DELAY);
    const participation = mockData.mockParticipations.find(
      p => p.userId === userId && p.eventId === eventId
    );
    const team = participation ? mockData.mockTeams.find(t => t.id === participation.teamId) : null;
    const submission = team ? mockData.mockSubmissions.find(s => s.teamId === team.id) : null;
    const event = mockData.mockEvents.find(e => e.id === eventId);
    const activities = mockData.mockActivityLog
      .filter(a => a.eventId === eventId && a.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return createResponse({
      participation,
      team,
      submission,
      event,
      activities,
    });
  },

  async getProfile(userId) {
    await delay(DELAY);
    const user = mockData.mockUsers[Object.keys(mockData.mockUsers).find(
      key => mockData.mockUsers[key].id === userId
    )] || mockData.currentUser;
    if (!user) return createError('User not found');
    return createResponse(user);
  },

  async updateProfile(userId, updates) {
    await delay(DELAY);
    const userKey = Object.keys(mockData.mockUsers).find(
      key => mockData.mockUsers[key].id === userId
    );
    if (!userKey) return createError('User not found');
    const user = mockData.mockUsers[userKey];
    Object.assign(user, updates);
    return createResponse(user);
  },

  async getTeam(userId, eventId) {
    await delay(DELAY);
    const participation = mockData.mockParticipations.find(
      p => p.userId === userId && p.eventId === eventId
    );
    if (!participation) return createError('Not registered for this event');
    if (!participation.teamId) return createResponse(null);

    const team = mockData.mockTeams.find(t => t.id === participation.teamId);
    if (!team) return createError('Team not found');
    return createResponse(team);
  },

  async leaveTeam(userId, teamId) {
    await delay(DELAY);
    const team = mockData.mockTeams.find(t => t.id === teamId);
    if (!team) return createError('Team not found');
    team.members = team.members.filter(m => m.id !== userId);
    return createResponse(team);
  },

  async createTeamInvitation(teamId, invitedEmail) {
    await delay(DELAY);
    const team = mockData.mockTeams.find(t => t.id === teamId);
    if (!team) return createError('Team not found');

    const invitation = {
      id: 'tinv' + Math.random().toString(36).substr(2, 9),
      teamId,
      invitedByUserId: mockData.currentUser.id,
      invitedByUser: mockData.currentUser,
      invitedEmail,
      token: 'team_inv_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    };

    mockData.mockTeamInvitations.push(invitation);
    return createResponse(invitation);
  },

  async getTeamInvitations(teamId) {
    await delay(DELAY);
    const invitations = mockData.mockTeamInvitations.filter(i => i.teamId === teamId);
    return createResponse(invitations);
  },

  async acceptTeamInvitation(token) {
    await delay(DELAY);
    const invitation = mockData.mockTeamInvitations.find(i => i.token === token);
    if (!invitation) return createError('Invitation not found');
    if (new Date() > invitation.expiresAt) return createError('Invitation expired');
    invitation.status = 'accepted';
    return createResponse(invitation);
  },
};

// Submission Editor
export const submissionEditorApi = {
  async getDraft(teamId, eventId) {
    await delay(DELAY);
    const draft = mockData.mockSubmissionDrafts.find(
      d => d.teamId === teamId && d.eventId === eventId
    );
    if (!draft) {
      return createResponse({
        id: 'draft_' + teamId,
        eventId,
        teamId,
        title: '',
        tagline: '',
        description: '',
        thumbnail: '',
        gallery: [],
        videoUrl: '',
        repoUrl: '',
        liveUrl: '',
        technologies: [],
        track: '',
        customAnswers: {},
        status: 'draft',
        lastSavedAt: new Date(),
      });
    }
    return createResponse(draft);
  },

  async saveDraft(teamId, eventId, data) {
    await delay(DELAY);
    let draft = mockData.mockSubmissionDrafts.find(
      d => d.teamId === teamId && d.eventId === eventId
    );
    if (!draft) {
      draft = {
        id: 'draft_' + teamId,
        eventId,
        teamId,
        status: 'draft',
      };
      mockData.mockSubmissionDrafts.push(draft);
    }
    Object.assign(draft, data, { lastSavedAt: new Date() });
    return createResponse(draft);
  },

  async submitDraft(teamId, eventId) {
    await delay(DELAY);
    let draft = mockData.mockSubmissionDrafts.find(
      d => d.teamId === teamId && d.eventId === eventId
    );
    if (!draft) return createError('Draft not found');

    // Mark as submitted
    draft.status = 'submitted';
    draft.submittedAt = new Date();
    return createResponse(draft);
  },

  async getCustomQuestions(eventId) {
    await delay(DELAY);
    const questions = mockData.mockCustomQuestions.filter(q => q.eventId === eventId);
    return createResponse(questions);
  },

  async validateDraft(data) {
    await delay(DELAY);
    const errors = {};
    if (!data.title) errors.title = 'Project name is required';
    if (!data.tagline) errors.tagline = 'Tagline is required';
    if (!data.description) errors.description = 'Description is required';
    if (!data.track) errors.track = 'Track is required';
    if (data.technologies.length === 0) errors.technologies = 'At least one technology is required';

    if (Object.keys(errors).length > 0) {
      return createError(JSON.stringify(errors));
    }
    return createResponse({ valid: true });
  },
};

// Judge
export const judgeApi = {
  async getDashboard(judgeId, eventId) {
    await delay(DELAY);
    const assignments = mockData.mockJudgeAssignments.filter(
      a => a.judgeId === judgeId && a.eventId === eventId
    );
    const completedCount = assignments.filter(a => a.status === 'completed').length;
    const pendingCount = assignments.filter(a => a.status === 'pending').length;

    return createResponse({
      judgeId,
      eventId,
      assignedCount: assignments.length,
      completedCount,
      pendingCount,
      completionPercent: assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0,
      recentAssignments: assignments.slice(0, 3),
      event: mockData.mockEvents.find(e => e.id === eventId),
    });
  },

  async getAssignments(judgeId, eventId) {
    await delay(DELAY);
    const assignments = mockData.mockJudgeAssignments.filter(
      a => a.judgeId === judgeId && a.eventId === eventId
    );
    return createResponse(assignments);
  },

  async getAssignment(assignmentId) {
    await delay(DELAY);
    const assignment = mockData.mockJudgeAssignments.find(a => a.id === assignmentId);
    if (!assignment) return createError('Assignment not found');
    return createResponse(assignment);
  },

  async getEvaluation(submissionId, judgeId) {
    await delay(DELAY);
    const evaluation = mockData.mockJudgeEvaluations.find(
      e => e.submissionId === submissionId && e.judgeId === judgeId
    );
    return createResponse(evaluation || null);
  },

  async saveEvaluationDraft(submissionId, judgeId, eventId, data) {
    await delay(DELAY);
    let evaluation = mockData.mockJudgeEvaluations.find(
      e => e.submissionId === submissionId && e.judgeId === judgeId
    );
    if (!evaluation) {
      evaluation = {
        id: 'eval_' + submissionId,
        eventId,
        judgeId,
        submissionId,
        status: 'draft',
      };
      mockData.mockJudgeEvaluations.push(evaluation);
    }
    Object.assign(evaluation, data);
    return createResponse(evaluation);
  },

  async submitEvaluation(submissionId, judgeId, eventId, data) {
    await delay(DELAY);
    let evaluation = mockData.mockJudgeEvaluations.find(
      e => e.submissionId === submissionId && e.judgeId === judgeId
    );
    if (!evaluation) {
      evaluation = {
        id: 'eval_' + submissionId,
        eventId,
        judgeId,
        submissionId,
      };
      mockData.mockJudgeEvaluations.push(evaluation);
    }

    // Calculate total score
    const scores = data.scores || {};
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = Object.keys(scores).length * 10;

    Object.assign(evaluation, data, {
      totalScore,
      maxScore,
      submittedAt: new Date(),
      status: 'submitted',
    });

    // Update assignment status
    const assignment = mockData.mockJudgeAssignments.find(a => a.submissionId === submissionId);
    if (assignment) {
      assignment.status = 'completed';
    }

    return createResponse(evaluation);
  },

  async getRubric(eventId) {
    await delay(DELAY);
    const criteria = mockData.mockRubricCriteria.filter(c => c.eventId === eventId);
    return createResponse(criteria);
  },

  async getProgress(judgeId, eventId) {
    await delay(DELAY);
    const assignments = mockData.mockJudgeAssignments.filter(
      a => a.judgeId === judgeId && a.eventId === eventId
    );
    const completedCount = assignments.filter(a => a.status === 'completed').length;
    const pendingCount = assignments.filter(a => a.status === 'pending').length;

    return createResponse({
      assignedCount: assignments.length,
      completedCount,
      pendingCount,
      completionPercent: assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0,
      assignments,
    });
  },
};

// Organizer API
export const organizerApi = {
  async getDashboard(eventId) {
    await delay(DELAY);
    const event = mockData.mockEvents.find(e => e.id === eventId);
    const assignments = mockData.mockJudgeAssignments.filter(a => a.eventId === eventId);
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const incompleteAssignments = assignments.filter(a => a.status === 'pending').length;

    return createResponse({
      event,
      participantCount: event?.participantCount || 0,
      teamCount: event?.teamCount || 0,
      submissionCount: event?.submissionCount || 0,
      judgeCount: mockData.mockJudgeInvitations.filter(j => j.eventId === eventId).length,
      completedJudging: completedAssignments,
      incompleteJudging: incompleteAssignments,
      votingStatus: mockData.mockVotingConfig.state,
      recentActivity: mockData.mockActivityLog.slice(0, 5),
      upcomingDeadlines: [
        { type: 'submission', deadline: event?.submissionDeadline },
        { type: 'judging', deadline: event?.judgingDeadline },
      ],
    });
  },

  async getEvents() {
    await delay(DELAY);
    return createResponse(mockData.mockEvents);
  },

  async createEvent(eventData) {
    await delay(DELAY);
    const event = {
      id: 'evt' + Math.random().toString(36).substr(2, 9),
      ...eventData,
      organizer: mockData.currentUser,
      participantCount: 0,
      teamCount: 0,
      submissionCount: 0,
      createdAt: new Date(),
    };
    mockData.mockEvents.push(event);
    return createResponse(event);
  },

  async updateEventSettings(eventId, settings) {
    await delay(DELAY);
    const event = mockData.mockEvents.find(e => e.id === eventId);
    if (!event) return createError('Event not found');
    Object.assign(event, settings);
    return createResponse(event);
  },

  async getParticipants(eventId, filters = {}) {
    await delay(DELAY);
    return createResponse(
      mockData.mockUsers.participant1 && mockData.mockUsers.participant2
        ? [mockData.mockUsers.participant1, mockData.mockUsers.participant2]
        : []
    );
  },

  async getTeams(eventId) {
    await delay(DELAY);
    return createResponse(mockData.mockTeams);
  },

  async getSubmissions(eventId) {
    await delay(DELAY);
    return createResponse(mockData.mockSubmissions);
  },

  async getJudges(eventId) {
    await delay(DELAY);
    return createResponse(
      mockData.mockJudgeInvitations.filter(j => j.eventId === eventId)
    );
  },

  async inviteJudge(eventId, email) {
    await delay(DELAY);
    const judge = {
      id: 'jinv' + Math.random().toString(36).substr(2, 9),
      eventId,
      email,
      status: 'pending',
      invitedAt: new Date(),
    };
    mockData.mockJudgeInvitations.push(judge);
    return createResponse(judge);
  },

  async getAssignments(eventId) {
    await delay(DELAY);
    return createResponse(mockData.mockJudgeAssignments.filter(a => a.eventId === eventId));
  },

  async createAssignments(eventId, assignments) {
    await delay(DELAY);
    const created = assignments.map(a => ({
      id: 'assign' + Math.random().toString(36).substr(2, 9),
      eventId,
      ...a,
      assignedAt: new Date(),
      status: 'pending',
    }));
    mockData.mockJudgeAssignments.push(...created);
    return createResponse(created);
  },

  async getRubric(eventId) {
    await delay(DELAY);
    return createResponse(mockData.mockRubricCriteria.filter(c => c.eventId === eventId));
  },

  async updateRubric(eventId, criteria) {
    await delay(DELAY);
    const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (totalWeight !== 100) {
      return createError('Total weight must equal 100%');
    }
    mockData.mockRubricCriteria.splice(0);
    mockData.mockRubricCriteria.push(...criteria);
    return createResponse(criteria);
  },

  async getNormalizedScores(eventId) {
    await delay(DELAY);
    return createResponse(mockData.mockNormalizedScores);
  },

  async getVotingConfig(eventId) {
    await delay(DELAY);
    return createResponse(mockData.mockVotingConfig);
  },

  async updateVotingConfig(eventId, config) {
    await delay(DELAY);
    Object.assign(mockData.mockVotingConfig, config);
    return createResponse(mockData.mockVotingConfig);
  },

  async getAuditLog(eventId, filters = {}) {
    await delay(DELAY);
    let logs = mockData.mockAuditLog.filter(l => l.eventId === eventId || !eventId);
    if (filters.action) logs = logs.filter(l => l.action === filters.action);
    if (filters.actor) logs = logs.filter(l => l.actor.id === filters.actor);
    return createResponse(logs.sort((a, b) => b.timestamp - a.timestamp));
  },

  async exportParticipants(eventId) {
    await delay(DELAY);
    return createResponse({ filename: 'participants.csv', status: 'ready' });
  },

  async exportSubmissions(eventId) {
    await delay(DELAY);
    return createResponse({ filename: 'submissions.csv', status: 'ready' });
  },

  async exportScores(eventId) {
    await delay(DELAY);
    return createResponse({ filename: 'scores.csv', status: 'ready' });
  },

  async exportResults(eventId) {
    await delay(DELAY);
    return createResponse({ filename: 'results.csv', status: 'ready' });
  },
};

// Admin API
export const adminApi = {
  async getDashboard() {
    await delay(DELAY);
    return createResponse({
      totalUsers: Object.keys(mockData.mockUsers).length,
      totalEvents: mockData.mockEvents.length,
      activeEvents: mockData.mockEvents.filter(e => e.status === 'accepting' || e.status === 'in_progress').length,
      totalSubmissions: mockData.mockSubmissions.length,
    });
  },

  async getUsers(filters = {}) {
    await delay(DELAY);
    let users = Object.values(mockData.mockUsers);
    if (filters.role) users = users.filter(u => u.role === filters.role);
    return createResponse(users);
  },

  async getEvents() {
    await delay(DELAY);
    return createResponse(mockData.mockEvents);
  },

  async getAuditLog(filters = {}) {
    await delay(DELAY);
    let logs = mockData.mockAuditLog;
    if (filters.action) logs = logs.filter(l => l.action === filters.action);
    if (filters.actor) logs = logs.filter(l => l.actor.id === filters.actor);
    return createResponse(logs.sort((a, b) => b.timestamp - a.timestamp));
  },

  async updateUserRole(userId, role) {
    await delay(DELAY);
    const user = Object.values(mockData.mockUsers).find(u => u.id === userId);
    if (!user) return createError('User not found');
    user.role = role;
    return createResponse(user);
  },
};

// Export all APIs
export default {
  auth: authApi,
  events: eventsApi,
  teams: teamsApi,
  submissions: submissionsApi,
  judging: judgingApi,
  gallery: galleryApi,
  audit: auditApi,
  invitations: invitationsApi,
  participant: participantApi,
  submissionEditor: submissionEditorApi,
  judge: judgeApi,
  organizer: organizerApi,
  admin: adminApi,
};
