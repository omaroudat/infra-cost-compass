# WIR Management System - Comprehensive Business & Technical Documentation

## Document Overview

**Project Name**: WIR Management System  
**Project Type**: Construction Infrastructure Management Platform  
**Technology Stack**: React + TypeScript + Supabase  
**Target Industry**: Construction, Infrastructure, Pipeline/Sewer Projects  
**Document Version**: 1.0  
**Last Updated**: December 2024

---

## 1. Business Overview

### Problem Being Solved

The WIR (Work Inspection Request) Management System addresses critical challenges in construction project management:

- **Manual Paper-Based Processes**: Traditional construction inspection workflows rely on paper forms, leading to delays, lost documents, and poor traceability
- **Disconnected Financial Tracking**: BOQ (Bill of Quantities) items, work progress, and invoicing are managed separately, causing inconsistencies
- **Limited Real-Time Visibility**: Project managers lack real-time insights into work completion, approval status, and financial performance
- **Compliance & Audit Challenges**: Difficulty maintaining comprehensive audit trails for regulatory compliance and quality assurance
- **Multi-Language Requirements**: Construction projects often require bilingual documentation (English/Arabic) for international teams

### Target Users and Market

**Primary Users:**  
- **Project Managers**: Overall project oversight, dashboard monitoring, progress tracking  
- **Site Engineers**: WIR creation, inspection results, technical reviews  
- **Financial Controllers**: Invoice processing, BOQ management, cost tracking  
- **Quality Assurance Teams**: Audit history, compliance monitoring  
- **Contractors**: Work submission, progress reporting  
- **Admin Users**: System configuration, user management, data management

**Market Segments:**  
- Infrastructure construction companies  
- Government construction projects  
- Pipeline and sewer installation projects  
- Large-scale civil engineering projects  
- International construction contractors operating in MENA region

### Value Proposition and Key Benefits

**Operational Benefits:**  
- **80% Reduction** in paper-based processing time  
- **Real-time visibility** into project progress and financial status  
- **Automated calculations** for BOQ items, breakdown components, and invoicing  
- **Bi-lingual support** for international project teams  
- **Mobile-responsive** interface for field operations

**Financial Benefits:**  
- **Improved cash flow** through faster approval processes  
- **Reduced disputes** with automated calculations and audit trails  
- **Better cost control** with integrated BOQ and progress tracking  
- **Accurate invoicing** based on approved work quantities

**Compliance Benefits:**  
- **Complete audit trail** for all transactions and approvals  
- **Role-based access control** ensuring data security  
- **Document management** with version control and attachments  
- **Regulatory compliance** for construction industry standards

### Business Workflows and Use Cases

**Core Workflow: WIR Lifecycle**  
1. **Work Completion**: Contractor completes work on specific BOQ item  
2. **WIR Creation**: Site engineer creates WIR with location details, measurements  
3. **Document Attachment**: Photos, certificates, drawings uploaded  
4. **Review Process**: Quality engineer reviews WIR against specifications  
5. **Approval/Rejection**: WIR approved (A), conditionally approved (B), or rejected (C)  
6. **Progress Update**: Approved work updates project progress automatically  
7. **Invoice Generation**: Approved WIRs feed into monthly invoice calculations

**Secondary Workflows:**  
- **BOQ Management**: Setup and maintenance of Bill of Quantities structure  
- **Breakdown Planning**: Decomposition of BOQ items into executable tasks  
- **Progress Monitoring**: Real-time tracking of completion percentages  
- **Financial Reporting**: Automated generation of project financial summaries  
- **Audit & Compliance**: Historical tracking and reporting for audits

---

## 2. System Architecture & Technical Overview

### Overall Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  React 18 + TypeScript + Tailwind CSS + shadcn/ui      │
│  ├── Dashboard & Analytics                              │
│  ├── Form Management & Validation                       │
│  ├── Real-time Updates                                  │
│  └── Multi-language Support (EN/AR)                     │
└─────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend Layer                         │
│           Supabase (PostgreSQL + API)                  │
│  ├── Authentication & Authorization                     │
│  ├── Real-time Database                                 │
│  ├── File Storage                                       │
│  ├── Edge Functions                                     │
│  └── Row-Level Security (RLS)                           │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  PostgreSQL Database with 9 Core Tables                │
│  ├── Users & Profiles (Authentication)                 │
│  ├── BOQ Items (Bill of Quantities)                    │
│  ├── Breakdown Items (Task Decomposition)              │
│  ├── WIRs (Work Inspection Requests)                   │
│  ├── Attachments (File Management)                     │
│  ├── Contractors & Engineers (Staff)                   │
│  └── Audit Logs (Compliance Tracking)                  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack Being Used

**Frontend Technologies:**  
- **React 18**: Modern component-based UI framework  
- **TypeScript**: Type-safe JavaScript for better development experience  
- **Vite**: Fast build tool and development server  
- **Tailwind CSS**: Utility-first CSS framework with custom design system  
- **shadcn/ui**: High-quality component library built on Radix UI  
- **React Router**: Client-side routing for SPA navigation  
- **TanStack Query**: Server state management and caching  
- **React Hook Form**: Form validation and management  
- **Recharts**: Data visualization and charting  
- **Lucide React**: Modern icon library

**Backend Technologies:**  
- **Supabase**: Backend-as-a-Service (BaaS) platform  
- **PostgreSQL**: Production-grade relational database  
- **PostgREST**: Auto-generated REST API from database schema  
- **Realtime**: WebSocket-based real-time updates  
- **Storage**: S3-compatible file storage service  
- **Edge Functions**: Serverless functions for custom logic

**Development & Deployment:**  
- **Lovable Platform**: Development environment and deployment  
- **Git Version Control**: Source code management  
- **ESLint + TypeScript**: Code quality and type checking  
- **Capacitor**: Mobile app deployment capability

### Infrastructure Setup

