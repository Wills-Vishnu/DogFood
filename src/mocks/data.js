// Mock data for development and testing

export const ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  JUDGE: 'judge',
  PARTICIPANT: 'participant',
  PUBLIC: 'public',
};

export const mockUsers = {
  admin: {
    id: '1',
    email: 'admin@dogfood.local',
    name: 'Alex Admin',
    role: ROLES.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  organizer: {
    id: '2',
    email: 'organizer@dogfood.local',
    name: 'Jordan Organizer',
    role: ROLES.ORGANIZER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  },
  judge1: {
    id: '3',
    email: 'judge1@dogfood.local',
    name: 'Casey Judge',
    role: ROLES.JUDGE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
    expertise: ['Full Stack', 'UI/UX'],
  },
  judge2: {
    id: '4',
    email: 'judge2@dogfood.local',
    name: 'Morgan Judge',
    role: ROLES.JUDGE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan',
    expertise: ['DevOps', 'Security'],
  },
  participant1: {
    id: '5',
    email: 'participant1@dogfood.local',
    name: 'Riley Participant',
    role: ROLES.PARTICIPANT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley',
  },
  participant2: {
    id: '6',
    email: 'participant2@dogfood.local',
    name: 'Avery Developer',
    role: ROLES.PARTICIPANT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery',
  },
};

export const mockEvents = [
  {
    id: '1',
    name: 'TechHacks 2026',
    slug: 'techhacks-2026',
    description: 'The premier hackathon for innovative technology solutions',
    fullDescription: 'TechHacks 2026 is a 48-hour hackathon bringing together builders, designers, and innovators to create cutting-edge solutions across AI, Web3, and HealthTech. Join us in San Francisco for an unforgettable weekend of hacking, learning, and collaboration.',
    rules: 'Teams of up to 4 people. All code must be original and written during the hackathon. Start: Saturday 9am, End: Monday 9am. Judging: Monday afternoon.',
    startDate: new Date('2026-09-20'),
    endDate: new Date('2026-09-22'),
    registrationDeadline: new Date('2026-09-15'),
    submissionDeadline: new Date('2026-09-21'),
    judgingDeadline: new Date('2026-09-23'),
    status: 'accepting',
    maxTeamSize: 4,
    location: 'San Francisco, CA',
    website: 'https://techhacks.local',
    tracks: [
      { id: 't1', name: 'AI & Machine Learning', color: '#3b82f6' },
      { id: 't2', name: 'Web3 & Blockchain', color: '#8b5cf6' },
      { id: 't3', name: 'HealthTech', color: '#ec4899' },
    ],
    prizes: [
      { id: 'p1', name: 'Grand Prize', amount: 5000 },
      { id: 'p2', name: 'Runner-up', amount: 2000 },
      { id: 'p3', name: 'Best Design', amount: 1000 },
    ],
    organizer: mockUsers.organizer,
    participantCount: 150,
    teamCount: 42,
    submissionCount: 40,
  },
  {
    id: '2',
    name: 'StartupSprint 2026',
    slug: 'startupsprint-2026',
    description: 'Build your startup idea from zero to validation',
    startDate: new Date('2026-10-10'),
    endDate: new Date('2026-10-12'),
    registrationDeadline: new Date('2026-10-05'),
    submissionDeadline: new Date('2026-10-11'),
    judgingDeadline: new Date('2026-10-14'),
    status: 'upcoming',
    maxTeamSize: 5,
    location: 'New York, NY',
    website: 'https://startupsprint.local',
    tracks: [
      { id: 't1', name: 'B2B SaaS', color: '#06b6d4' },
      { id: 't2', name: 'Consumer', color: '#10b981' },
      { id: 't3', name: 'Hardware', color: '#f59e0b' },
    ],
    prizes: [
      { id: 'p1', name: 'Seed Investment', amount: 50000 },
      { id: 'p2', name: 'Acceleration Program', amount: 0 },
    ],
    organizer: mockUsers.organizer,
    participantCount: 0,
    teamCount: 0,
    submissionCount: 0,
  },
];

export const mockTeams = [
  {
    id: 'team1',
    eventId: '1',
    name: 'Neural Flux',
    description: 'Building intelligent systems that learn from user behavior',
    members: [
      { ...mockUsers.participant1, role: 'lead' },
      { ...mockUsers.participant2, role: 'member' },
    ],
    track: 'AI & Machine Learning',
    createdAt: new Date('2026-09-05'),
  },
  {
    id: 'team2',
    eventId: '1',
    name: 'ChainForge',
    description: 'Decentralized infrastructure for the next generation of apps',
    members: [
      { ...mockUsers.participant2, role: 'lead' },
    ],
    track: 'Web3 & Blockchain',
    createdAt: new Date('2026-09-06'),
  },
];

export const mockSubmissions = [
  {
    id: 'sub1',
    eventId: '1',
    teamId: 'team1',
    title: 'MindFlow: AI-Powered Learning Assistant',
    description: 'An AI system that adapts to your learning style and pace',
    status: 'submitted',
    track: 'AI & Machine Learning',
    technologies: ['Python', 'TensorFlow', 'React', 'Node.js'],
    liveUrl: 'https://mindflow.local',
    repoUrl: 'https://github.com/example/mindflow',
    videoUrl: 'https://youtu.be/example',
    team: mockTeams[0],
    submittedAt: new Date('2026-09-20T14:30:00'),
    scores: [
      {
        judgeId: '3',
        criteria: {
          innovation: 9,
          implementation: 8,
          design: 8,
          impact: 9,
        },
        feedback: 'Excellent use of ML, great UX considerations.',
      },
    ],
    votes: 145,
    votesByUser: {},
  },
  {
    id: 'sub2',
    eventId: '1',
    teamId: 'team2',
    title: 'LedgerLink: Interoperable Chain Bridge',
    description: 'A protocol for seamless asset transfer across blockchain networks',
    status: 'submitted',
    track: 'Web3 & Blockchain',
    technologies: ['Solidity', 'Rust', 'TypeScript', 'Next.js'],
    liveUrl: 'https://ledgerlink.local',
    repoUrl: 'https://github.com/example/ledgerlink',
    videoUrl: 'https://youtu.be/example2',
    team: mockTeams[1],
    submittedAt: new Date('2026-09-21T10:15:00'),
    scores: [],
    votes: 89,
    votesByUser: {},
  },
];

export const mockRubric = {
  id: 'rubric1',
  eventId: '1',
  name: 'Standard Evaluation Rubric',
  criteria: [
    {
      id: 'c1',
      name: 'Innovation',
      description: 'How novel and creative is the solution?',
      weight: 25,
      maxScore: 10,
    },
    {
      id: 'c2',
      name: 'Implementation',
      description: 'How well is the idea executed?',
      weight: 25,
      maxScore: 10,
    },
    {
      id: 'c3',
      name: 'Design & UX',
      description: 'How intuitive and polished is the interface?',
      weight: 20,
      maxScore: 10,
    },
    {
      id: 'c4',
      name: 'Impact & Viability',
      description: 'Does it solve a real problem?',
      weight: 30,
      maxScore: 10,
    },
  ],
};

export const mockComments = [
  {
    id: 'comment1',
    submissionId: 'sub1',
    userId: '5',
    user: mockUsers.participant1,
    text: 'This is such a cool project! Love the adaptive learning aspect.',
    createdAt: new Date('2026-09-20T16:00:00'),
    votes: 5,
    replies: [],
  },
  {
    id: 'comment2',
    submissionId: 'sub1',
    userId: '6',
    user: mockUsers.participant2,
    text: 'Great idea. How are you handling privacy for user learning data?',
    createdAt: new Date('2026-09-20T17:30:00'),
    votes: 3,
    replies: [
      {
        id: 'reply1',
        userId: '5',
        user: mockUsers.participant1,
        text: 'Good question! We use end-to-end encryption and differential privacy techniques.',
        createdAt: new Date('2026-09-20T18:00:00'),
        votes: 2,
      },
    ],
  },
];

export const mockInvitations = [
  {
    token: 'invite_token_123',
    teamId: 'team1',
    team: mockTeams[0],
    eventId: '1',
    event: mockEvents[0],
    invitedBy: mockUsers.participant1,
    invitedEmail: 'newmember@example.com',
    status: 'pending',
    createdAt: new Date('2026-09-18'),
    expiresAt: new Date('2026-09-25'),
  },
  {
    token: 'invite_token_456',
    teamId: 'team2',
    team: mockTeams[1],
    eventId: '1',
    event: mockEvents[0],
    invitedBy: mockUsers.participant2,
    invitedEmail: 'teamjoin@example.com',
    status: 'pending',
    createdAt: new Date('2026-09-19'),
    expiresAt: new Date('2026-09-26'),
  },
];

export const mockParticipations = [
  {
    id: 'part1',
    eventId: '1',
    userId: '5',
    user: mockUsers.participant1,
    teamId: 'team1',
    status: 'active',
    registeredAt: new Date('2026-09-05T10:00:00'),
  },
  {
    id: 'part2',
    eventId: '1',
    userId: '6',
    user: mockUsers.participant2,
    teamId: 'team2',
    status: 'active',
    registeredAt: new Date('2026-09-06T11:00:00'),
  },
];

export const mockTeamInvitations = [
  {
    id: 'tinv1',
    teamId: 'team1',
    invitedByUserId: '5',
    invitedByUser: mockUsers.participant1,
    invitedEmail: 'newmember@example.com',
    token: 'team_inv_token_123',
    status: 'pending',
    createdAt: new Date('2026-09-18T14:30:00'),
    expiresAt: new Date('2026-09-28T14:30:00'),
  },
];

export const mockCustomQuestions = [
  {
    id: 'q1',
    eventId: '1',
    question: 'What problem does your project solve?',
    type: 'text',
    required: true,
  },
  {
    id: 'q2',
    eventId: '1',
    question: 'Who is your target audience?',
    type: 'text',
    required: true,
  },
  {
    id: 'q3',
    eventId: '1',
    question: 'What makes your solution unique?',
    type: 'text',
    required: false,
  },
];

export const mockSubmissionDrafts = [
  {
    id: 'draft_sub1',
    eventId: '1',
    teamId: 'team1',
    title: 'MindFlow: AI-Powered Learning Assistant',
    tagline: 'Adaptive learning platform using machine learning',
    description: 'An AI system that adapts to your learning style and pace',
    thumbnail: 'https://via.placeholder.com/600x400?text=MindFlow',
    gallery: [
      'https://via.placeholder.com/800x600?text=Screenshot+1',
      'https://via.placeholder.com/800x600?text=Screenshot+2',
    ],
    videoUrl: 'https://youtu.be/example',
    repoUrl: 'https://github.com/example/mindflow',
    liveUrl: 'https://mindflow.local',
    technologies: ['Python', 'TensorFlow', 'React', 'Node.js'],
    track: 'AI & Machine Learning',
    customAnswers: {
      q1: 'Students struggle with one-size-fits-all learning paths. MindFlow adapts content to individual learning styles.',
      q2: 'Students and educators looking for personalized learning experiences.',
      q3: 'Real-time adaptation using ML and privacy-first data handling.',
    },
    status: 'submitted',
    lastSavedAt: new Date('2026-09-20T14:30:00'),
    submittedAt: new Date('2026-09-20T14:30:00'),
  },
];

export const mockJudgeAssignments = [
  {
    id: 'assign1',
    eventId: '1',
    judgeId: '3',
    submissionId: 'sub1',
    submission: mockSubmissions[0],
    status: 'completed',
    assignedAt: new Date('2026-09-19T10:00:00'),
  },
  {
    id: 'assign2',
    eventId: '1',
    judgeId: '3',
    submissionId: 'sub2',
    submission: mockSubmissions[1],
    status: 'pending',
    assignedAt: new Date('2026-09-20T11:00:00'),
  },
];

export const mockJudgeEvaluations = [
  {
    id: 'eval1',
    eventId: '1',
    judgeId: '3',
    submissionId: 'sub1',
    scores: {
      innovation: 9,
      implementation: 8,
      design: 8,
      impact: 9,
    },
    feedback: 'Excellent use of ML, great UX considerations. The adaptive learning approach is innovative and well-executed.',
    totalScore: 34,
    maxScore: 40,
    submittedAt: new Date('2026-09-20T16:00:00'),
  },
];

export const mockRubricCriteria = [
  {
    id: 'crit1',
    eventId: '1',
    name: 'Innovation',
    description: 'How novel and creative is the solution?',
    weight: 25,
    maxScore: 10,
  },
  {
    id: 'crit2',
    eventId: '1',
    name: 'Implementation',
    description: 'How well is the idea executed?',
    weight: 25,
    maxScore: 10,
  },
  {
    id: 'crit3',
    eventId: '1',
    name: 'Design',
    description: 'How intuitive and polished is the interface?',
    weight: 20,
    maxScore: 10,
  },
  {
    id: 'crit4',
    eventId: '1',
    name: 'Impact',
    description: 'Does it solve a real problem?',
    weight: 30,
    maxScore: 10,
  },
];

export const mockAuditLog = [
  {
    id: 'log1',
    timestamp: new Date('2026-09-20T14:30:00'),
    actor: mockUsers.organizer,
    action: 'event_created',
    target: 'Event: TechHacks 2026',
    details: 'Event created with 3 tracks and 3 prizes',
    status: 'success',
  },
  {
    id: 'log2',
    timestamp: new Date('2026-09-20T15:45:00'),
    actor: mockUsers.organizer,
    action: 'judge_invited',
    target: 'Judge: Casey Judge',
    details: 'Invitation sent to judge1@dogfood.local',
    status: 'success',
  },
  {
    id: 'log3',
    timestamp: new Date('2026-09-20T16:20:00'),
    actor: mockUsers.organizer,
    action: 'rubric_updated',
    target: 'Rubric: TechHacks 2026',
    details: '4 criteria configured, total weight 100%',
    status: 'success',
  },
  {
    id: 'log4',
    timestamp: new Date('2026-09-21T09:00:00'),
    actor: mockUsers.organizer,
    action: 'assignments_created',
    target: 'Assignments: TechHacks 2026',
    details: '2 judges assigned to 2 submissions each',
    status: 'success',
  },
];

export const mockActivityLog = [
  {
    id: 'act1',
    timestamp: new Date('2026-09-21T14:30:00'),
    type: 'submission',
    message: 'Team Neural Flux submitted project',
    status: 'completed',
  },
  {
    id: 'act2',
    timestamp: new Date('2026-09-21T15:45:00'),
    type: 'judging',
    message: 'Casey Judge completed evaluation of MindFlow',
    status: 'completed',
  },
  {
    id: 'act3',
    timestamp: new Date('2026-09-21T16:20:00'),
    type: 'submission',
    message: 'Team ChainForge submitted project',
    status: 'completed',
  },
  {
    id: 'act4',
    timestamp: new Date('2026-09-21T17:00:00'),
    type: 'judging',
    message: 'Morgan Judge started evaluation of LedgerLink',
    status: 'in_progress',
  },
];

export const mockJudgeInvitations = [
  {
    id: 'jinv1',
    eventId: '1',
    judgeId: '3',
    email: 'judge1@dogfood.local',
    name: 'Casey Judge',
    status: 'accepted',
    invitedAt: new Date('2026-09-15'),
    respondedAt: new Date('2026-09-16'),
  },
  {
    id: 'jinv2',
    eventId: '1',
    judgeId: '4',
    email: 'judge2@dogfood.local',
    name: 'Morgan Judge',
    status: 'accepted',
    invitedAt: new Date('2026-09-15'),
    respondedAt: new Date('2026-09-16'),
  },
];

export const mockNormalizedScores = [
  {
    submissionId: 'sub1',
    submission: mockSubmissions[0],
    rawScores: [34],
    avgRawScore: 34,
    normalizedScore: 85.5,
    rank: 1,
  },
  {
    submissionId: 'sub2',
    submission: mockSubmissions[1],
    rawScores: [30],
    avgRawScore: 30,
    normalizedScore: 75.0,
    rank: 2,
  },
];

export const mockVotingConfig = {
  eventId: '1',
  state: 'not_started',
  startDate: new Date('2026-09-24'),
  endDate: new Date('2026-09-30'),
  accessType: 'open_link',
  hideResultsDuringVoting: true,
  randomizeProjectOrder: true,
  voterAntiAbuse: {
    enabled: true,
    rateLimitPerHour: 10,
  },
};

// Session management
export let currentUser = null;
export let currentEvent = mockEvents[0];

export function setCurrentUser(user) {
  currentUser = user;
}

export function setCurrentEvent(event) {
  currentEvent = event;
}
