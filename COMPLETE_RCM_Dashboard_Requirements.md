# RCM Marketing & Outreach Dashboard — Complete Requirements

## CORE OBJECTIVE

**The Main Problem:**
The client's outreach data is currently in Excel spreadsheets. Key information is scattered and hard to track:
- Who was contacted vs not contacted
- When follow-ups are due
- What happened in previous outreach attempts
- Which LinkedIn requests were accepted
- What emails were sent and when
- Which tasks need to be done TODAY
- Which doctors/leads should be prioritized

**The Core Requirement:**
> "The system should tell the marketer what needs to be done today so that no outreach/follow-up gets missed."

This requirement is repeated throughout the audio and is the **fundamental philosophy** of the entire application.

---

## 1. LEAD DATA MANAGEMENT

### 1.1 Specialty Categories (Flexible)

**Initial Categories (6 total):**
- Internal Medicine
- Emergency
- Urgent Care
- ABA (Applied Behavior Analysis)
- Ambulatory Services
- Ambulance Services

**⚠️ Important:** System should allow adding new specialties later (not hard-coded).

### 1.2 Core Lead Database Fields

| Field | Purpose | Type | Required |
|-------|---------|------|----------|
| Serial Number | Lead ID | Text | Yes |
| Doctor Name | Contact person | Text | Yes |
| Practice Name | Organization | Text | Yes |
| Specialty | Category | Dropdown | Yes |
| Email | Contact email | Email | Yes |
| Phone | Contact number | Phone | No |
| Website | Practice website | URL | No |
| LinkedIn URL | LinkedIn profile | URL | No |
| Outreach Status | Current status | Dropdown | Yes |
| Last Outreach Date | Previous contact | Date | No |
| Next Follow-up Date | Next action | Date | No |
| Notes | Outreach history | Text (Long) | No |
| Assigned To | Team member | User | No |
| Lead Status | Overall engagement state | Dropdown | Yes |
| Created Date | Record creation | DateTime | System |
| Updated Date | Last modification | DateTime | System |

**Note:** Preserve exact fields from existing Excel sheet during import rather than arbitrarily replacing them.

### 1.3 Outreach Status Options

The system should track the status of each lead:

- Not Contacted
- Contacted
- Follow-up Required
- Engaged
- Responded
- Meeting Scheduled
- Converted
- Not Interested
- Closed

### 1.4 Lead Engagement States

Track where leads are in the sales pipeline:

- Not Engaged
- Contacted
- Engaging
- Responded
- Interested
- Meeting Requested
- Meeting Scheduled
- Converted
- Not Interested

---

## 2. DASHBOARD / OPENING PAGE

### 2.1 Dashboard at Login

When the user logs in, they should see the **Marketing Dashboard** as the first screen.

**Primary Purpose:** Show data distribution across specialties at a glance.

### 2.2 Specialty Data Overview (Bar Chart)

Display: How much data/leads exist for each specialty.

**Example:**
```
Specialty               # of Leads
Internal Medicine      500
Emergency             250
Urgent Care           300
ABA                   150
Ambulatory Services   200
Ambulance Services    100
```

**Visual:** Bar chart clearly showing data volume per specialty.

### 2.3 Dashboard KPIs

Recommended metrics to display:

| Metric | Purpose |
|--------|---------|
| **Total Leads** | Overall database size |
| **Total Outreach Completed** | Contacts made so far |
| **Not Yet Contacted** | Cold leads |
| **Follow-ups Due Today** | 🔴 Priority |
| **Overdue Follow-ups** | 🔴 Critical |
| **LinkedIn Outreach** | Connections sent |
| **Email Outreach** | Emails sent |
| **Calls Completed** | Calls made |
| **Engaged Leads** | Active prospects |
| **Positive Responses** | Interested leads |
| **Meetings/Opportunities** | Sales pipeline |
| **Today's Priority Queue** | 🔴 Most important |

### 2.4 Dashboard Interaction

Dashboard → Click Specialty (e.g., "Internal Medicine")

Then user can:
- View all leads in that specialty
- Filter by outreach status
- Export filtered data
- Work on specific leads

---

## 3. PRIORITY QUEUE ⭐⭐⭐

This is the CORE feature. When the marketer opens the dashboard each day, this should be prominently displayed.

### 3.1 Priority Queue Display