**Development Environment:**  
- **Local Development**: Vite dev server on port 8080  
- **Hot Module Replacement**: Instant code updates during development  
- **TypeScript Compilation**: Real-time type checking and compilation

**Production Deployment:**  
- **Lovable Cloud**: Managed hosting with global CDN  
- **Custom Domain Support**: Production domains with SSL certificates  
- **Automatic Deployments**: Git-based continuous deployment  
- **Environment Variables**: Secure configuration management

**Database Infrastructure:**  
- **Supabase Cloud**: Managed PostgreSQL with automatic backups  
- **Connection Pooling**: Optimized database connection management  
- **Read Replicas**: Scalable read operations (if configured)  
- **Point-in-Time Recovery**: Database backup and restore capabilities

**File Storage:**  
- **Supabase Storage**: S3-compatible object storage  
- **CDN Distribution**: Global content delivery for attachments  
- **Access Control**: Fine-grained permissions for file access  
- **Versioning**: File version management and retention

### Security, Authentication, and Authorization Details

**Authentication System:**  
- **Manual Authentication**: Custom authentication with username/password  
- **Session Management**: Secure session handling with automatic refresh  
- **Password Security**: Hashed password storage (implementation details in backend)  
- **Multi-Factor Authentication**: Ready for future MFA implementation

**Authorization Framework:**  
- **Role-Based Access Control (RBAC)**: Four primary roles with specific permissions  
  - **Admin**: Full system access, user management, configuration  
  - **Editor**: BOQ/Breakdown management, WIR editing, financial access  
  - **Viewer**: Read-only access to dashboards and reports  
  - **Data Entry**: WIR creation and editing, limited financial access

**Data Security:**  
- **Row-Level Security (RLS)**: Database-level access controls  
- **API Security**: Automatic API endpoint protection based on user roles  
- **Data Encryption**: Encrypted data transmission (HTTPS) and storage  
- **Audit Logging**: Complete activity tracking for security monitoring

**Access Control Matrix:**

| Feature           | Admin | Editor | Viewer | Data Entry |
|-------------------|-------|--------|--------|------------|
| Dashboard         | ✓     | ✓      | ✓      | ✓          |
| BOQ Management    | ✓     | ✓      | ✗      | ✗          |
| Breakdown         | ✓     | ✓      | ✗      | ✗          |
| WIR Creation      | ✓     | ✓      | ✗      | ✓          |
| WIR Approval      | ✓     | ✓      | ✗      | ✗          |
| Financial Reports | ✓     | ✓      | ✓      | ✗          |
| User Management   | ✓     | ✗      | ✗      | ✗          |
| Audit History     | ✓     | ✗      | ✗      | ✗          |
| File Management   | ✓     | ✗      | ✗      | ✗          |

---

## 3. Modules & Features

### 3.1 Dashboard Module

**Purpose**: Executive and operational overview of project status, financial performance, and key metrics.

**Key Features:**  
- **Real-time KPI Cards**: Total approved value, rejected WIRs, project completion, approval rates  
- **Interactive Charts**: WIR value analysis, status distribution, contractor performance  
- **Advanced Filtering**: Filter by contractor, engineer, date ranges, project phases  
- **Executive Reporting**: Professional formatting suitable for stakeholder presentations  
- **Multi-currency Support**: Saudi Riyal (SAR) formatting with international number standards

**UI/UX Details:**  
- **Responsive Grid Layout**: Adapts to desktop, tablet, and mobile screens  
- **Color-coded Status**: Green (approved), amber (conditional), red (rejected)  
- **Drill-down Navigation**: Click charts to navigate to detailed views  
- **Auto-refresh**: Live data updates every 30 seconds  
- **Export Capabilities**: PDF and Excel export for offline sharing

**Module Interactions:**  
- **Consumes from**: WIRs, BOQ Items, Progress Tracking, Financial calculations  
- **Produces to**: Navigation triggers to detail modules, filter parameters for reports

### 3.2 BOQ Items (Bill of Quantities) Module

**Purpose**: Master data management for project cost structure, quantity estimates, and unit rates.

**Key Features:**  
- **Hierarchical Structure**: Parent-child relationships for complex project structures  
- **Multi-language Support**: English and Arabic descriptions for international projects  
- **Unit Rate Management**: Flexible unit definitions (meters, cubic meters, items, etc.)  
- **Automatic Calculations**: Total amounts calculated from quantity × unit rate  
- **Import/Export**: Bulk data management through Excel templates  
- **Version Control**: Track changes to BOQ items over project lifecycle

**Data Structure:**
```typescript
BOQItem {
  id: string;           // Unique identifier
  code: string;         // BOQ item code (e.g., "SW.01.001")
  description: string;  // English description
  descriptionAr?: string; // Arabic description
  quantity: number;     // Estimated quantity
  unit: string;         // Unit of measurement
  unitAr?: string;     // Arabic unit description
  unitRate: number;     // Rate per unit (SAR)
  totalAmount: number;  // quantity × unitRate
  parentId?: string;    // For hierarchical structure
  children?: BOQItem[]; // Sub-items
  level: number;        // Hierarchy depth
}
```

**Business Rules:**  
- BOQ codes must be unique within project  
- Parent items cannot have direct unit rates (calculated from children)  
- Leaf items must have positive quantities and unit rates  
- Changes to parent BOQ items cascade to breakdown items  
- Total project value calculated by summing all leaf items

**Module Interactions:**  
- **Feeds into**: Breakdown Items (decomposition), WIRs (work against BOQ), Progress Tracking (completion %), Invoices (billing basis)  
- **Receives from**: External BOQ systems (import), User input (manual entry)

### 3.3 Break-Down Module

**Purpose**: Decomposition of BOQ items into executable work packages with specific percentages and values.

