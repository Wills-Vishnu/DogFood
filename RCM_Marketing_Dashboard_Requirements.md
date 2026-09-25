# RCM Marketing Dashboard - Complete Requirements

## Project Overview
A comprehensive Sales & Outreach Management Dashboard for healthcare RCM to track LinkedIn, Email, and Calling outreach across multiple specialties with priority queue management and follow-up tracking.

---

## 1. SPECIALTIES / CATEGORIES (6 Total)
- Internal Medicines
- Emergency  
- Urgent Care
- ABA (Applied Behavior Analysis)
- Ambulatory Services
- Ambulance Services

---

## 2. OPENING DASHBOARD PAGE

### 2.1 Data Feed Overview
- **Visual**: Bar chart showing data availability per specialty
- **Purpose**: Display total number of contacts/data feed available for each specialty at a glance
- **Functionality**: Shows "how much data we have for each specialty"

### 2.2 Category Selection & Export
- **Feature**: Dropdown/selector to choose a specialty
- **Action**: Click on specialty → Filter data and export capability
- **Output**: User can export filtered data by category

---

## 3. OUTREACH TRACKING & FILTERING

### 3.1 Outreach Status Filter
- **Options**: 
  - Already outreach (contacted)
  - Not outreach (not contacted yet)
- **Purpose**: Categorize leads by outreach status
- **Implementation**: Checkbox/toggle filter

### 3.2 Multi-Level Notes System
- **Capability**: Add multiple notes to a single lead
- **Flow**:
  1. First note added → "Add another note" button appears below
  2. Click "Add another note" → Opens field for second note
  3. Each note requires a follow-up date to be set
  4. **Validation**: System validates that follow-up date is set for each note
- **Use Case**: Track multiple follow-up attempts with different dates (e.g., first contact note, then second follow-up note after 5 days)

---

## 4. LINKEDIN OUTREACH MODULE

### 4.1 LinkedIn Outreach Page
- **Organization**: Category-wise (by specialty)
- **Primary View**: Link storage and status tracking
- **Links Stored**: LinkedIn connection links organized by specialty

### 4.2 Specialty Column Navigation
- **Display**: Specialty shown as columns/tabs (ABA, Emergency, Internal Medicines, etc.)
- **Visualization**: Line chart showing LinkedIn outreach across specialties
- **Interaction**: 
  - Click on specialty column → Shows all records for that specialty below
  - Ctrl+Click on link → Opens link in full page (takes to LinkedIn profile)

### 4.3 LinkedIn Connect Request Tracking
- **Feature**: Backend tag integration to detect when sent connect requests are accepted
- **Notification**: System notifies when someone accepts your LinkedIn connect request
- **Follow-up Reminder**: After 5-7 days, reminds user to check if request was accepted (if not auto-detected)
- **Purpose**: Prevent manual checking, automate connection acceptance tracking

### 4.4 LinkedIn Data Structure
- Basic tracking similar to email outreach (simpler than calling outreach)
- Stores: Contact name, LinkedIn profile link, specialty category, request date, status

---

## 5. EMAIL OUTREACH MODULE

### 5.1 Email Outreach Page
- **Organization**: Category-wise (by specialty)
- **Structure**: Excel sheet-like table replication
- **Purpose**: Track email outreach to contacts by specialty

### 5.2 Email Data Columns
- Serial Number
- Contact Name
- Email ID
- Email Date (when email was sent)
- Follow-up Date (auto-calculated or manual)
- Status

### 5.3 Auto Follow-up Date Assignment
- **Default**: Auto-populate follow-up date as 5-6 days after email sent date
- **Manual Override**: Allow user to manually adjust follow-up date
- **Purpose**: Automatic scheduling of email follow-ups

### 5.4 Email Outreach Simplicity
- Less detailed tracking than LinkedIn
- Focus on essential data only
- Similar to calling outreach structure but simpler in complexity

---

## 6. CALLING OUTREACH MODULE

### 6.1 Full Tracking (MAIN REQUIREMENT)
- **Priority**: This is the MOST important feature
- **Scope**: Complete call tracking system with all details

### 6.2 Call Data Structure
- Contact information
- Call date & time
- Call status
- Call notes (full detailed notes)
- Follow-up date for next call

### 6.3 Notes with Follow-up Management
- **Multi-note capability**: Add multiple notes to track different conversations
- **Each note requires**: Follow-up date specification
- **Validation**: Date must be set before note is finalized

### 6.4 Depth of Information
- In-depth tracking of calls
- Detailed notes on each interaction
- Purpose: Track progression of sales conversations

---

## 7. PRIORITY QUEUE (CRITICAL FEATURE)

### 7.1 Daily Priority Display
- **Trigger**: When user logs into dashboard
- **Display**: Shows leads with follow-ups due TODAY
- **Purpose**: Prevent data miss, ensure no follow-ups are forgotten

### 7.2 Priority Queue Information
- Shows which contacts need follow-up calls TODAY
- Example: "60 calls reached, X follow-ups due today"
- Shows metrics like reach count and pending actions

### 7.3 Queue-Based Workflow
- **First Priority**: Work on priority queue items first
- **Then**: Move to next batch of outreach
- **Benefit**: Ensures follow-ups are done before new outreach starts
- **Purpose**: Optimize workflow and prevent data miss

### 7.4 Notifications
- **Type**: In-app notifications (primary)
- **Optional**: Email notifications
- **Content**: "You have X follow-ups due today"
- **Purpose**: Ensure user doesn't miss scheduled follow-ups

---

## 8. MILESTONES / DAILY TARGETS