**Format:**
```
🔥 TODAY'S PRIORITY QUEUE

Priority | Doctor Name | Specialty | Action | Due
---------|-------------|-----------|--------|-----
🔴 High  | Dr. Smith   | ABA       | Call   | Today
🔴 High  | Dr. John    | Emergency | LinkedIn Check | Today
🟡 Med   | Dr. David   | Internal Med | Email Follow-up | Today
🟢 Low   | Dr. Lisa    | Urgent Care | New Outreach | Today
```

### 3.2 Priority Logic

Automatically prioritize tasks in this order:

1. **Priority 1 (🔴 Critical):** Overdue follow-ups
2. **Priority 2 (🔴 High):** Follow-ups due today
3. **Priority 3 (🟡 Medium):** LinkedIn connection checks due today
4. **Priority 4 (🟡 Medium):** Email follow-ups due today
5. **Priority 5 (🟢 Low):** New leads waiting for outreach

### 3.3 "What Do I Need To Do Today?" Concept

When the marketer logs in, display:

```
GOOD MORNING! Here's what you need to do today.

Today's Work — 34 Actions

🔴 8 overdue follow-ups
🔴 12 follow-ups due today
🟡 6 LinkedIn requests to check
🟡 5 emails to follow up
🟢 3 new leads to contact

[ View All ]
```

Clicking each category or item opens the corresponding lead/task.

### 3.4 Daily Workflow with Priority Queue

**Morning Flow:**
1. User logs in
2. Dashboard shows "X actions due today"
3. Priority Queue appears first
4. User handles overdue items → Today's items → New leads
5. User adds notes to each lead
6. User selects next follow-up date
7. System schedules next action
8. Tomorrow it appears in Priority Queue

This creates a continuous workflow preventing any missed follow-ups.

---

## 4. FILTERING SYSTEM

The web app needs much better filtering than Excel spreadsheets.

### 4.1 Filter Options

**By Specialty:**
- Internal Medicine
- Emergency
- Urgent Care
- ABA
- Ambulatory Services
- Ambulance Services

**By Outreach Status:**
- Not Contacted
- Outreach Completed
- Follow-up Required

**By Channel:**
- LinkedIn
- Email
- Call

**By Follow-up Status:**
- Due Today
- Upcoming (3-7 days)
- Overdue
- No Follow-up Set

**By Engagement Level:**
- Engaged
- Not Engaged
- Responded
- No Response

**By LinkedIn Status:**
- Request Not Sent
- Request Sent
- Accepted
- Not Accepted
- Message Sent
- Responded

### 4.2 Multi-Filter Support

Users should be able to combine filters.

**Example:**
Specialty: ABA + Outreach: Not Contacted + Channel: LinkedIn + Follow-up: Due Today

This helps the marketer focus on specific work segments.

---

## 5. FULL TRACKING / ACTIVITY TIMELINE ⭐⭐⭐

This is one of the **most important database features**.

### 5.1 Comprehensive Lead Timeline

Every lead should show complete history:

**Example: Dr. John Smith**

```
FULL ACTIVITY TIMELINE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 10 | ☎ CALL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Called office. Office manager asked to send information by email.
Follow-up: Sept 15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 10 | 📧 EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Introduction email sent. PDF attached.
Follow-up: Sept 15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 15 | 🔔 FOLLOW-UP DUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 15 | ☎ CALL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Called again. Doctor unavailable. Left voicemail.
Follow-up: Sept 20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 20 | 💼 LINKEDIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Connection request sent.
Follow-up: Sept 27 (Check acceptance)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 25 | 💼 LINKEDIN ACCEPTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dr. John accepted connection request.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 25 | 📝 NOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Send detailed RCM proposal. Doctor seems interested.
Follow-up: Sept 30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 30 | 📅 FOLLOW-UP DUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5.2 Why This Matters

This makes the system **significantly more useful than Excel** because:
- Complete lead journey is visible
- No context is lost
- Easy to recall what happened when
- Shows progression toward conversion
- Helps identify bottlenecks in outreach process

### 5.3 Activity Types to Track

- ☎ Call (Outgoing)
- 📧 Email
- 💼 LinkedIn (Connection Request, Message, etc.)
- 📝 Note
- 🔔 Follow-up Due / Scheduled
- ✅ Action Completed
- ❌ Not Interested
- 🎯 Opportunity Created

---

## 6. NOTES & FOLLOW-UP HISTORY

### 6.1 Multi-Note Architecture

Each lead should NOT have just one "Notes" field.

Instead, implement a **chronological note history** with follow-ups.

### 6.2 Add Note Flow

```
[ + ADD NOTE ]