**Key Features:**  
- **Automatic Breakdown Generation**: Creates breakdown items for all leaf BOQ items  
- **Percentage-based Allocation**: Define work components as percentages of BOQ value  
- **Value-based Allocation**: Direct value assignment for specific work elements  
- **Hierarchical Sub-items**: Multi-level breakdown for complex work packages  
- **Unit Rate Inheritance**: Automatically inherits unit rates from parent BOQ items  
- **Validation Rules**: Ensures breakdown percentages don't exceed 100%

**Data Structure:**
```typescript
BreakdownItem {
  id: string;
  keyword?: string;        // Work package identifier
  keywordAr?: string;     // Arabic keyword
  description?: string;    // Work description
  descriptionAr?: string; // Arabic description
  percentage?: number;     // Percentage of BOQ item (0-100)
  value?: number;         // Direct value assignment
  boqItemId: string;      // Parent BOQ item reference
  parentBreakdownId?: string; // For sub-breakdowns
  unitRate?: number;      // Inherited from BOQ
  quantity?: number;      // Actual work quantity
  isLeaf: boolean;        // Identifies executable items
}
```

**Business Rules:**  
- Total breakdown percentages per BOQ item cannot exceed 100%  
- Leaf breakdown items must have either percentage OR value (not both)  
- Sub-breakdown items inherit constraints from parent breakdown  
- Changes to BOQ items automatically update related breakdowns  
- Breakdown modifications require editor-level permissions

**Module Interactions:**  
- **Consumes from**: BOQ Items (structure and values), User configurations  
- **Produces to**: WIRs (work selection), Progress Tracking (completion basis), Calculations (amount derivation)

### 3.4 WIRs (Work Inspection Requests) Module

**Purpose**: Core workflow management for work completion reporting, inspection, and approval processes.

**Key Features:**  
- **Comprehensive Form Management**: Location details, measurements, contractor/engineer assignment  
- **Multi-step Workflow**: Draft → Submitted → Inspected → Approved/Conditional/Rejected  
- **Geographic Information**: Manhole references, zone/road/line identifiers for infrastructure projects  
- **Measurement Recording**: Length, diameter, and other technical measurements  
- **Result Management**: Three-tier approval system (A/B/C) with conditional reasons  
- **Revision System**: Version control for WIR modifications and resubmissions  
- **Bulk Operations**: Multi-select for batch approvals and status updates

**Data Structure:**
```typescript
WIR {
  id: string;
  wirNumber: string;           // Auto-generated WIR reference
  boqItemId: string;          // Related BOQ item
  description: string;         // Work description
  descriptionAr?: string;     // Arabic description
  submittalDate: string;      // When work was submitted
  receivedDate?: string;      // When inspection completed
  status: 'submitted' | 'completed';
  result?: 'A' | 'B' | 'C';  // Approved/Conditional/Rejected
  statusConditions?: string;   // Reason for conditional/rejection
  calculatedAmount: number;    // Computed financial value
  calculationEquation?: string; // Formula used for calculation
  contractor: string;         // Responsible contractor
  engineer: string;          // Reviewing engineer
  lengthOfLine: number;       // Physical measurement (meters)
  diameterOfLine: number;     // Physical measurement (mm)
  lineNo: string;            // Infrastructure reference
  region: string;            // Geographic region
  manholeFrom: string;       // Starting point
  manholeTo: string;         // Ending point
  zone: string;              // Zone identifier
  road: string;              // Road reference
  line: string;              // Line reference
  value: number;             // Base work value
  selectedBreakdownItems?: string[]; // Selected breakdown components
  attachments?: string[];    // Linked files/photos
  parentWIRId?: string;      // For revisions
  revisionNumber?: number;   // Version tracking
  originalWIRId?: string;    // Original WIR reference
}
```

**Workflow States:**  
1. **Draft**: WIR created but not submitted  
2. **Submitted**: WIR submitted for inspection  
3. **Under Review**: Engineer reviewing WIR  
4. **Completed**: Final result assigned (A/B/C)

**Business Rules:**  
- WIR numbers are auto-generated and immutable  
- Only data_entry and editor roles can create WIRs  
- Approval results can only be set by editor+ roles  
- Revisions create new WIR with reference to original  
- Calculations are automatically performed based on breakdown selections  
- Geographic references are mandatory for infrastructure projects

**Module Interactions:**  
- **Consumes from**: BOQ Items (work basis), Breakdown Items (component selection), Attachments (supporting documents), Staff data (contractor/engineer lists)  
- **Produces to**: Progress Tracking (completion updates), Financial calculations (approved amounts), Audit History (all changes), Reports (status summaries)

### 3.5 Reports Module

**Purpose**: Comprehensive reporting system for financial, progress, quality, and compliance reporting.

**Key Features:**  
- **Financial Reports**: Cost summaries, approved amounts, variance analysis  
- **Progress Reports**: Completion percentages, timeline analysis, milestone tracking  
- **Quality Reports**: Approval rates, rejection analysis, rework statistics  
- **Compliance Reports**: Audit trails, user activity, data integrity checks  
- **Customizable Filters**: Date ranges, contractors, engineers, BOQ categories  
- **Multiple Export Formats**: PDF, Excel, CSV for different stakeholder needs  
- **Scheduled Reports**: Automated generation and distribution (future enhancement)

**Report Types:**

| Report Category | Report Name         | Data Sources | Key Metrics                              |
|-----------------|---------------------|--------------|----------------------------------------|
| Financial       | Approved Value Summary | WIRs, BOQ    | Total approved, conditional, rejected amounts |
| Financial       | BOQ vs Actual       | BOQ Items, WIRs | Variance analysis, completion rates    |
| Financial       | Invoice Preparation | WIRs, Progress | Monthly billing summaries               |
| Progress        | Project Completion  | All modules  | Overall progress, milestone status      |
| Progress        | Contractor Performance | WIRs, Staff | Approval rates by contractor             |
| Quality         | Inspection Results  | WIRs         | Pass/fail rates, common issues           |
| Compliance      | Audit Trail         | Audit Logs   | User activities, data changes            |

