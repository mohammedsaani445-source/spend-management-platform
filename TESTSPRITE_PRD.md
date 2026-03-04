# Product Requirements Document (PRD) - Spend Management Platform

## Project Overview
A comprehensive enterprise-grade spend management and procurement platform designed to streamline the requisition-to-pay process. The platform features role-based access control, automated approval workflows, and a premium, high-performance UI.

## Target Audience
- **Employees/Requesters**: Creating and tracking purchase requests.
- **Approvers/Managers**: Reviewing and authorizing spend.
- **Finance Team**: Managing invoices, budgets, and payments.
- **Admins**: System configuration, user management, and auditing.

## Key Features & User Flows

### 1. Authentication & Security
- **Multi-method Login**: Support for Email/Password and Google OAuth.
- **Account Selection**: Google login must always prompt for account selection (`prompt: 'select_account'`).
- **Two-Factor Authentication (2FA)**: Mandatory TOTP verification for sensitive accounts.
- **Account Status**: Real-time enforcement of the `isActive` flag. Disabled accounts must be instantly logged out and blocked.
- **Signup**: Public signup flow with default 'REQUESTER' role assignment.

### 2. Dashboard Experience
- **Executive View**: Summary of total spend, pending approvals, and department-wise budget utilization.
- **Employee View**: Quick access to "My Requests", "Create Requisition", and personal notifications.

### 3. Procurement Lifecycle
- **Purchase Requisition (PR)**:
    - Users can create PRs with multiple line items, attachments, and department tags.
    - PRs go through an automated approval chain based on department and amount.
- **Purchase Order (PO)**:
    - Once approved, a PR is converted into a PO.
    - POs can be exported as PDF or viewed in the browser.
- **Goods Receipt (GR)**:
    - Users can mark items as "Received" (Full or Partial).
    - Syncs with inventory and finance for 3-way matching.

### 4. Financial Management
- **Invoices**:
    - Uploading invoices against specific POs.
    - Automated 3-way matching (PO vs. GR vs. Invoice).
- **Budgets**:
    - Departmental budget tracking.
    - Real-time alerts when approaching or exceeding limits.

### 5. Administrative & Vendor Tools
- **User Directory**: Admins can manage roles (ADMIN, APPROVER, FINANCE, REQUESTER), departments, and account status.
- **Vendor Management**: Blind bidding, vendor scorecards, and performance tracking.
- **Audit Logs**: Comprehensive logging of all critical actions (auth, approvals, deletions).

## Technical Environment
- **Framework**: Next.js 15+ (App Router).
- **Database/Auth**: Firebase (Realtime Database, Firebase Auth).
- **Styling**: Vanilla CSS with a "Binance-style" premium aesthetic.
- **Local Port**: `3000`

## Core Test Scenarios for TestSprite
1.  **Auth Hardening**: Verify that a disabled user cannot bypass the dashboard even if they have a valid Google session.
2.  **Workflow Integrity**: Ensure a Requester cannot approve their own PR.
3.  **Data Persistence**: Verify that adding a line item to a PR correctly updates the database and the total amount.
4.  **UI Responsiveness**: Verify the layout remains functional on mobile devices (375px width).