### 8.1 Daily Minor Milestones
- **Examples**: 50 calls, 60 calls per day
- **Purpose**: Set achievable daily targets
- **Display**: Show progress towards daily milestone
- **Engagement**: Motivate team with milestone tracking

### 8.2 Engaging Features
- Track milestone progress
- Visual indicators of progress
- Positive reinforcement for hitting targets

---

## 9. DATA IMPORT & DUPLICATE HANDLING

### 9.1 Excel File Import
- **Input**: Accept Excel file upload or paste from Excel
- **Process**: Data from Excel is automatically uploaded to database
- **No Manual Entry**: System should import, not require manual data entry

### 9.2 Duplicate Detection
- **Trigger**: System scans for duplicate values during import
- **Error Handling**: If duplicates found, database shows error notification
- **User Action**: User reviews duplicate entries and decides to:
  - **Keep**: Retain duplicate (if legitimate multiple records)
  - **Close/Delete**: Remove duplicate entry

### 9.3 Import Validation
- Automatic upload when Excel data is submitted
- Flag duplicates for review
- Prevent data corruption from duplicate entries

---

## 10. FULL TRACKING SYSTEM

### 10.1 Comprehensive Contact History
- Track every contact across all outreach methods (LinkedIn, Email, Calling)
- Know: "What did we do to this person, when did we do it, what's the status"
- **Purpose**: Never lose track of a contact or their engagement stage

### 10.2 Timeline View
- All actions on a contact shown in chronological order
- LinkedIn connects, emails sent, calls made, notes added - all visible

### 10.3 Status Overview
- Current status of each contact (not outreached, contacted, in negotiation, etc.)
- Last interaction date
- Next follow-up date

---

## 11. WORKFLOW OPTIMIZATION

### 11.1 System Purpose
- Replace manual Excel spreadsheet tracking
- Enable filtering and prioritization
- Prevent memory-based workflow management ("which calls did I make? what did I forget?")
- **Benefit**: 2000+ contacts can't be tracked from memory; need a system

### 11.2 Optimization Timeline
- **Phase 1 (Wednesday)**: Runnable prototype with core trackers
  - Must have: Priority queue, Call tracking, Follow-up dates
  - Can defer: Beautiful UI, Email automation
- **Phase 2 (By December)**: Optimize workflow, sort out process
  - Refine based on real usage
  - Add polish and automation

### 11.3 Current Pain Points
- Can't filter large Excel sheets effectively
- Easy to forget follow-ups
- Hard to prioritize among 2000+ contacts
- No notification system for pending actions

---

## 12. TECHNICAL REQUIREMENTS

### 12.1 MVP (Minimum Viable Product) - By Wednesday
**Must Have:**
- Dashboard with specialty data overview (bar chart)
- Category filtering and selection
- Calling outreach tracker with full notes
- Priority queue showing today's follow-ups
- Multi-note system with follow-up dates
- Basic notifications (in-app)
- Data import from Excel with duplicate detection

**Can Defer:**
- Polished UI/Design
- Email automation
- LinkedIn auto-detection integration
- Email campaign features

### 12.2 User Interface
- **Current Phase**: "Understandable UI" (not production design)
- User asks for something simple that works, can polish UI later
- Focus on functionality over aesthetics initially
- Design improvements can come in Phase 2

### 12.3 Notifications
- **Primary**: In-app notifications (dashboard alerts)
- **Type**: Show tasks due today, reminders for follow-ups
- **Optional Future**: Email notifications for reminders

### 12.4 Data Sync Considerations
- Email automation can be added later (not Phase 1)
- Manual email sending acceptable for MVP
- LinkedIn automation optional for MVP

---

## 13. BUSINESS GOALS

### 13.1 Purpose of Dashboard
- **Primary**: Enable clean, organized outreach system
- **Benefit**: Transparency - see exactly what activities happened with each contact
- **Outcome**: Easier to track, easier to follow up, easier to optimize

### 13.2 Future Monetization
- Build as prototype first
- Test effectiveness internally
- If successful: Package and sell externally
- Plan to deploy to external customers

### 13.3 Transparency & Control
- Full visibility into all outreach activities
- Know who was contacted, how, and what happened
- Ease of management and optimization

---

## 14. DEPLOYMENT & ROLLOUT

### 14.1 Timeline
- **Wednesday**: Runnable MVP version ready
- **December**: Workflow optimization completed
- Future: Full feature release with UI polish

### 14.2 Deployment Strategy
- Internal testing and usage first
- Optimize based on real feedback
- Plan for external release

---

## SUMMARY OF KEY FEATURES

| Feature | Priority | Status |
|---------|----------|--------|
| Dashboard with specialty overview | HIGH | MVP |
| Category filtering & export | HIGH | MVP |
| Calling outreach full tracking | CRITICAL | MVP |
| Priority queue (today's follow-ups) | CRITICAL | MVP |
| Multi-note system with dates | HIGH | MVP |
| Email outreach tracker | HIGH | MVP |
| LinkedIn outreach tracker | MEDIUM | MVP |
| Data import (Excel with duplicates) | HIGH | MVP |
| In-app notifications | HIGH | MVP |
| Daily milestones | MEDIUM | Phase 2 |
| LinkedIn auto-detection | MEDIUM | Phase 2 |
| Email automation | MEDIUM | Phase 2 |
| Polished UI/Design | MEDIUM | Phase 2 |

---

## NEXT STEPS

1. **Create MVP prototype** by Wednesday with core trackers
2. **Test with internal team** for 4-6 weeks
3. **Gather feedback** on workflow optimization
4. **Optimize and enhance** by December
5. **Plan external release** based on success metrics