**UI/UX Features:**  
- **Interactive Filters**: Dynamic filter combinations for custom reports  
- **Real-time Preview**: Instant report generation without page refresh  
- **Responsive Tables**: Sortable, searchable data grids  
- **Chart Integration**: Visual representations of key metrics  
- **Print Optimization**: Professional formatting for hard copy distribution

**Module Interactions:**  
- **Consumes from**: All modules (comprehensive data aggregation)  
- **Produces to**: External systems (export files), Email notifications (future), Dashboard (summary metrics)

### 3.6 Progress Tracking Module

**Purpose**: Real-time monitoring of work completion against planned quantities and timelines.

**Key Features:**  
- **Automatic Progress Calculation**: Based on approved WIRs against BOQ quantities  
- **Multi-level Tracking**: BOQ item level, breakdown component level, geographic segment level  
- **Visual Progress Indicators**: Progress bars, completion percentages, status colors  
- **Trend Analysis**: Progress velocity, projected completion dates  
- **Geographic Tracking**: Progress by zones, roads, lines for infrastructure projects  
- **Exception Reporting**: Identification of delayed or problematic work areas

**Progress Calculation Logic:**
```typescript
// BOQ Item Progress
boqProgress = (sum of approved WIR quantities / BOQ total quantity) × 100

// Breakdown Progress  
breakdownProgress = (approved WIRs for breakdown / breakdown total value) × 100

// Geographic Progress
segmentProgress = (completed work in segment / total work in segment) × 100
```

**Key Metrics:**  
- **Overall Project Completion**: Weighted average across all BOQ items  
- **Financial Completion**: Approved value / Total BOQ value  
- **Physical Completion**: Actual quantities / Planned quantities  
- **Time-based Progress**: Actual vs planned timeline completion

**Module Interactions:**  
- **Consumes from**: WIRs (approved work), BOQ Items (planned quantities), Breakdown Items (component tracking)  
- **Produces to**: Dashboard (KPIs), Progress Summary (roll-up views), Reports (progress analysis)

### 3.7 Progress Summary Module

**Purpose**: High-level aggregated view of project progress with drill-down capabilities for detailed analysis.

**Key Features:**  
- **Executive Summary**: Overall project health, key metrics, critical issues  
- **Hierarchical Views**: Project → BOQ Category → BOQ Item → Breakdown → Geographic Segment  
- **Comparison Analysis**: Planned vs actual, current vs previous periods  
- **Critical Path Analysis**: Identification of bottlenecks and critical work areas  
- **Forecast Modeling**: Projected completion dates based on current progress rates  
- **Stakeholder Dashboards**: Customized views for different user roles

**Summary Aggregations:**  
- **Financial Summary**: Total project value, approved amounts, remaining work value  
- **Physical Summary**: Quantities completed, remaining quantities, completion rates  
- **Timeline Summary**: Milestones achieved, critical path status, delay analysis  
- **Quality Summary**: Approval rates, rework percentages, quality trends

**Module Interactions:**  
- **Consumes from**: Progress Tracking (detailed progress), WIRs (completion data), BOQ Items (baseline data)  
- **Produces to**: Dashboard (executive KPIs), Reports (summary reports), Navigation (drill-down to details)

### 3.8 Invoices Module

**Purpose**: Automated invoice preparation based on approved work quantities and BOQ unit rates.

**Key Features:**  
- **Automated Calculation**: Invoice amounts based on approved WIRs and BOQ unit rates  
- **Monthly/Period Billing**: Flexible billing periods with cumulative and period-specific amounts  
- **Multi-currency Support**: SAR primary currency with international formatting  
- **Tax Calculations**: VAT and other tax computations (configurable)  
- **Invoice Templates**: Professional invoice formats for client presentation  
- **Payment Tracking**: Invoice status, payment dates, outstanding amounts (future enhancement)

**Invoice Calculation Logic:**
```typescript
// Period Invoice Calculation
currentPeriodAmount = sum(approved WIRs in period × unit rates)
cumulativeAmount = sum(all approved WIRs to date × unit rates)
previousAmount = cumulativeAmount - currentPeriodAmount

// Invoice Line Items
lineItem = {
  boqCode: string,
  description: string,
  unit: string,
  unitRate: number,
  approvedQuantity: number,
  lineTotal: approvedQuantity × unitRate
}
```

**Invoice Data Structure:**
```typescript
InvoiceData {
  period: string;              // "2024-12" or "2024-12-15"
  previousAmount: number;      // Cumulative previous approvals
  currentAmount: number;       // Current period approvals
  totalBOQAmount: number;     // Total project BOQ value
  approvedWIRs: WIR[];        // Supporting WIR data
  lineItems: InvoiceLineItem[]; // Detailed breakdown
  taxAmount?: number;         // Calculated taxes
  totalInvoiceAmount: number; // Final invoice total
}
```

**Module Interactions:**  
- **Consumes from**: WIRs (approved work), BOQ Items (unit rates and descriptions), Progress Summary (period definitions)  
- **Produces to**: External accounting systems (export), Client communications (PDF invoices), Financial reports (billing analysis)

### 3.9 Attachments Module

**Purpose**: Centralized file management system for all project documents, photos, certificates, and drawings.

**Key Features:**  
- **Multi-format Support**: Images (JPG, PNG), Documents (PDF, DOC), CAD files (DWG), Spreadsheets (XLS)  
- **Drag-and-drop Upload**: Modern file upload interface with progress indicators  
- **File Organization**: Tagging, categorization, and search capabilities  
- **Version Control**: Multiple versions of documents with change tracking  
- **Access Control**: Role-based permissions for file viewing and editing  
- **Bulk Operations**: Multi-file upload, batch downloads, bulk tagging  
- **Integration Points**: Link files to WIRs, BOQ items, and other entities