Note Text:
[_____________________________________________]

Outreach Method:
[ Call / Email / LinkedIn / Other ]

Date:
[ Sept 10, 2026 ]

Follow-up Date:
[ Tomorrow / 3 Days / 5 Days / 6 Days / Custom ]

[ Save Note ]
```

After saving:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sept 10 | ☎ CALL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Called the practice. Office manager asked us to 
send information by email.

Follow-up: Sept 15

[ + ADD ANOTHER NOTE ]
```

### 6.3 Add Another Note Capability

When user clicks "Add Another Note":

```
[ + ADD ANOTHER NOTE ]

Note Text:
[_____________________________________________]

Outreach Method:
[ Call / Email / LinkedIn / Other ]

Date:
[ Sept 15, 2026 ]

Follow-up Date:
[ Tomorrow / 3 Days / 5 Days / 6 Days / Custom ]

[ Save Note ]
```

This creates a **complete lead timeline** with multiple interactions.

### 6.4 Notes Requirements

- Each note must have: Text, Method, Date, Follow-up Date
- Notes should be chronological (newest first or oldest first - user preference)
- Notes should be searchable
- Notes should include who added them (if team)
- Previous notes should be read-only (no accidental edits)

---

## 7. FOLLOW-UP DATE SYSTEM ⭐

This is arguably the **most important automation**.

### 7.1 Follow-up Date Setting

When a note is added, the user must set a follow-up date:

**Quick Options:**
- [ ] Tomorrow
- [ ] 3 days
- [ ] 5 days
- [ ] 6 days
- [ ] Custom date

**The client specifically mentioned:** "five days, six days later" as typical follow-up windows.

### 7.2 Automated Follow-up Triggering

Once follow-up date is saved:

1. System remembers the date
2. When that date arrives, item appears in **Priority Queue**
3. User is notified (in-app alert, optional email)
4. Item marked "Follow-up Due Today"
5. User can then take action

### 7.3 Follow-up Date Validation

The system should validate that:
- Follow-up date is set for each note
- Follow-up date is in the future (or today)
- System prevents saving a note without a follow-up date

### 7.4 Automatic Follow-up for Emails

When an email is sent/logged:

```
Email Sent: Sept 14
Auto Follow-up Date: Sept 19 (5 days later)
```

User can manually override if needed.

---

## 8. LINKEDIN OUTREACH

### 8.1 LinkedIn Outreach Module

Separate section/tab in the application.

**Purpose:** Store LinkedIn links category-wise and track connection requests.

### 8.2 Specialty-Based Navigation

```
LINKEDIN OUTREACH

[ ABA | Emergency | Internal Med | Urgent Care | Ambulatory | Ambulance ]

Click: ABA
↓
Shows all ABA doctors with LinkedIn data
```

### 8.3 LinkedIn Profile Links

Each lead should display:

```
DOCTOR PROFILE

Name: Dr. Smith
Practice: ABC Medical
Specialty: ABA
Email: doctor@abc.com

LINKEDIN
https://linkedin.com/in/drsmith

[ Click to open LinkedIn profile in new tab ]
```

When clicked → Opens the doctor's LinkedIn profile directly.

### 8.4 LinkedIn Connection Status Options

For each lead, track:

- Not Sent (no connection attempt)
- Request Sent (awaiting acceptance)
- Accepted (connected)
- Not Accepted (request declined)
- Message Sent (message in connection request)
- Responded (they replied to message)
- Not Interested (explicitly declined)

### 8.5 LinkedIn Connection Tracking (5-Day Follow-up)

**Workflow:**

```
Day 1: Connection Request Sent
↓
System automatically creates:
"Check LinkedIn — Day 6" reminder
↓
Day 6: User gets notification
🔔 "Check whether Dr. Smith accepted your LinkedIn connection request"
↓
User clicks: Accepted / Not Accepted / No Response
↓
System updates status
```

**Client's exact requirement:**
"If I send 10 connection requests, in 5 days remind me to check if they were accepted."

### 8.6 LinkedIn Acceptance Notification (Future Enhancement)

