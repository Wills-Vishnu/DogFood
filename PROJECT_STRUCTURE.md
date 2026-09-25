# DOGFOOD Frontend Architecture

## Overview
DOGFOOD is a self-hosted hackathon platform with a production-quality React frontend. The application is built with a clean, modular architecture supporting multiple user roles with distinct UX flows.

## Project Structure

```
src/
├── api/
│   └── mockApi.js           # Mock API layer (simulates REST endpoints)
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingState.jsx
│   │   ├── Navigation.jsx
│   │   └── index.js
│   ├── forms/               # Form components
│   ├── dashboard/           # Dashboard-specific components
│   └── ...
├── layouts/
│   └── MainLayout.jsx       # Main layout wrapper
├── pages/
│   ├── public/              # Public pages (no auth required)
│   │   ├── LandingPage.jsx
│   │   ├── GalleryPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── SubmissionDetailPage.jsx
│   ├── participant/         # Participant role pages
│   │   └── DashboardPage.jsx
│   ├── judge/               # Judge role pages
│   │   └── DashboardPage.jsx
│   ├── organizer/           # Organizer role pages
│   │   └── DashboardPage.jsx
│   └── admin/               # Admin role pages
│       └── DashboardPage.jsx
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
├── mocks/
│   └── data.js              # Mock data for development
├── App.js                   # Main app with routing
└── index.css                # Global styles with Tailwind
```

## Design Tokens

### Colors
- **Brand**: Gray scale (50-900) for backgrounds and text
- **Accent**: Sky blue for primary actions and focus states
- **Success**: Green for positive states
- **Warning**: Yellow/amber for warnings
- **Danger**: Red for errors and destructive actions

### Spacing Scale
- xs: 0.25rem, sm: 0.5rem, md: 1rem, lg: 1.5rem, xl: 2rem, 2xl: 3rem, 3xl: 4rem

### Components

#### Common Components
- `Button` - Primary, secondary, ghost, danger variants with sizes
- `Input`, `Textarea`, `Select`, `Checkbox` - Form elements with validation
- `Card`, `CardHeader`, `CardContent`, `CardFooter` - Content containers
- `Badge`, `StatusBadge`, `Tag` - Labels and indicators
- `Modal`, `ConfirmDialog` - Dialogs
- `LoadingSpinner`, `CardSkeleton`, `EmptyState`, `ErrorState` - States
- `Alert` - Messages
- `Header`, `Sidebar` - Navigation

## Mock API Layer

The mock API simulates a REST backend with realistic latency (300ms). It handles:

- **Auth**: login, logout, register, getCurrentUser
- **Events**: CRUD operations, filtering
- **Teams**: creation, joining, member management
- **Submissions**: creation, editing, submission, scoring
- **Judging**: assignments, scoring, rubric management
- **Gallery**: voting, comments, search/filter
- **Audit**: logging all actions

To connect to a real backend, replace `mockApi.js` implementations with actual API calls.

## User Roles

### Participant
- Create/join teams
- Draft and submit projects
- View team roster
- Track judging progress
- Vote and comment on other projects
- Dashboard with submission status

### Judge
- View assigned projects
- Score using weighted rubric
- Provide written feedback
- Track completion progress
- Never see other judges' scores (isolated)
- Dashboard with workload overview

### Organizer
- Create and manage events
- View participant list and teams
- Configure judging rubric
- Assign judges to projects
- Monitor submissions and judging progress
- View voting results
- Export data (audit logs, results)
- Event settings and participant communication

### Admin
- System-wide user management
- Event overview and management
- System health monitoring
- Audit log access
- Configuration management

### Public (Unauthenticated)
- Browse event gallery
- View project details with voting/comments
- Search and filter projects
- User registration and login

## Routing Structure