**File Management Features:**  
- **Thumbnail Generation**: Automatic previews for images and documents  
- **Metadata Extraction**: File size, upload date, original filename preservation  
- **Search and Filter**: Full-text search within document content (future enhancement)  
- **Storage Optimization**: Automatic compression and format optimization  
- **Backup and Redundancy**: Multiple storage copies for data protection

**Data Structure:**
```typescript
Attachment {
  id: string;
  fileName: string;           // Original filename
  fileType: string;          // MIME type
  fileSize: number;          // File size in bytes
  storagePath: string;       // Supabase storage path
  uploadedBy: string;        // User ID who uploaded
  uploadedAt: string;        // Timestamp
  description?: string;      // Optional description
  tags?: string[];          // Searchable tags
  isActive: boolean;        // Soft delete flag
  linkedEntities?: {        // References to other modules
    wirId?: string;
    boqItemId?: string;
    reportId?: string;
  };
}
```

**Module Interactions:**  
- **Consumes from**: User uploads, External systems (imported files), Mobile apps (photos from field)  
- **Produces to**: WIRs (supporting documentation), Reports (embedded images/documents), Audit trail (file access logs)

### 3.10 Audit History Module

**Purpose**: Comprehensive activity logging and compliance tracking for all system operations.

**Key Features:**  
- **Complete Activity Log**: Every create, read, update, delete operation tracked  
- **User Activity Tracking**: Login/logout, role changes, permission escalations  
- **Data Change History**: Before/after values for all modifications  
- **System Event Logging**: API calls, errors, performance metrics  
- **Compliance Reporting**: Regulatory audit trails, data integrity verification  
- **Advanced Search**: Filter by user, date range, entity type, action type

**Audit Log Structure:**
```typescript
AuditLog {
  id: string;
  userId: string;            // User performing action
  username: string;          // Username for quick reference
  action: string;           // 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  resourceType: string;     // 'WIR', 'BOQ_ITEM', 'USER', etc.
  resourceId: string;       // ID of affected entity
  details: {               // JSON object with specifics
    oldValues?: any;       // Previous state
    newValues?: any;       // New state
    metadata?: any;        // Additional context
  };
  ipAddress?: string;      // User's IP address
  userAgent?: string;      // Browser/device information
  createdAt: string;      // Timestamp of action
}
```

**Audit Categories:**  
- **Authentication Events**: Login attempts, role switches, permission changes  
- **Data Modifications**: All CRUD operations on business entities  
- **System Administration**: User management, configuration changes  
- **File Operations**: Upload, download, delete of attachments  
- **Report Generation**: Report access, export operations  
- **Security Events**: Failed authentication, unauthorized access attempts

**Compliance Features:**  
- **Retention Policies**: Configurable log retention periods  
- **Data Integrity**: Cryptographic hashing to prevent log tampering  
- **Export Capabilities**: Audit logs can be exported for external compliance systems  
- **Real-time Monitoring**: Immediate alerts for suspicious activities

**Module Interactions:**  
- **Consumes from**: All modules (automated logging triggers)  
- **Produces to**: Compliance reports, Security monitoring systems, Admin dashboards

### 3.11 Users Module

**Purpose**: User management, authentication, and role-based access control administration.

**Key Features:**  
- **User Lifecycle Management**: Create, activate, deactivate, delete user accounts  
- **Role Assignment**: Multiple role support with fine-grained permissions  
- **Profile Management**: User personal information, contact details, preferences  
- **Authentication Configuration**: Password policies, session management  
- **Role Switching**: Users can switch between assigned roles without re-authentication  
- **Bulk User Operations**: Import users from CSV, bulk role assignments

**User Management Features:**  
- **Self-Service Profile**: Users can update their own profile information  
- **Password Management**: Secure password reset, complexity requirements  
- **Session Control**: Active session monitoring, forced logout capabilities  
- **Activity Monitoring**: Last login tracking, active session information  
- **Multi-language Preferences**: User-specific language settings

**Role System:**
```typescript
UserRole {
  id: string;
  userId: string;           // Reference to user profile
  role: 'admin' | 'editor' | 'viewer' | 'data_entry';
  assignedAt: string;      // When role was granted
  assignedBy: string;      // Who granted the role
  isActive: boolean;       // Role status
}

Profile {
  id: string;              // User identifier
  username: string;        // Login name
  fullName: string;        // Display name
  role: string;           // Primary role
  activeRole: string;     // Currently active role
  department?: string;    // Organizational unit
  createdAt: string;     // Account creation date
  updatedAt: string;     // Last profile modification
}
```

**Permission Matrix:**  
- **Admin**: Full system access, user management, system configuration  
- **Editor**: Data management, approvals, financial access, cannot manage users  
- **Viewer**: Read-only access to dashboards, reports, cannot modify data  
- **Data Entry**: WIR creation/editing, limited financial access, no approvals

**Module Interactions:**  
- **Consumes from**: Authentication system (login events), External HR systems (user import)  
- **Produces to**: All modules (user context), Audit History (user activity), Security monitoring (access patterns)

---

## 4. Integrations

### 4.1 External Services and APIs

**Supabase Integration:**  
- **Database API**: Auto-generated REST API from PostgreSQL schema  
- **Real-time API**: WebSocket connections for live data updates  
- **Authentication API**: User registration, login, session management  
- **Storage API**: File upload, download, and management  
- **Edge Functions**: Custom server-side logic for complex operations

**Third-party Libraries:**  
- **React Query (TanStack Query)**: API caching, synchronization, and state management  
- **React Hook Form**: Form validation and submission handling  
- **Recharts**: Data visualization and business intelligence charts  
- **React Router**: Client-side navigation and route protection  
- **Date-fns**: Date manipulation and formatting utilities

**Development Integrations:**  
- **Lovable Platform**: Development environment and deployment pipeline  
- **TypeScript Compiler**: Type checking and code optimization  
- **Vite Build System**: Fast development builds and hot module replacement  
- **ESLint**: Code quality and consistency enforcement

### 4.2 Data Flow and Synchronization Details