**Phase 1 (MVP):** Manual status update
- Send request → Set follow-up → Check manually on day 5-6 → Update status

**Phase 2 (Future):** Possible LinkedIn API Integration
- Investigate LinkedIn API for automatic acceptance detection
- Do NOT assume this is available in MVP
- Architecture should allow for this addition later without major refactoring

---

## 9. EMAIL OUTREACH

### 9.1 Email Outreach Module

Similar to LinkedIn, but simpler.

**Client's requirement:** "Replicate the Excel sheet for email outreach rather than making it excessively complicated."

### 9.2 Email by Specialty

```
EMAIL OUTREACH

[ ABA | Emergency | Internal Med | Urgent Care | Ambulatory | Ambulance ]

Click: Emergency
↓
Shows all Emergency specialty leads with email data
```

### 9.3 Email Tracking Table

Excel-sheet-like display:

| # | Name | Email | Specialty | Status | Email Date | Follow-up |
|---|------|-------|-----------|--------|------------|-----------|
| 001 | Dr. Smith | doctor@abc.com | ABA | Sent | Sept 10 | Sept 15 |
| 002 | Dr. John | john@email.com | Emergency | Not Sent | — | — |
| 003 | Dr. Lisa | lisa@clinic.com | Urgent Care | Sent | Sept 5 | Overdue |

### 9.4 Email Status Options

- Not Sent (drafted)
- Sent (email sent)
- Bounced (undeliverable)
- Opened (if tracking enabled)
- Clicked (if links tracked)
- Responded (reply received)
- Not Interested

### 9.5 Auto Follow-up Date for Emails

When email is logged as sent:

```
Email Sent: Sept 14
Auto-Calculate Follow-up: Sept 19 (5 days later)
```

User can modify if needed (e.g., 3 days, 6 days, custom date).

### 9.6 Email Automation (Not MVP)

**Phase 1:** No automatic email sending
- User sends emails manually
- System tracks: Date sent, recipient, status
- User sets follow-up date manually
- Follow-up appears in Priority Queue

**Phase 2:** Optional email automation
- Set up email templates
- Automated sending on schedule
- But NOT a requirement for MVP

**Important:** The client said they may prefer manual sending initially.

---

## 10. CALLING OUTREACH

### 10.1 Call Tracking

Track who was called, when, what happened, and next steps.

**Fields:**
- Doctor Name / Contact
- Call Date
- Call Duration
- Call Status (Connected / Voicemail / Busy / No Answer)
- Call Notes
- Next Follow-up Date
- Outcome (Interested / Not Interested / Needs Info / Schedule Meeting)

### 10.2 Depth of Tracking

Calling should have the **most detailed tracking** compared to LinkedIn and Email.

Include:
- Exact time of call
- Full conversation notes
- Action items from call
- Commitments made
- Objections raised
- Solutions discussed

### 10.3 Why Calling is Deepest

The client emphasized that LinkedIn and email don't need extensive notes, but calling should have full conversation tracking because it's the main sales channel.

---

## 11. MILESTONES & DAILY TARGETS ⭐

### 11.1 Daily Milestones

The client wants small, achievable daily goals to keep the team engaged.

**Example Targets:**
- 50 calls per day
- 60 calls per day
- 20 LinkedIn requests
- 25 emails
- 10 follow-ups

### 11.2 Milestone Display

```
TODAY'S MILESTONE

🎯 60 Calls

Progress: 32 / 60

Remaining: 28 calls

Progress Bar: [████████░░░░░░░░░░░░] 53%

Time Remaining: 2 hours 15 minutes
```

### 11.3 Daily Progress Tracking

Display overall progress:

```
TODAY'S PROGRESS

☎ Calls         32 / 50    [████████░░] 64%
💼 LinkedIn     8 / 10     [████████░░] 80%
📧 Emails       17 / 25    [██████░░░░] 68%
🔔 Follow-ups   14 / 15    [████████░░] 93%

Overall: 71 / 100 (71%)
```

### 11.4 Purpose

Milestones serve to:
- Keep team motivated
- Provide clear daily targets
- Enable quick progress tracking
- Make outreach feel engaging/gamified
- Support workflow optimization

---

## 12. EXCEL IMPORT & DATA MANAGEMENT ⭐⭐

This is a **mandatory feature** to avoid manual data entry.