```
/                           Landing page
/gallery                    Public gallery with voting
/submission/:id             Project detail page
/login                      Login (redirects if authenticated)
/register                   Registration (redirects if authenticated)

/dashboard                  Participant dashboard
/submission/*               Participant submission flows
/gallery                    Participant gallery

/judge/dashboard            Judge dashboard
/judge/assignments          Judge assignment list
/judge/review/:id           Judge scoring interface

/organizer/dashboard        Organizer overview
/organizer/participants     Participant management
/organizer/judging          Judge assignments
/organizer/rubric           Rubric configuration
/organizer/submissions      Submission management
/organizer/results          Results and voting
/organizer/audit            Audit log
/organizer/settings         Event settings

/admin/dashboard            Admin dashboard
/admin/users                User management
/admin/events               Event management
```

## Key Features Implemented

### T1 - Core ✅
- [x] Authentication & sessions
- [x] Role-based navigation
- [x] Event creation and listing
- [x] Teams and team management
- [x] Submission drafting and submission
- [x] Deadline tracking
- [x] Searchable/filterable gallery
- [x] Public project gallery with voting

### T2 - Judging ✅
- [x] Judge invitations and assignments
- [x] Configurable weighted rubrics
- [x] Judge isolation (can't see other judges' scores)
- [x] Judge progress dashboard
- [x] Score normalization (ready for backend)
- [x] Submission review interface

### T3 - Public ✅
- [x] Community voting
- [x] Comments and discussions
- [x] Public gallery
- [x] Results tracking
- [x] Anti-abuse indicators (voting history)

### Future - T4 (Stretch)
- [ ] API/webhooks
- [ ] Certificate generation
- [ ] Embeddable gallery
- [ ] Bulk import/export

## Styling Approach

The application uses **Tailwind CSS** with a custom color palette and component layer:

1. **Utilities**: Tailwind's utility classes for layout and spacing
2. **Components**: Custom component classes in `index.css`
   - `.btn`, `.btn-primary`, `.btn-secondary`, etc.
   - `.input`, `.label`, `.card`
   - `.badge`, `.badge-primary`, etc.
3. **Custom Variants**: Responsive and state variants

All styling is utility-first. No CSS-in-JS or scoped styles.

## State Management

Currently uses React's built-in `useState` for simplicity. The app is structured to easily add:
- Context API for authentication state
- Redux for complex app state
- Custom hooks for shared logic

## Performance Optimizations

- Lazy code splitting via React.lazy (ready for implementation)
- Memoization of components where needed
- Card skeleton loaders for perceived performance
- Optimistic updates on common actions

## Accessibility

- Semantic HTML (`<button>`, `<form>`, etc.)
- ARIA labels where needed
- Focus states on all interactive elements
- Keyboard navigation support
- Color contrast compliance

## Testing Strategy

The mock API allows frontend development independent of backend. To test:

1. **Login with demo accounts**: Use quick login buttons
2. **Navigate between roles**: Logout and re-login as different roles
3. **Check responsive design**: Use browser DevTools (Mobile, Tablet, Desktop)
4. **Test states**: Loading, empty, error, success states are visible

## Next Steps to Production

1. **Connect real backend**: Replace `mockApi.js` with actual API client
2. **Add unit tests**: Jest + React Testing Library
3. **Add E2E tests**: Cypress or Playwright
4. **Performance**: Code splitting, memoization tuning
5. **Security**: CSRF protection, XSS prevention, secure headers
6. **Analytics**: Integration with analytics service
7. **Error boundary**: Add error catching component
8. **Session management**: JWT refresh logic, logout on token expiry
9. **PWA**: Service worker for offline capability

## Development Commands

```bash
npm install              # Install dependencies
npm start               # Start dev server (localhost:3000)
npm build               # Production build
npm test                # Run tests
```

## Design Philosophy

- **User-centric**: UX optimized for each role
- **Clarity**: Information hierarchy and visual consistency
- **Efficiency**: Minimize clicks to accomplish tasks
- **Restraint**: Avoid unnecessary animations, gradients, or visual noise
- **Production-ready**: Polished interactions and error handling
- **Maintainable**: Reusable components and clear patterns
