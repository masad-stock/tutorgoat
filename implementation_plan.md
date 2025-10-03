# Implementation Plan: Enhanced Admin Panel Order Management

## Overview
Enhance the admin panel's order management system with improved filtering, sorting, status updates, assignment features, and notifications. The current system provides basic inquiry viewing and file downloads, but lacks advanced management capabilities needed for efficient tutoring service operations.

## Types
No new data types required. Existing Inquiry model supports all needed fields (status, assignedTutor, quoteAmount, internalNotes, etc.).

## Files
### New Files
- client/src/components/InquiryEditModal.js: Modal for editing inquiry details, status, quotes, and assignments
- client/src/components/BulkActions.js: Component for bulk status updates and assignments
- client/src/components/AdvancedFilters.js: Advanced filtering component with date ranges, service types, etc.
- client/src/components/NotificationSystem.js: Component for showing success/error notifications

### Existing Files to Modify
- client/src/components/AdminPanel.js: Add advanced filtering, sorting, bulk actions, inline editing
- client/src/components/AdminDashboard.js: Make edit/view buttons functional, add quick actions
- server/routes/admin.js: Add bulk update endpoints, enhanced filtering/sorting
- server/services/emailService.js: Add status update notification emails

### Files to Delete
None

## Functions
### New Functions
- bulkUpdateInquiries(inquiryIds, updates): Update multiple inquiries at once
- sendStatusUpdateEmail(inquiry, newStatus): Send email notifications for status changes
- assignTutor(inquiryId, tutorName): Assign tutor to inquiry
- getFilteredInquiries(filters, sortOptions, pagination): Enhanced inquiry fetching

### Modified Functions
- fetchInquiries: Add advanced filtering and sorting parameters
- updateInquiryStatus: Add notification sending
- AdminPanel component: Add state management for advanced filters and bulk selections

## Classes
No new classes required. Existing React components will be enhanced.

## Dependencies
No new dependencies required. Existing packages (React, Express, Mongoose) suffice.

## Testing
### New Tests
- Bulk update functionality
- Advanced filtering combinations
- Email notification sending
- Assignment feature validation

### Existing Tests to Modify
- Admin panel integration tests to cover new features
- API endpoint tests for bulk operations

## Implementation Order
1. Enhance server-side filtering and sorting in admin.js routes
2. Add bulk update API endpoints
3. Create InquiryEditModal component
4. Create AdvancedFilters component
5. Create BulkActions component
6. Update AdminPanel.js with new features
7. Update AdminDashboard.js with functional buttons
8. Add notification emails in emailService.js
9. Test all features and fix issues