**Real-time Data Synchronization:**
```
1. User Action (Frontend) 
   ↓
2. API Call (Supabase Client)
   ↓
3. Database Update (PostgreSQL)
   ↓
4. Real-time Trigger (Supabase Realtime)
   ↓
5. WebSocket Broadcast (All Connected Clients)
   ↓
6. React Query Cache Update (Frontend State)
   ↓
7. UI Re-render (Automatic React Updates)
```

**Data Consistency Mechanisms:**  
- **Optimistic Updates**: UI updates immediately, rollback on server errors  
- **Cache Invalidation**: Smart cache updates based on data relationships  
- **Conflict Resolution**: Last-write-wins with audit trail preservation  
- **Transaction Support**: Database-level transactions for complex operations

**Synchronization Patterns:**  
- **Real-time Updates**: WIR status changes, approval notifications  
- **Batch Updates**: Bulk data imports, periodic calculations  
- **Event-driven Updates**: Cascading updates when BOQ items change  
- **Background Sync**: Progress calculations, financial summaries

### 4.3 Third-party Dependencies

**Production Dependencies:**
```json
{
  "@supabase/supabase-js": "^2.49.9",     // Backend integration
  "@tanstack/react-query": "^5.56.2",    // State management
  "@radix-ui/*": "Multiple packages",      // UI components foundation
  "react": "^18.3.1",                     // Core framework
  "react-dom": "^18.3.1",                 // DOM rendering
  "react-router-dom": "^6.26.2",          // Navigation
  "react-hook-form": "^7.53.0",           // Form management
  "recharts": "^2.12.7",                  // Data visualization
  "lucide-react": "^0.462.0",             // Icons
  "tailwindcss": "Latest",                // Styling framework
  "typescript": "Latest",                 // Type system
  "date-fns": "^3.6.0",                  // Date utilities
  "xlsx": "^0.18.5"                      // Excel import/export
}
```