### 12.1 Excel Import Workflow

```
Excel File (Excel sheet)
    ↓
[Upload to Dashboard]
    ↓
System Reads Excel
    ↓
Validate Data
    ↓
Detect Duplicates
    ↓
Flag Issues for Review
    ↓
Import Valid Records
    ↓
Dashboard Updated
```

### 12.2 No Manual Entry

**Client's requirement:** "Don't manually enter the existing Excel records into the website."

Instead:
- Provide Excel file
- System imports automatically
- User reviews any issues
- Data appears in dashboard

### 12.3 Import Process

1. User clicks [ Import Excel ]
2. User uploads Excel file (.xlsx, .csv)
3. System reads file
4. System maps columns to database fields
5. System validates data
6. System checks for duplicates
7. System flags any issues
8. User confirms import
9. Records are added to database

### 12.4 Data Validation During Import

Check:
- Required fields present
- Email format valid
- Phone format valid (if provided)
- Specialty exists or can be created
- No blank rows

### 12.5 Duplicate Detection ⭐

**Critical Requirement:** "Excel - Website duplicate must be deleted"

When importing, system should check:

**Exact Duplicates:**
- Same doctor name + same practice = duplicate

**Fuzzy Matches:**
- Dr. John Smith vs Dr. J. Smith (same person?)
- ABC Medical vs ABC Medical Group (same practice?)

**Website Duplicates:**
- www.abchealth.com
- abchealth.com
- https://abchealth.com/

Should be recognized as same website. Implementation: URL normalization.

### 12.6 Duplicate Review Screen

```
⚠️ DUPLICATE RECORDS FOUND — 7

Excel Record         | Existing Record      | Action
─────────────────────|─────────────────────|─────────────
Dr. Smith            | Dr. John Smith       | [ Review ]
ABC Medical          | ABC Medical Group    | [ Review ]
...

[ Keep Existing ] [ Import New ] [ Merge ] [ Skip ]
```

**Actions:**
- **Keep Existing:** Don't import the Excel version
- **Import New:** Replace existing with Excel version
- **Merge:** Combine data from both records
- **Skip:** Don't import this record

### 12.7 Import Confirmation

After review:

```
✅ Import Complete

Records Added: 450
Records Skipped (Duplicates): 23
Records with Issues: 5

[ View Details ] [ Close ]
```

---

## 13. DATA EXPORT

### 13.1 Export Functionality

After filtering data, user should be able to export.

**Flow:**
```
Dashboard
  ↓
Filter: Specialty = ABA
Filter: Outreach Status = Not Contacted
  ↓
[ Export ] button appears
  ↓
User clicks [ Export to Excel ]
  ↓
File downloaded: ABA_NotContacted_Sept14.xlsx
```

### 13.2 Export Options

- Excel (.xlsx)
- CSV (.csv)
- PDF (report format)

### 13.3 Exported Data

Includes:
- All visible columns
- All filtered records
- Timestamp of export
- User who exported

---

## 14. LEAD DETAIL PAGE

Clicking any lead should open a detailed view.

### 14.1 Lead Profile Header

```
Dr. John Smith
Internal Medicine
ABC Medical Group
```

### 14.2 Contact Information Section

```
CONTACT INFORMATION

Phone: (555) 123-4567
Email: doctor@abc.com
Website: www.abchealth.com
LinkedIn: https://linkedin.com/in/drsmith
Practice: ABC Medical Group
Specialty: Internal Medicine
Assigned To: [Sarah]
```

### 14.3 Outreach Status Section

```
OUTREACH STATUS

Overall: 🟡 Follow-up Required

LinkedIn: 🟡 Request Sent (Sept 10)
Email: 🟢 Sent (Sept 5)
Calling: 🟡 Follow-up Due (Today)

Next Action: 🔴 Call Dr. Smith today (Due Sept 14)
```

### 14.4 Full Activity Timeline

Display complete chronological history (as described in Section 5).

### 14.5 Add New Activity

```
[ + ADD NOTE ]

Note Text:
[_____________________________________________]

Outreach Method:
[ Call / Email / LinkedIn / Other ]

Follow-up Date:
[ Tomorrow / 3 Days / 5 Days / 6 Days / Custom ]

[ Save Note ]
```

---

## 15. NOTIFICATION SYSTEM

