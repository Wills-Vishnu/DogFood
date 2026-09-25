import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './auth/AuthContext';

import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailsPage } from './pages/public/EventDetailsPage';
import { ProjectsGalleryPage } from './pages/public/ProjectsGalleryPage';
import { ProjectDetailsPage } from './pages/public/ProjectDetailsPage';
import { InvitationPage } from './pages/public/InvitationPage';
import { ParticipantDashboardPage } from './pages/participant/ParticipantDashboardPage';
import { ParticipantProfilePage } from './pages/participant/ParticipantProfilePage';
import { TeamManagementPage } from './pages/participant/TeamManagementPage';
import { TeamInvitationPage } from './pages/participant/TeamInvitationPage';
import { SubmissionDashboardPage } from './pages/participant/SubmissionDashboardPage';
import { SubmissionEditorPage } from './pages/participant/SubmissionEditorPage';
import { SubmissionPreviewPage } from './pages/participant/SubmissionPreviewPage';
import { JudgeDashboardPage } from './pages/judge/JudgeDashboardPage';
import { JudgeAssignmentsPage } from './pages/judge/JudgeAssignmentsPage';
import { JudgeEvaluationPage } from './pages/judge/JudgeEvaluationPage';
import { JudgeProgressPage } from './pages/judge/JudgeProgressPage';

import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage';
import { OrganizerEventsPage } from './pages/organizer/OrganizerEventsPage';
import { OrganizerEventFormPage } from './pages/organizer/OrganizerEventFormPage';
import { OrganizerParticipantsPage } from './pages/organizer/OrganizerParticipantsPage';
import { OrganizerTeamsPage } from './pages/organizer/OrganizerTeamsPage';
import { OrganizerSubmissionsPage } from './pages/organizer/OrganizerSubmissionsPage';
import { OrganizerJudgesPage } from './pages/organizer/OrganizerJudgesPage';
import { OrganizerAssignmentsPage } from './pages/organizer/OrganizerAssignmentsPage';
import { OrganizerRubricPage } from './pages/organizer/OrganizerRubricPage';
import { OrganizerNormalizationPage } from './pages/organizer/OrganizerNormalizationPage';
import { OrganizerResultsPage } from './pages/organizer/OrganizerResultsPage';
import { OrganizerVotingPage } from './pages/organizer/OrganizerVotingPage';
import { OrganizerAuditPage } from './pages/organizer/OrganizerAuditPage';
import { OrganizerExportsPage } from './pages/organizer/OrganizerExportsPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage currentUser={user} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/gallery" element={<ProjectsGalleryPage />} />
      <Route path="/gallery/:id" element={<ProjectDetailsPage />} />
      <Route path="/invite/:token" element={<InvitationPage />} />

      {/* Participant */}
      <Route path="/participant/dashboard" element={<ParticipantDashboardPage />} />
      <Route path="/participant/profile" element={<ParticipantProfilePage />} />
      <Route path="/participant/team" element={<TeamManagementPage />} />
      <Route path="/participant/team/invite" element={<TeamInvitationPage />} />
      <Route path="/participant/submission" element={<SubmissionDashboardPage />} />
      <Route path="/participant/submission/edit" element={<SubmissionEditorPage />} />
      <Route path="/participant/submission/preview" element={<SubmissionPreviewPage />} />

      {/* Organizer (T1) */}
      <Route path="/organizer/events" element={<OrganizerEventsPage />} />
      <Route path="/organizer/events/new" element={<OrganizerEventFormPage />} />
      <Route path="/organizer/events/:id/settings" element={<OrganizerEventFormPage />} />
      <Route path="/organizer/participants" element={<OrganizerParticipantsPage />} />
      <Route path="/organizer/teams" element={<OrganizerTeamsPage />} />
      <Route path="/organizer/submissions" element={<OrganizerSubmissionsPage />} />

      {/* Judging, voting, audit and exports are later-tier features still backed by mock data */}
      <Route path="/judge/dashboard" element={<JudgeDashboardPage currentUser={user} />} />
      <Route path="/judge/assignments" element={<JudgeAssignmentsPage currentUser={user} />} />
      <Route path="/judge/projects/:id" element={<JudgeEvaluationPage currentUser={user} />} />
      <Route path="/judge/progress" element={<JudgeProgressPage currentUser={user} />} />
      <Route path="/organizer/dashboard" element={<OrganizerDashboardPage currentUser={user} />} />
      <Route path="/organizer/judges" element={<OrganizerJudgesPage currentUser={user} />} />
      <Route path="/organizer/assignments" element={<OrganizerAssignmentsPage currentUser={user} />} />
      <Route path="/organizer/rubric" element={<OrganizerRubricPage currentUser={user} />} />
      <Route path="/organizer/normalization" element={<OrganizerNormalizationPage currentUser={user} />} />
      <Route path="/organizer/results" element={<OrganizerResultsPage currentUser={user} />} />
      <Route path="/organizer/voting" element={<OrganizerVotingPage currentUser={user} />} />
      <Route path="/organizer/audit" element={<OrganizerAuditPage currentUser={user} />} />
      <Route path="/organizer/exports" element={<OrganizerExportsPage currentUser={user} />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/events" element={<AdminEventsPage />} />
      <Route path="/admin/audit" element={<AdminAuditPage currentUser={user} />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