**Development Dependencies:**  
- **Vite**: Build tool and development server  
- **ESLint**: Code linting and quality checks  
- **@types/***: TypeScript type definitions  
- **Tailwind CSS**: Utility-first CSS framework  
- **PostCSS**: CSS processing and optimization

**External Service Dependencies:**  
- **Supabase Cloud**: Database hosting and API services  
- **Lovable Platform**: Application hosting and deployment  
- **Google Fonts**: Typography (Inter, Playfair Display, Cairo, Amiri)  
- **CDN Services**: Fast content delivery for static assets

---

## 5. Data & Calculations

### 5.1 Data Models, Schemas, and Relationships

**Core Entity Relationships:**
```
Users (Authentication)
├── Profiles (1:1) - User information and roles
└── Audit Logs (1:Many) - Activity tracking

BOQ Items (Bill of Quantities)
├── Breakdown Items (1:Many) - Work decomposition
├── WIRs (1:Many) - Work execution
└── Child BOQ Items (1:Many) - Hierarchical structure

WIRs (Work Inspection Requests)
├── Attachments (Many:Many) - Supporting documents
├── BOQ Items (Many:1) - Related work item
├── Breakdown Items (Many:Many) - Selected components
└── Revision WIRs (1:Many) - Version control

Staff Management
├── Contractors (Independent) - External workforce
└── Engineers (Independent) - Technical reviewers
```

**Database Schema (PostgreSQL):**

```sql
-- Core authentication and user management
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'viewer',
  active_role app_role DEFAULT 'viewer',
  department TEXT,
  password TEXT, -- Hashed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID,
  is_active BOOLEAN DEFAULT TRUE
);

-- Project structure and costing
CREATE TABLE boq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT,
  quantity NUMERIC(15,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  unit_ar TEXT,
  unit_rate NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(15,2),
  parent_id UUID REFERENCES boq_items(id),
  level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work breakdown structure
CREATE TABLE breakdown_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT,
  keyword_ar TEXT,
  description TEXT,
  description_ar TEXT,
  percentage NUMERIC(6,4),
  value NUMERIC(15,2),
  boq_item_id UUID NOT NULL,
  parent_breakdown_id UUID,
  unit_rate NUMERIC(15,2),
  quantity NUMERIC(15,2),
  is_leaf BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work inspection and approval
CREATE TABLE wirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wir_number TEXT NOT NULL,
  boq_item_id UUID NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT,
  submittal_date DATE NOT NULL,
  received_date DATE,
  status wir_status DEFAULT 'submitted',
  result wir_result,
  status_conditions TEXT,
  calculated_amount NUMERIC(15,2),
  calculation_equation TEXT,
  contractor TEXT NOT NULL,
  engineer TEXT NOT NULL,
  length_of_line NUMERIC(10,2) NOT NULL,
  diameter_of_line NUMERIC(10,2) NOT NULL,
  line_no TEXT NOT NULL,
  region TEXT NOT NULL,
  manhole_from TEXT,
  manhole_to TEXT,
  zone TEXT,
  road TEXT,
  line TEXT,
  value NUMERIC(15,2) NOT NULL,
  parent_wir_id UUID,
  revision_number INTEGER DEFAULT 0,
  original_wir_id UUID,
  linked_boq_items UUID[] DEFAULT '{}',
  selected_breakdown_items UUID[] DEFAULT '{}',
  attachments UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File and document management
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff management
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit and compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  username TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Custom Types:**
```sql
CREATE TYPE app_role AS ENUM ('admin', 'editor', 'viewer', 'data_entry');
CREATE TYPE wir_status AS ENUM ('submitted', 'completed');
CREATE TYPE wir_result AS ENUM ('A', 'B', 'C');
```

### 5.2 Key Calculations, Formulas, and Business Rules

**BOQ Calculations:**
```typescript
// BOQ Item Total Amount
totalAmount = quantity × unitRate

// BOQ Hierarchy Total (Parent Items)
parentTotal = sum(childItem.totalAmount for all children)

// Project Total Value
projectValue = sum(leafBOQItem.totalAmount for all leaf items)
```

**Breakdown Calculations:**
```typescript
// Percentage-based Breakdown Value
breakdownValue = (percentage / 100) × boqItem.totalAmount

// Value-based Breakdown (Direct Assignment)
breakdownValue = directValue

// Breakdown Item Unit Rate (Inherited)
breakdownUnitRate = parentBOQItem.unitRate

// Breakdown Validation Rule
sum(breakdown.percentage for boqItemId) ≤ 100
```

**WIR Amount Calculations:**
```typescript
// Basic WIR Calculation
function calculateWIRAmount(wir: WIR, breakdownItems: BreakdownItem[], boqItems: BOQItem[]) {
  let totalAmount = 0;
  let equation = "";
  
  // Method 1: Selected Breakdown Items
  if (wir.selectedBreakdownItems?.length > 0) {
    for (const breakdownId of wir.selectedBreakdownItems) {
      const breakdown = findBreakdownById(breakdownId, breakdownItems);
      if (breakdown) {
        const itemAmount = calculateBreakdownAmount(breakdown, wir);
        totalAmount += itemAmount;
        equation += `${breakdown.keyword}(${itemAmount}) + `;
      }
    }
  }
  
  // Method 2: Fallback to BOQ Unit Rate
  if (totalAmount === 0) {
    const boqItem = findBOQById(wir.boqItemId, boqItems);
    if (boqItem) {
      totalAmount = wir.value || (wir.lengthOfLine * boqItem.unitRate);
      equation = `${wir.lengthOfLine}m × ${boqItem.unitRate} SAR/m`;
    }
  }
  
  // Apply WIR result factor
  const resultMultiplier = getResultMultiplier(wir.result);
  const finalAmount = totalAmount * resultMultiplier;
  
  return {
    amount: finalAmount,
    equation: equation.replace(/ \+ $/, '') + ` × ${resultMultiplier} (${wir.result})`
  };
}

// Result-based Amount Adjustment
function getResultMultiplier(result?: WIRResult): number {
  switch (result) {
    case 'A': return 1.0;    // Approved - Full amount
    case 'B': return 1.0;    // Conditional - Full amount (may have conditions)
    case 'C': return 0.0;    // Rejected - No amount
    default: return 0.0;     // No result - No amount
  }
}
```

**Progress Calculations:**
```typescript
// BOQ Item Progress
function calculateBOQProgress(boqItemId: string, wirs: WIR[], boqItems: BOQItem[]) {
  const boqItem = findBOQById(boqItemId, boqItems);
  const relatedWIRs = wirs.filter(w => w.boqItemId === boqItemId && w.result === 'A');
  
  const approvedQuantity = relatedWIRs.reduce((sum, wir) => {
    return sum + (wir.lengthOfLine || 0);
  }, 0);
  
  const completionPercentage = boqItem.quantity > 0 
    ? (approvedQuantity / boqItem.quantity) * 100 
    : 0;
  
  return {
    boqItemId,
    totalQuantity: boqItem.quantity,
    completedQuantity: approvedQuantity,
    completionPercentage: Math.min(completionPercentage, 100)
  };
}

// Project Overall Progress
function calculateProjectProgress(boqItems: BOQItem[], wirs: WIR[]) {
  const leafItems = boqItems.filter(item => !item.children?.length);
  let totalProjectValue = 0;
  let completedProjectValue = 0;
  
  leafItems.forEach(item => {
    const itemValue = item.quantity * item.unitRate;
    totalProjectValue += itemValue;
    
    const itemProgress = calculateBOQProgress(item.id, wirs, boqItems);
    completedProjectValue += (itemProgress.completionPercentage / 100) * itemValue;
  });
  
  return totalProjectValue > 0 
    ? (completedProjectValue / totalProjectValue) * 100 
    : 0;
}
```

**Financial Summary Calculations:**
```typescript
// Financial Summary Generation
function generateFinancialSummary(wirs: WIR[]) {
  const approvedWIRs = wirs.filter(w => w.result === 'A');
  const conditionalWIRs = wirs.filter(w => w.result === 'B');
  const rejectedWIRs = wirs.filter(w => w.result === 'C');
  
  const totalApprovedAmount = approvedWIRs.reduce((sum, wir) => {
    return sum + (wir.calculatedAmount || wir.value || 0);
  }, 0);
  
  const totalConditionalAmount = conditionalWIRs.reduce((sum, wir) => {
    return sum + (wir.calculatedAmount || wir.value || 0);
  }, 0);
  
  return {
    totalSubmittedWIRs: wirs.length,
    totalReceivedWIRs: wirs.filter(w => w.receivedDate).length,
    totalRevisionWIRs: wirs.filter(w => w.revisionNumber > 0).length,
    totalApprovedAmount,
    totalConditionalAmount,
    totalRejectedWIRs: rejectedWIRs.length,
    approvalRate: wirs.length > 0 ? (approvedWIRs.length / wirs.length) * 100 : 0
  };
}
```

**Invoice Calculations:**
```typescript
// Monthly Invoice Data
function calculateMonthlyInvoice(targetMonth: string, wirs: WIR[], boqItems: BOQItem[]) {
  const monthWIRs = wirs.filter(wir => {
    return wir.receivedDate?.startsWith(targetMonth) && 
           (wir.result === 'A' || wir.result === 'B');
  });
  
  const priorWIRs = wirs.filter(wir => {
    return wir.receivedDate && wir.receivedDate < targetMonth && 
           (wir.result === 'A' || wir.result === 'B');
  });
  
  const currentAmount = monthWIRs.reduce((sum, wir) => {
    return sum + calculateWIRAmount(wir, [], boqItems).amount;
  }, 0);
  
  const previousAmount = priorWIRs.reduce((sum, wir) => {
    return sum + calculateWIRAmount(wir, [], boqItems).amount;
  }, 0);
  
  const totalBOQAmount = boqItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitRate);
  }, 0);
  
  return {
    period: targetMonth,
    previousAmount,
    currentAmount,
    cumulativeAmount: previousAmount + currentAmount,
    totalBOQAmount,
    completionPercentage: totalBOQAmount > 0 
      ? ((previousAmount + currentAmount) / totalBOQAmount) * 100 
      : 0
  };
}
```

### 5.3 Example Data Flows and Transformations

**Complete WIR Workflow Example:**

**Step 1: Initial Data Setup**
```json
// BOQ Item
{
  "id": "boq-sw-001",
  "code": "SW.01.001",
  "description": "150mm Diameter Sewer Pipeline Installation",
  "quantity": 1000,
  "unit": "meter",
  "unitRate": 450.00,
  "totalAmount": 450000.00
}

// Breakdown Items (Auto-generated)
[
  {
    "id": "bd-excavation",
    "keyword": "EXCAVATION",
    "description": "Excavation and preparation",
    "percentage": 30.0,
    "boqItemId": "boq-sw-001",
    "value": 135000.00
  },
  {
    "id": "bd-pipe-laying",
    "keyword": "PIPE_LAYING", 
    "description": "Pipe installation and laying",
    "percentage": 50.0,
    "boqItemId": "boq-sw-001", 
    "value": 225000.00
  },
  {
    "id": "bd-backfill",
    "keyword": "BACKFILL",
    "description": "Backfilling and compaction", 
    "percentage": 20.0,
    "boqItemId": "boq-sw-001",
    "value": 90000.00
  }
]
```

**Step 2: WIR Creation and Submission**
```json
// WIR Creation
{
  "id": "wir-001",
  "wirNumber": "WIR-2024-001",
  "boqItemId": "boq-sw-001",
  "description": "Sewer line installation MH-001 to MH-002",
  "submittalDate": "2024-12-01",
  "status": "submitted",
  "contractor": "ABC Construction",
  "engineer": "John Smith",
  "lengthOfLine": 50.0,
  "diameterOfLine": 150,
  "lineNo": "L-001",
  "region": "Zone A",
  "manholeFrom": "MH-001",
  "manholeTo": "MH-002",
  "zone": "Industrial",
  "road": "Main Street",
  "line": "Primary",
  "value": 22500.00,
  "selectedBreakdownItems": ["bd-excavation", "bd-pipe-laying"],
  "attachments": ["photo-001", "cert-001"]
}
```

**Step 3: WIR Review and Approval**
```json
// After Engineer Review
{
  "id": "wir-001",
  "receivedDate": "2024-12-02",
  "status": "completed",
  "result": "A",
  "calculatedAmount": 20000.00,
  "calculationEquation": "EXCAVATION(6750) + PIPE_LAYING(11250) × 1.0 (A)",
  "wirNumber": "WIR-2024-001",
  "boqItemId": "boq-sw-001",
  "description": "Sewer line installation MH-001 to MH-002",
  "submittalDate": "2024-12-01",
  "contractor": "ABC Construction",
  "engineer": "John Smith",
  "lengthOfLine": 50.0,
  "diameterOfLine": 150,
  "lineNo": "L-001",
  "region": "Zone A",
  "manholeFrom": "MH-001",
  "manholeTo": "MH-002",
  "zone": "Industrial",
  "road": "Main Street",
  "line": "Primary",
  "value": 22500.00,
  "selectedBreakdownItems": ["bd-excavation", "bd-pipe-laying"],
  "attachments": ["photo-001", "cert-001"]
}

// Calculation Details:
// EXCAVATION: 50m × 450 SAR/m × 30% = 6,750 SAR
// PIPE_LAYING: 50m × 450 SAR/m × 50% = 11,250 SAR  
// Total: 18,000 SAR × 1.0 (Approved) = 18,000 SAR
```

**Step 4: Progress Update Calculation**
```json
// Updated Progress Data
{
  "boqItemId": "boq-sw-001",
  "totalQuantity": 1000,
  "completedQuantity": 50,
  "completionPercentage": 5.0,
  "approvedAmount": 20000.00,
  "remainingWork": 950,
  "projectedCompletion": "2025-06-15"
}
```

**Step 5: Monthly Invoice Generation**
```json
// December 2024 Invoice
{
  "period": "2024-12",
  "previousAmount": 0.00,
  "currentAmount": 20000.00,
  "cumulativeAmount": 20000.00,
  "totalBOQAmount": 450000.00,
  "completionPercentage": 4.44,
  "lineItems": [
    {
      "boqCode": "SW.01.001",
      "description": "150mm Diameter Sewer Pipeline Installation",
      "unit": "meter",
      "unitRate": 450.00,
      "approvedQuantity": 50.0,
      "lineTotal": 20000.00
    }
  ],
  "taxAmount": 3000.00,
  "totalInvoiceAmount": 23000.00
}
```

---

## Conclusion

The WIR Management System represents a comprehensive solution for construction project management, integrating financial tracking, progress monitoring, quality assurance, and compliance management into a unified platform. 

**Key Success Factors:**  
- **Real-time Data Integration**: All modules work with live, synchronized data  
- **Role-based Security**: Appropriate access controls for different user types  
- **Automated Calculations**: Reduces manual errors and speeds up processes  
- **Audit Compliance**: Complete traceability for regulatory requirements  
- **Mobile-Responsive Design**: Field-friendly interface for on-site operations  
- **Scalable Architecture**: Built to handle growing project complexity

**Future Enhancement Opportunities:**  
- **Mobile App**: Native iOS/Android apps for field data collection  
- **Advanced Analytics**: Machine learning for project outcome prediction  
- **Integration APIs**: Connect with external ERP and accounting systems  
- **Workflow Automation**: Automated approval routing based on business rules  
- **Document AI**: Automated extraction of data from construction documents

This system provides a solid foundation for digital transformation in construction project management, enabling better decision-making through real-time data visibility and automated business processes.