### 15.1 In-App Notifications (Phase 1 - MVP)

When user logs in or throughout the day:

```
🔔 TODAY'S ACTIONS

12 follow-ups due today
5 LinkedIn connections need checking
7 overdue leads
14 new leads haven't been contacted
```

**Display Location:** Top of dashboard or persistent banner.

**Interaction:** Clicking each notification filters to show relevant leads.

### 15.2 Priority Alerts

**Red (Critical):**
- Overdue follow-ups
- Follow-ups due today
- Meetings scheduled today

**Yellow (Important):**
- LinkedIn checks due
- Email follow-ups
- Upcoming meetings

**Green (Routine):**
- New leads available
- Weekly summaries

### 15.3 Email Notifications (Phase 2 - Future)

Optional (not MVP requirement):
- Daily summary email
- Reminders for overdue items
- Weekly progress report

---

## 16. APPLICATION NAVIGATION STRUCTURE

Recommended menu/navigation for prototype:

```
MARKETING DASHBOARD

├── 🏠 DASHBOARD
│   ├── Data Overview (bar chart)
│   ├── KPIs
│   └── Quick Stats
│
├── 🔥 PRIORITY QUEUE
│   ├── Overdue Items
│   ├── Due Today
│   └── Upcoming
│
├── 👨‍⚕️ LEADS
│   ├── All Leads
│   ├── By Specialty
│   │   ├── Internal Medicine
│   │   ├── Emergency
│   │   ├── Urgent Care
│   │   ├── ABA
│   │   ├── Ambulatory Services
│   │   └── Ambulance Services
│   └── Search/Filter
│
├── 💼 LINKEDIN OUTREACH
│   ├── By Specialty
│   ├── Status Tracking
│   └── Connection Management
│
├── 📧 EMAIL OUTREACH
│   ├── By Specialty
│   ├── Status Tracking
│   └── Follow-ups
│
├── 📞 CALLING OUTREACH
│   ├── Call History
│   ├── Active Calls
│   └── Follow-ups
│
├── 📝 ACTIVITY TIMELINE
│   └── View full history by lead
│
├── 🎯 MILESTONES
│   ├── Today's Targets
│   └── Progress Tracking
│
├── 📊 REPORTS
│   ├── Outreach Summary
│   ├── Conversion Funnel
│   └── Team Performance
│
├── 📥 IMPORT DATA
│   ├── Upload Excel
│   ├── Duplicate Review
│   └── Import History
│
└── ⚙️ SETTINGS
    ├── Specialty Management
    ├── User Management
    └── Preferences
```

---

## 17. DATABASE STRUCTURE (Recommended)

If building this application, use this normalized schema:

```
LEADS
├── lead_id (Primary Key)
├── doctor_name
├── practice_name
├── specialty_id (Foreign Key → SPECIALTIES)
├── email
├── phone
├── website
├── linkedin_url
├── overall_status
├── assigned_to (Foreign Key → USERS)
├── created_date
└── updated_date

SPECIALTIES
├── specialty_id (Primary Key)
├── specialty_name
└── active (boolean)

USERS
├── user_id (Primary Key)
├── name
├── email
├── role
└── active

OUTREACH
├── outreach_id (Primary Key)
├── lead_id (Foreign Key → LEADS)
├── channel (LinkedIn / Email / Call)
├── status
├── outreach_date
└── followup_date

ACTIVITIES
├── activity_id (Primary Key)
├── lead_id (Foreign Key → LEADS)
├── activity_type (Call / Email / LinkedIn / Note)
├── note
├── activity_date
└── next_followup_date

LINKEDIN_TRACKING
├── tracking_id (Primary Key)
├── lead_id (Foreign Key → LEADS)
├── request_date
├── status (Not Sent / Sent / Accepted / Not Accepted)
└── check_date

EMAIL_TRACKING
├── tracking_id (Primary Key)
├── lead_id (Foreign Key → LEADS)
├── email_address
├── sent_date
├── status
└── followup_date

MILESTONES
├── milestone_id (Primary Key)
├── date
├── target_type (Calls / LinkedIn / Emails)
├── target_count
├── completed_count
└── created_by (Foreign Key → USERS)
```

---

## 18. MVP SCOPE (RUNNABLE BY WEDNESDAY)

### 18.1 Must Have (Phase 1)

These are absolutely critical for the prototype:

| Feature | Priority | Why |
|---------|----------|-----|
| Dashboard (specialty overview) | 🔴 MUST | Entry point, shows data distribution |
| Lead Database | 🔴 MUST | Core data |
| Specialty Categories | 🔴 MUST | Organization structure |
| Excel Import | 🔴 MUST | Data loading (no manual entry) |
| Duplicate Detection | 🔴 MUST | Data quality |
| Filtering System | 🔴 MUST | Find relevant leads |
| Outreach Status | 🔴 MUST | Track status |
| Full Activity Timeline | 🔴 MUST | Complete lead history |
| Notes/Follow-up | 🔴 MUST | Multi-note system with dates |
| Priority Queue | 🔴 MUST | **Core requirement** |
| LinkedIn Links | 🔴 MUST | Store profiles |
| LinkedIn Status Tracking | 🔴 MUST | Connection requests |
| Email Outreach Tracking | 🔴 MUST | Email data |
| Follow-up Dates | 🔴 MUST | Automation engine |
| Basic Notifications | 🔴 MUST | "What do I do today?" |
| Data Export | 🟠 IMPORTANT | User requirement |
| Daily Milestones | 🟠 IMPORTANT | Engagement |

### 18.2 Can Defer (Phase 2)

These can be added after MVP is working:

- Email automation
- LinkedIn API integration
- Automatic LinkedIn acceptance detection
- Email notifications
- Advanced analytics
- Polished UI/Design
- Advanced reporting
- Team management
- Lead scoring
- Workflow automation

### 18.3 Client's Exact MVP Request

Client said:
> "I don't need anything fancy right now. Give me a runnable version. The mandatory things for me are the trackers. You can improve the UI later."

**Translation:** Build the data tracking system, make it work, don't worry about making it look beautiful.

---

## 19. THE FUNDAMENTAL PHILOSOPHY

Reduce the client's daily workflow to this:

**BEFORE (Excel-based):**
```
Morning
  ↓
Open Excel
  ↓
Search through 2000+ rows
  ↓
Try to remember who to call
  ↓
Forget some follow-ups
  ↓
No clear priorities
```

**AFTER (Dashboard-based):**
```
Morning
  ↓
Log into Dashboard
  ↓
See: "You have 12 follow-ups due today"
  ↓
Priority Queue shows exactly whom to call
  ↓
Call them in order
  ↓
Add note + set next follow-up date
  ↓
System remembers everything
```

The entire application is built around: **"Tell me what to do today."**

---

## 20. RECOMMENDED MVP BUILD ORDER

To demonstrate value quickly, build in this sequence:

### Week 1
1. ✅ Database schema & setup
2. ✅ Lead table + basic CRUD
3. ✅ Specialty categories

### Week 2
4. ✅ Excel import with duplicate detection
5. ✅ Dashboard with bar chart
6. ✅ Basic filtering

### Week 3
7. ✅ Activity/notes tracking (full timeline)
8. ✅ Follow-up date system
9. ✅ LinkedIn & Email data tracking

### Week 4
10. ✅ Priority Queue (core feature)
11. ✅ Notifications
12. ✅ Lead detail page
13. ✅ Data export

This gives a working prototype by the deadline.

---

## 21. SUCCESS CRITERIA

The MVP is successful when:

- [ ] Dashboard loads with specialty data overview
- [ ] User can upload Excel file without manual entry
- [ ] Duplicates are detected and reviewed
- [ ] User can filter leads by 5+ criteria
- [ ] Every lead shows complete activity timeline
- [ ] Notes can be added with follow-up dates
- [ ] Priority Queue shows today's work
- [ ] LinkedIn/Email links are stored and clickable
- [ ] User can export filtered data
- [ ] System notifies "X tasks due today"

---

## 22. CLIENT GOALS & FUTURE

The client plans to:
1. Use this internally first (prototype phase)
2. Test it with real outreach (Oct-Dec 2026)
3. Optimize workflow based on usage
4. Eventually sell this as a product externally

This is not just an internal tool—it's a potential commercial product. Build accordingly (clean code, scalable architecture, proper documentation).

---

## END OF REQUIREMENTS

This document represents everything the client discussed plus a structured technical interpretation. Use this as the complete spec for development.

**Key Takeaway:** Build a system that answers the question: *"What do I need to do today?"* Everything else is supporting details.
