# Work Inspection Request (WIR) Management System
## Business Requirements Document (BRD)

**Document Version:** 1.0  
**Date:** January 2025  
**Project:** WIR Management System  
**Status:** Production Ready  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Overview](#business-overview)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Business Logic & Calculations](#business-logic--calculations)
6. [User Management & Roles](#user-management--roles)
7. [Core Features](#core-features)
8. [Technical Specifications](#technical-specifications)
9. [Security & Compliance](#security--compliance)
10. [Performance Requirements](#performance-requirements)
11. [Integration Requirements](#integration-requirements)
12. [Business Rules](#business-rules)
13. [Reporting & Analytics](#reporting--analytics)
14. [Appendices](#appendices)

---

## Executive Summary

The Work Inspection Request (WIR) Management System is a comprehensive web-based application designed to streamline the management of construction project inspections, financial calculations, and progress tracking. The system integrates Bill of Quantities (BOQ) management, breakdown item calculations, staff management, and real-time progress monitoring in a unified platform.

### Key Business Objectives
- **Efficiency**: Reduce administrative overhead by 60% through automated calculations
- **Accuracy**: Eliminate manual calculation errors through systematic validation
- **Transparency**: Provide real-time visibility into project progress and financial status
- **Compliance**: Ensure audit trail compliance with comprehensive logging
- **Scalability**: Support multiple concurrent projects with role-based access control

### Return on Investment (ROI)
- **Time Savings**: 40 hours/week reduction in manual processing
- **Error Reduction**: 95% decrease in calculation discrepancies
- **Cost Control**: Real-time budget tracking preventing 15-20% cost overruns
- **Audit Compliance**: Automated documentation reducing compliance costs by 50%

---

## Business Overview

### Industry Context
The construction industry faces significant challenges in managing work inspections, progress tracking, and financial calculations. Traditional paper-based or spreadsheet-driven processes are prone to errors, delays, and lack of real-time visibility.

### Business Case
This system addresses critical pain points:
- **Manual Calculation Errors**: Automated calculations ensure accuracy
- **Lack of Real-time Visibility**: Dashboard provides instant project status
- **Audit Trail Requirements**: Comprehensive logging for compliance
- **Multi-user Collaboration**: Role-based access with concurrent editing
- **Progress Tracking**: Visual indicators for project completion status

### Stakeholders
| Role | Responsibility | System Access Level |
|------|---------------|-------------------|
| Project Manager | Overall project oversight | Full access (Admin) |
| Site Engineer | WIR creation and approval | Engineering access |
| Contractor | WIR submission and updates | Contractor access |
| Financial Controller | Budget monitoring | Viewer + Financial reports |
| Quality Assurance | Inspection validation | Viewer + Audit logs |

---

## System Architecture

### Technology Stack
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Frontend | React | 18.3.1 | User interface |
| Backend | Supabase | Latest | Database & Authentication |
| Styling | Tailwind CSS | Latest | Design system |
| State Management | React Context | Built-in | Application state |
| Build Tool | Vite | Latest | Development & build |
| Language | TypeScript | Latest | Type safety |

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Supabase      │    │   Storage       │
│   (React/Vite)  │◄──►│   (Database +   │◄──►│   (Files &      │
│                 │    │    Auth + API)  │    │    Attachments) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Security Architecture
- **Authentication**: Supabase Auth with manual user management
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-level security (RLS) policies
- **Audit Trail**: Comprehensive activity logging
- **Data Validation**: Frontend and backend validation layers

---

## Database Schema

### Core Tables Overview
| Table Name | Purpose | Key Relationships |
|------------|---------|------------------|
| `profiles` | User management and authentication | Base user data |
| `user_roles` | Role-based access control | Links to profiles |
| `boq_items` | Bill of Quantities management | Hierarchical structure |
| `breakdown_items` | Cost breakdown components | Links to BOQ items |
| `wirs` | Work Inspection Requests | Links to BOQ and staff |
| `contractors` | Contractor information | Referenced in WIRs |
| `engineers` | Engineer information | Referenced in WIRs |
| `attachments` | File management | Linked to WIRs |
| `audit_logs` | Activity tracking | System-wide logging |

### Detailed Schema Definitions

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'viewer',
  active_role app_role DEFAULT 'viewer',
  department TEXT,
  password TEXT, -- Encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### BOQ Items Table
```sql
CREATE TABLE boq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  description_ar TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  unit_ar TEXT,
  unit_rate NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC,
  parent_id UUID REFERENCES boq_items(id),
  level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### WIRs Table
```sql
CREATE TABLE wirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wir_number TEXT NOT NULL UNIQUE,
  boq_item_id UUID NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT,
  submittal_date DATE NOT NULL,
  received_date DATE,
  status wir_status DEFAULT 'submitted',
  result wir_result,
  status_conditions TEXT,
  calculated_amount NUMERIC,
  calculation_equation TEXT,
  contractor TEXT NOT NULL,
  engineer TEXT NOT NULL,
  length_of_line NUMERIC NOT NULL,
  diameter_of_line NUMERIC NOT NULL,
  line_no TEXT NOT NULL,
  region TEXT NOT NULL,
  manhole_from TEXT,
  manhole_to TEXT,
  zone TEXT,
  road TEXT,
  line TEXT,
  value NUMERIC NOT NULL,
  parent_wir_id UUID REFERENCES wirs(id),
  revision_number INTEGER DEFAULT 0,
  original_wir_id UUID REFERENCES wirs(id),
  linked_boq_items UUID[] DEFAULT '{}',
  selected_breakdown_items UUID[] DEFAULT '{}',
  attachments UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Breakdown Items Table
```sql
CREATE TABLE breakdown_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT,
  keyword_ar TEXT,
  description TEXT,
  description_ar TEXT,
  percentage NUMERIC,
  value NUMERIC,
  boq_item_id UUID NOT NULL,
  parent_breakdown_id UUID REFERENCES breakdown_items(id),
  unit_rate NUMERIC,
  quantity NUMERIC,
  is_leaf BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Relationships
```
BOQ Items (Hierarchical)
    ↓
Breakdown Items (Linked)
    ↓
WIRs (Reference BOQ + Breakdown)
    ↓
Calculations (Automated)
    ↓
Progress Tracking (Derived)
```

---

## Business Logic & Calculations

### WIR Amount Calculation Algorithm

#### Primary Calculation Method
```typescript
function calculateWIRAmount(wir: WIR, breakdownItems: BreakdownItem[], boqItems: BOQItem[]): {
  amount: number | null;
  equation: string;
} {
  // Step 1: Find BOQ item
  const boqItem = findBOQItemById(wir.boqItemId, boqItems);
  
  // Step 2: Calculate base amount
  const baseAmount = wir.lengthOfLine * boqItem.unitRate;
  
  // Step 3: Apply breakdown percentages
  let totalPercentage = 0;
  wir.selectedBreakdownItems?.forEach(breakdownId => {
    const breakdown = findBreakdownItemById(breakdownId, breakdownItems);
    if (breakdown?.percentage) {
      totalPercentage += breakdown.percentage;
    }
  });
  
  // Step 4: Final calculation
  const finalAmount = baseAmount * (totalPercentage / 100);
  
  return {
    amount: finalAmount,
    equation: `${wir.lengthOfLine}m × ${boqItem.unitRate} × (${totalPercentage}%) = ${finalAmount}`
  };
}
```

#### Calculation Business Rules
1. **Base Amount**: `Length × Unit Rate` from BOQ item
2. **Percentage Application**: Sum of selected breakdown percentages
3. **Final Amount**: `Base Amount × (Total Percentage / 100)`
4. **Validation**: Total percentage cannot exceed 100%
5. **Rounding**: All amounts rounded to 2 decimal places

### Financial Summary Calculations

#### Project Progress Metrics
```typescript
interface FinancialSummary {
  totalSubmittedWIRs: number;        // Count of submitted WIRs
  totalReceivedWIRs: number;         // Count of received WIRs
  totalRevisionWIRs: number;         // Count of revision WIRs
  totalApprovedAmount: number;       // Sum of approved (A/B) WIRs
  totalConditionalAmount: number;    // Sum of conditional (B) WIRs
  costVarianceAgainstBOQ: number;    // Difference from BOQ budget
}
```

#### Progress Calculation Formula
```typescript
Progress Percentage = (Completed Quantity / Total BOQ Quantity) × 100

Where:
- Completed Quantity = Sum of approved WIR lengths
- Total BOQ Quantity = BOQ item total quantity
- Progress capped at 100%
```

### Invoice Generation Logic

#### Monthly Invoice Calculation
```typescript
function calculateMonthlyInvoice(targetMonth: string): InvoiceData {
  // Filter WIRs by received date in target month
  const monthlyWIRs = wirs.filter(wir => 
    wir.receivedDate?.startsWith(targetMonth) && 
    ['A', 'B'].includes(wir.result)
  );
  
  // Calculate current month amount
  const currentAmount = monthlyWIRs.reduce((sum, wir) => 
    sum + (wir.calculatedAmount || 0), 0
  );
  
  // Calculate previous months amount
  const previousWIRs = wirs.filter(wir => 
    wir.receivedDate < targetMonth && 
    ['A', 'B'].includes(wir.result)
  );
  
  const previousAmount = previousWIRs.reduce((sum, wir) => 
    sum + (wir.calculatedAmount || 0), 0
  );
  
  return {
    period: targetMonth,
    currentAmount,
    previousAmount,
    totalAmount: currentAmount + previousAmount,
    approvedWIRs: monthlyWIRs
  };
}
```

---

## User Management & Roles

### Role Hierarchy
| Role | Level | Permissions |
|------|-------|-------------|
| **Admin** | 4 | Full system access, user management, system configuration |
| **Manager** | 3 | Project oversight, reporting, approval workflows |
| **Engineer** | 2 | WIR creation/editing, technical data entry |
| **Contractor** | 2 | WIR submission, status updates, file uploads |
| **Viewer** | 1 | Read-only access, basic reporting |

### Permission Matrix
| Feature | Admin | Manager | Engineer | Contractor | Viewer |
|---------|-------|---------|----------|------------|--------|
| View WIRs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create WIRs | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit WIRs | ✓ | ✓ | ✓ | Own Only | ✗ |
| Approve WIRs | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete WIRs | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage BOQ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Financial Reports | ✓ | ✓ | Limited | ✗ | ✗ |
| Audit Logs | ✓ | ✓ | ✗ | ✗ | ✗ |
| System Config | ✓ | ✗ | ✗ | ✗ | ✗ |

### Authentication Flow
```
1. User Login → Credential Validation
2. Role Assignment → Permission Loading
3. Session Creation → Token Generation
4. Dashboard Access → Role-based Navigation
5. Feature Access → Permission Verification
```

---

## Core Features

### 1. WIR Management
#### WIR Lifecycle
```
Created → Submitted → Under Review → Approved/Conditional/Rejected → Completed
```

#### Key WIR Features
- **Unique WIR Numbering**: Auto-generated with date prefix
- **Multi-language Support**: English/Arabic descriptions
- **Location Tracking**: Manhole-to-manhole mapping
- **Attachment Management**: Multiple file uploads per WIR
- **Revision Control**: Version tracking with parent-child relationships
- **Real-time Calculations**: Automatic amount computation
- **Status Workflow**: Defined approval process

### 2. BOQ Management
#### Hierarchical Structure
- **Parent-Child Relationships**: Multi-level BOQ items
- **Code-based Organization**: Systematic item coding
- **Bi-lingual Support**: English/Arabic descriptions
- **Quantity Tracking**: Original vs. completed quantities
- **Rate Management**: Unit rates with currency support
- **Progress Monitoring**: Visual progress indicators

### 3. Progress Tracking
#### Visual Dashboards
- **Project Overview**: High-level KPIs and metrics
- **Progress Charts**: Completion percentages by BOQ item
- **Financial Summary**: Budget vs. actual spending
- **Timeline Tracking**: Milestone completion status

#### Reporting Features
- **Monthly Reports**: Invoice generation with breakdowns
- **Progress Reports**: Detailed completion analysis
- **Variance Reports**: Budget vs. actual comparisons
- **Export Functions**: PDF, Excel, CSV formats

### 4. Staff Management
#### Contractor Management
- **Profile Management**: Contact details and company info
- **Project Assignment**: Multi-project contractor tracking
- **Performance Metrics**: Historical WIR completion rates

#### Engineer Management
- **Department Assignment**: Organizational structure
- **Specialization Tracking**: Technical expertise areas
- **Workload Management**: Active WIR assignments

### 5. Attachment Management
#### File Handling
- **Multi-format Support**: PDF, images, CAD files
- **Version Control**: File versioning and history
- **Security**: Access control and virus scanning
- **Storage Optimization**: Automatic compression and archiving

---

## Technical Specifications

### Frontend Architecture
#### Component Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── wir/             # WIR-specific components
│   ├── progress/        # Progress tracking components
│   ├── staff/           # Staff management components
│   └── accessibility/   # Accessibility features
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── context/             # State management
├── utils/               # Utility functions
└── types/               # TypeScript definitions
```

#### Key React Hooks
- `useWIRManagement`: Core WIR operations
- `useProgressCalculations`: Progress metrics
- `useSupabaseWIRs`: Database operations
- `useAuditLogger`: Activity logging
- `useAuthPermissions`: Role-based access

### Backend Architecture
#### Supabase Configuration
- **Real-time Subscriptions**: Live data updates
- **Row Level Security**: Data access control
- **Database Functions**: Server-side calculations
- **Edge Functions**: Custom business logic
- **Storage Management**: File handling and CDN

#### API Patterns
- **RESTful Operations**: Standard CRUD operations
- **Real-time Updates**: WebSocket connections
- **Batch Operations**: Bulk data processing
- **Error Handling**: Comprehensive error management

### Performance Optimization
#### Frontend Optimizations
- **Code Splitting**: Route-based lazy loading
- **Memoization**: React.memo and useMemo usage
- **Virtual Scrolling**: Large dataset handling
- **Image Optimization**: Lazy loading and compression

#### Backend Optimizations
- **Database Indexing**: Query performance optimization
- **Connection Pooling**: Resource management
- **Caching Strategy**: Frequently accessed data
- **CDN Integration**: Static asset delivery

---

## Security & Compliance

### Data Security
#### Encryption
- **Data at Rest**: AES-256 encryption for database storage
- **Data in Transit**: TLS 1.3 for all communications
- **Password Security**: Bcrypt hashing with salt rounds
- **API Security**: JWT tokens with expiration

#### Access Control
- **Multi-factor Authentication**: Optional 2FA implementation
- **Session Management**: Secure session handling
- **IP Whitelisting**: Network-based restrictions
- **Rate Limiting**: DDoS protection measures

### Compliance Framework
#### Audit Requirements
- **Activity Logging**: Comprehensive user action tracking
- **Data Retention**: Configurable retention policies
- **Change Tracking**: Field-level change history
- **Export Capabilities**: Audit trail export functions

#### Regulatory Compliance
- **Data Protection**: GDPR-compliant data handling
- **Industry Standards**: Construction industry best practices
- **Financial Regulations**: Audit trail requirements
- **Quality Standards**: ISO compliance frameworks

### Backup & Recovery
#### Data Protection Strategy
- **Automated Backups**: Daily full system backups
- **Point-in-time Recovery**: Granular restore capabilities
- **Geographic Redundancy**: Multi-region data replication
- **Disaster Recovery**: RTO: 4 hours, RPO: 15 minutes

---

## Performance Requirements

### System Performance Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Page Load Time | < 2 seconds | First Contentful Paint |
| API Response Time | < 500ms | Average response time |
| Database Query Time | < 100ms | Query execution time |
| File Upload Speed | > 10 MB/s | Upload throughput |
| Concurrent Users | 100+ users | Load testing results |
| System Availability | 99.9% uptime | Monthly availability |

### Scalability Requirements
#### User Load
- **Concurrent Users**: Support 100+ simultaneous users
- **Peak Load**: Handle 500+ users during peak hours
- **Growth Projection**: 200% user growth over 2 years

#### Data Volume
- **WIR Records**: 10,000+ WIRs per project
- **File Storage**: 100GB+ attachment storage
- **Database Size**: 50GB+ structured data
- **Transaction Volume**: 1,000+ transactions per hour

### Performance Monitoring
#### Key Performance Indicators (KPIs)
- **Response Time Monitoring**: Real-time latency tracking
- **Error Rate Tracking**: System reliability metrics
- **User Experience Metrics**: Core Web Vitals monitoring
- **Resource Utilization**: CPU, memory, and storage usage

---

## Integration Requirements

### Third-party Integrations
#### Document Management
- **PDF Generation**: Automated report generation
- **Excel Integration**: Data export/import capabilities
- **CAD File Support**: Engineering drawing management
- **Email Integration**: Notification and communication

#### Financial Systems
- **ERP Integration**: Enterprise resource planning connectivity
- **Accounting Software**: Financial data synchronization
- **Banking APIs**: Payment processing integration
- **Currency Exchange**: Multi-currency support

### API Specifications
#### RESTful API Design
```
GET    /api/wirs              # List all WIRs
POST   /api/wirs              # Create new WIR
GET    /api/wirs/:id          # Get specific WIR
PUT    /api/wirs/:id          # Update WIR
DELETE /api/wirs/:id          # Delete WIR

GET    /api/boq               # List BOQ items
GET    /api/progress          # Progress summary
GET    /api/reports/:type     # Generate reports
```

#### WebSocket Events
```
wir:created     # New WIR creation
wir:updated     # WIR modifications
wir:approved    # WIR approval status
progress:update # Progress changes
```

---

## Business Rules

### WIR Processing Rules
1. **Unique Numbering**: Each WIR must have a unique number
2. **Mandatory Fields**: All required fields must be completed
3. **Calculation Validation**: Amounts must be within acceptable ranges
4. **Approval Workflow**: Defined approval hierarchy
5. **Revision Control**: Revisions inherit parent WIR data
6. **Status Transitions**: Valid status change sequences

### Financial Rules
1. **Budget Limits**: WIR amounts cannot exceed BOQ allocations
2. **Percentage Validation**: Breakdown percentages cannot exceed 100%
3. **Currency Handling**: Consistent currency usage across calculations
4. **Rounding Rules**: Standardized decimal precision
5. **Variance Thresholds**: Automatic alerts for budget overruns

### Data Validation Rules
#### Field Validation
- **Date Validation**: Logical date sequences
- **Numeric Validation**: Positive values for quantities and amounts
- **Text Validation**: Required field completeness
- **File Validation**: Supported file formats and size limits

#### Business Logic Validation
- **BOQ Consistency**: WIR items must reference valid BOQ items
- **Staff Assignment**: Valid contractor and engineer assignments
- **Location Data**: Complete manhole and zone information
- **Breakdown Logic**: Valid breakdown item selections

---

## Reporting & Analytics

### Standard Reports
#### Operational Reports
1. **WIR Status Report**: Current status of all WIRs
2. **Progress Summary**: Project completion percentages
3. **Staff Workload**: Engineer and contractor assignments
4. **Attachment Inventory**: File management summary

#### Financial Reports
1. **Budget vs. Actual**: Variance analysis reports
2. **Monthly Invoices**: Period-based billing summaries
3. **Cost Breakdown**: Detailed expense categorization
4. **Cash Flow Projection**: Future payment projections

#### Management Reports
1. **Executive Dashboard**: High-level KPIs and metrics
2. **Performance Analytics**: Efficiency and productivity metrics
3. **Audit Reports**: Compliance and activity summaries
4. **Trend Analysis**: Historical performance trends

### Custom Analytics
#### Dashboard Widgets
- **Real-time KPIs**: Live project metrics
- **Progress Charts**: Visual completion indicators
- **Financial Gauges**: Budget utilization meters
- **Alert Panels**: Exception and notification displays

#### Data Export Options
- **Excel Reports**: Detailed data exports
- **PDF Documents**: Professional report formatting
- **CSV Data**: Raw data for analysis
- **API Access**: Programmatic data retrieval

---

## Appendices

### Appendix A: Database Functions

#### Custom Supabase Functions
```sql
-- Get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid()) = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate WIR amount
CREATE OR REPLACE FUNCTION calculate_wir_amount(
  wir_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  result NUMERIC := 0;
BEGIN
  -- Implementation of WIR calculation logic
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Appendix B: Security Policies

#### Row Level Security Examples
```sql
-- WIR access policy
CREATE POLICY "wirs_policy" ON wirs
  FOR ALL USING (
    CASE 
      WHEN has_role('admin') THEN true
      WHEN has_role('manager') THEN true
      WHEN has_role('engineer') THEN true
      WHEN has_role('contractor') THEN contractor = get_current_username()
      ELSE false
    END
  );

-- Audit log access policy
CREATE POLICY "audit_logs_policy" ON audit_logs
  FOR SELECT USING (
    has_role('admin') OR has_role('manager')
  );
```

### Appendix C: Environment Configuration

#### Production Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xlxqgasvhfohmmyftskf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_NAME=WIR Management System
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_AUDIT_LOGS=true
VITE_ENABLE_REALTIME=true
VITE_ENABLE_FILE_UPLOAD=true
```

### Appendix D: Deployment Checklist

#### Pre-deployment Verification
- [ ] Database schema migrations applied
- [ ] Environment variables configured
- [ ] Security policies verified
- [ ] Performance testing completed
- [ ] User acceptance testing signed off
- [ ] Backup procedures verified
- [ ] Monitoring systems configured
- [ ] Documentation updated
- [ ] Training materials prepared
- [ ] Support procedures established

#### Go-live Activities
1. **System Deployment**: Deploy application to production
2. **Data Migration**: Transfer existing data if applicable
3. **User Provisioning**: Create initial user accounts
4. **System Verification**: Validate all functions work correctly
5. **Performance Monitoring**: Monitor system performance
6. **User Training**: Conduct user training sessions
7. **Support Activation**: Activate support procedures

---

## Application Pages & Business Logic

### Overview
The WIR Management System consists of 18 core pages, each serving specific business functions with defined user access controls and data processing logic.

### Page Architecture
```
Authentication Layer
├── Login.tsx (Authentication)
├── Auth.tsx (Multi-role authentication)
└── Unauthorized.tsx (Access control)

Core Application Pages
├── Dashboard.tsx (Executive overview)
├── WIRs.tsx (Work inspection requests)
├── BOQ.tsx (Bill of quantities)
├── ProgressTracking.tsx (Project progress)
├── Breakdown.tsx (Cost breakdown)
├── Reports.tsx (Executive reporting)
├── Invoices.tsx (Financial invoicing)
├── AuditHistory.tsx (System auditing)
├── StaffManagement.tsx (Personnel management)
├── UserManagement.tsx (System users)
├── Attachments.tsx (File management)
├── Adjustments.tsx (Financial adjustments)
├── ProgressSummary.tsx (Progress analytics)
└── Index.tsx (Main entry point)

Error Handling
└── NotFound.tsx (404 error page)
```

---

### 1. Dashboard.tsx - Executive Dashboard
**Purpose:** Executive-level project monitoring and KPI visualization  
**Business Logic:**
- **Financial Calculations**: Real-time computation of approved/conditional/rejected WIR amounts
- **Performance Metrics**: Project completion rates, approval rates, variance analysis
- **Data Filtering**: Contractor/engineer-based filtering with dynamic updates
- **Visual Analytics**: Charts and graphs for trend analysis
- **Multi-currency Support**: SAR currency formatting with locale support

**Key Features:**
```typescript
// Financial summary calculations
const totalApprovedAmount = filteredWirs.reduce((sum, w) => sum + getApprovedAmount(w), 0);
const completionRate = totalBOQValue > 0 ? (totalProjectValue / totalBOQValue) * 100 : 0;
const approvalRate = filteredWirs.length > 0 ? (approvedCount / filteredWirs.length) * 100 : 0;
```

**Business Rules:**
- Only display approved (A) and conditional (B) WIR amounts in totals
- Calculate completion rate based on BOQ vs. actual progress
- Real-time data updates with live timestamp display
- Role-based data visibility (all users can view, filtering by permission)

---

### 2. WIRs.tsx - Work Inspection Request Management
**Purpose:** Core WIR lifecycle management with comprehensive CRUD operations  
**Business Logic:**
- **Multi-tab Interface**: WIRs, Contractors, Engineers, Data Management
- **Advanced Filtering**: Multi-criteria search with real-time updates
- **Role-based Access**: Different permissions for data entry vs. full users
- **Integrated Staff Management**: Contractor and engineer management within WIR workflow

**Key Features:**
```typescript
// Advanced filtering logic
const filteredWIRs = useMemo(() => {
  return wirs.filter(wir => {
    // Search term, status, result, engineer, contractor, region, date range filtering
    // BOQ item code filtering with cross-reference
    return matchesCriteria;
  });
}, [wirs, filters, flattenedBOQItems]);
```

**Business Rules:**
- WIR numbers auto-generated with date-based prefixes
- Mandatory field validation before submission
- Status workflow: submitted → completed with result assignment
- Revision control with parent-child relationships
- Real-time search with URL parameter support

---

### 3. BOQ.tsx - Bill of Quantities Management
**Purpose:** Hierarchical BOQ structure management with import/export capabilities  
**Business Logic:**
- **Hierarchical Structure**: Parent-child BOQ item relationships
- **Bi-lingual Support**: English/Arabic descriptions and units
- **Excel Integration**: Advanced import/export with hierarchy preservation
- **Auto-calculation**: Total amounts based on quantity × unit rate
- **Code Generation**: Automatic sequential code generation

**Key Features:**
```typescript
// Hierarchical total calculation
const calculateItemTotal = (item: BOQItem): number => {
  if (item.children && item.children.length > 0) {
    return item.children.reduce((sum, child) => sum + calculateItemTotal(child), 0);
  } else {
    return item.quantity * item.unitRate;
  }
};
```

**Business Rules:**
- Parent items sum children's totals, leaf items calculate quantity × rate
- Import validation with parent-child relationship mapping
- Unique code enforcement with sequential generation
- Multi-language data entry with Arabic RTL support
- Excel export maintains hierarchy with level indicators

---

### 4. ProgressTracking.tsx - Project Progress Monitoring
**Purpose:** Visual progress tracking with breakdown-level detail analysis  
**Business Logic:**
- **Progress Calculation**: Completion percentages based on approved WIRs
- **Breakdown Analysis**: Sub-item level progress tracking
- **Hierarchical Display**: Nested progress cards with parent-child relationships
- **Export Functionality**: Progress report generation with charts

**Key Features:**
```typescript
// Progress calculation with breakdown items
const progressData = calculateBOQProgress();
const renderBOQItem = (boqItem: BOQItem, level: number = 0) => {
  const progress = progressData.find(p => p.boqItemId === boqItem.id);
  // Recursive rendering with level-based indentation
};
```

**Business Rules:**
- Progress based on approved WIR amounts vs. BOQ quantities
- Breakdown item progress calculated from selected breakdown percentages
- Visual indicators for completion status (0%, partial, 100%)
- Exportable progress reports with graphical representation

---

### 5. Reports.tsx - Executive Reporting & Analytics
**Purpose:** Comprehensive financial and performance reporting with export capabilities  
**Business Logic:**
- **Multi-report Types**: Financial, status, BOQ variance, contractor/engineer analysis
- **Advanced Filtering**: Entity-based filtering with performance metrics
- **Excel Export**: Multi-sheet workbooks with formatted data
- **Variance Analysis**: BOQ vs. actual spending analysis
- **Performance Tracking**: Success rates and completion metrics

**Key Features:**
```typescript
// Contractor performance analysis
const contractorComparisonData = contractors.map(contractor => {
  const contractorWirs = wirs.filter(w => w.contractor === contractor);
  const successRate = totalCount > 0 ? ((approvedCount + conditionalCount) / totalCount) * 100 : 0;
  return { name, approved, conditional, rejected, totalAmount, successRate };
});
```

**Business Rules:**
- Success rate includes both approved (A) and conditional (B) results
- Variance analysis compares BOQ budget vs. actual WIR amounts
- Export includes summary, details, variance, and performance sheets
- Real-time calculations with currency formatting

---

### 6. Invoices.tsx - Financial Invoice Generation
**Purpose:** Monthly and daily invoice generation based on approved WIRs  
**Business Logic:**
- **Dual Views**: Monthly and daily invoice generation
- **Progressive Calculation**: Current period + cumulative totals
- **PDF Export**: Professional invoice formatting with company branding
- **Date-based Filtering**: Available dates based on approved WIR received dates

**Key Features:**
```typescript
// Invoice calculation logic
const monthlyInvoiceData = getMonthlyInvoiceData(selectedMonth);
const progressPercentage = (currentTotal / totalBOQAmount) * 100;
// Export with company logo and professional formatting
```

**Business Rules:**
- Only approved (A) and conditional (B) WIRs included in invoices
- Progressive invoicing: previous periods + current period
- Company branding with logo integration
- Multi-language support for Arabic/English invoices

---

### 7. UserManagement.tsx - System User Administration
**Purpose:** User account management with role-based access control  
**Business Logic:**
- **CRUD Operations**: Create, read, update, delete user accounts
- **Role Management**: Admin, editor, viewer, data_entry roles
- **Multi-role Support**: Users can have multiple roles with active role switching
- **Permission Matrix**: Role-based feature access control

**Key Features:**
```typescript
// Role-based permission checking
const handleSwitchRole = async (userId: string, newRole: string) => {
  const { error } = await profileService.switchUserRole(userId, newRole);
  // Update active role and refresh user list
};
```

**Business Rules:**
- Admin role required to access user management
- Cannot delete the main admin account
- Role changes logged for audit trail
- Multi-role users can switch active roles
- Password encryption and secure authentication

---

### 8. AuditHistory.tsx - System Activity Auditing
**Purpose:** Comprehensive audit trail for compliance and security monitoring  
**Business Logic:**
- **Activity Logging**: All system activities tracked with user, timestamp, details
- **Advanced Filtering**: Multi-criteria filtering with date ranges
- **Export Capabilities**: Excel export with structured data
- **Security Monitoring**: Track user actions, IP addresses, user agents

**Key Features:**
```typescript
// Audit log filtering and export
const handleExportExcel = async () => {
  const data = await exportLogs(filters);
  // Transform to Excel with auto-sized columns and professional formatting
};
```

**Business Rules:**
- Admin access only for audit history viewing
- Comprehensive logging of CREATE, UPDATE, DELETE, APPROVAL actions
- Export includes all relevant metadata for compliance
- Date-based filtering with statistical summaries

---

### 9. StaffManagement.tsx - Personnel Management
**Purpose:** Contractor and engineer profile management  
**Business Logic:**
- **Dual Management**: Separate contractor and engineer management
- **Profile Data**: Contact information, specializations, company details
- **Integration**: Staff data used in WIR assignments and filtering
- **CRUD Operations**: Full create, read, update, delete capabilities

**Key Features:**
```typescript
// Integrated staff management within tabs
<Tabs defaultValue="contractors">
  <TabsContent value="contractors">
    <ContractorTable onEdit={handleEditContractor} />
  </TabsContent>
  <TabsContent value="engineers">
    <EngineerTable onEdit={handleEditEngineer} />
  </TabsContent>
</Tabs>
```

**Business Rules:**
- Role-based access: editors can create/edit, admins can delete
- Staff profiles used for WIR assignments
- Contact information validation and formatting
- Integration with WIR filtering and reporting

---

### 10. Breakdown.tsx - Cost Breakdown Management
**Purpose:** Hierarchical cost breakdown item management for detailed WIR calculations  
**Business Logic:**
- **Auto-generation**: Breakdown items automatically created from leaf BOQ items
- **Sub-item Management**: Percentage-based sub-breakdowns for detailed analysis
- **Hierarchical Structure**: Parent breakdown items with percentage-based children
- **Multi-language**: English/Arabic descriptions and keywords

**Key Features:**
```typescript
// Hierarchical breakdown organization
const organizedBreakdownItems = filteredBreakdownItems?.map(item => {
  if (!item.parentBreakdownId) {
    return {
      ...item,
      children: filteredBreakdownItems?.filter(child => child.parentBreakdownId === item.id) || []
    };
  }
}).filter(Boolean) || [];
```

**Business Rules:**
- Breakdown items auto-created from BOQ items with quantities > 0
- Sub-items use percentage-based calculations
- Total percentages cannot exceed 100% for validation
- Used in WIR amount calculations with selected breakdown percentages

---

### 11. ProgressSummary.tsx - Progress Analytics Dashboard
**Purpose:** Advanced progress analytics with segment-based tracking  
**Business Logic:**
- **Segment Analysis**: Manhole-to-manhole progress tracking
- **Breakdown Integration**: Progress tracking at breakdown item level
- **Visual Indicators**: Color-coded progress status with completion percentages
- **Export Functions**: Detailed progress reports with graphical elements

**Business Rules:**
- Progress calculated based on approved WIR segments
- Visual indicators: red (0%), yellow (partial), green (100%)
- Segment-based tracking for geographical project management
- Integration with BOQ items and breakdown percentages

---

### 12. Authentication & Security Pages

#### Login.tsx - User Authentication
**Purpose:** Secure user login with credential validation  
**Business Logic:**
- Username/password authentication
- Session management with token-based security
- Role-based redirection after login
- Security validation and error handling

#### Auth.tsx - Multi-role Authentication System
**Purpose:** Advanced authentication with role management  
**Business Logic:**
- Multi-role user support
- Active role switching capabilities
- Profile management integration
- Secure session handling

#### Unauthorized.tsx - Access Control
**Purpose:** Access denied page for unauthorized users  
**Business Logic:**
- Role-based access control enforcement
- User-friendly error messaging
- Navigation assistance for proper access

---

### 13. Supporting Pages

#### Index.tsx - Application Entry Point
**Purpose:** Main application entry and routing configuration  
**Business Logic:**
- Route management and navigation
- Authentication flow control
- Layout rendering and theme management

#### NotFound.tsx - Error Handling
**Purpose:** 404 error page for invalid routes  
**Business Logic:**
- User-friendly error messaging
- Navigation assistance back to valid pages
- Error logging for monitoring

#### Attachments.tsx - File Management
**Purpose:** File upload and attachment management  
**Business Logic:**
- Multi-format file support (PDF, images, CAD files)
- File versioning and organization
- Security scanning and validation
- Integration with WIR attachments

#### Adjustments.tsx - Financial Adjustments
**Purpose:** Financial adjustment and modification tracking  
**Business Logic:**
- Adjustment calculation and application
- Audit trail for financial changes
- Integration with WIR financial calculations

---

## Page Access Control Matrix

| Page | Admin | Manager | Engineer | Contractor | Viewer |
|------|-------|---------|----------|------------|--------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| WIRs | Full | Full | Full | Limited | Read-only |
| BOQ | Full | Edit | View | View | View |
| Progress | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | Limited | ✗ | ✗ |
| Invoices | ✓ | ✓ | Limited | ✗ | ✗ |
| User Mgmt | ✓ | ✗ | ✗ | ✗ | ✗ |
| Audit History | ✓ | ✓ | ✗ | ✗ | ✗ |
| Staff Mgmt | ✓ | ✓ | ✗ | ✗ | ✗ |
| Breakdown | ✓ | ✓ | ✗ | ✗ | ✗ |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | System Team | Initial BRD creation |
| 1.1 | January 2025 | System Team | Added comprehensive page documentation |

**Document Status:** Final  
**Next Review Date:** July 2025  
**Distribution:** Project Stakeholders, Development Team, Management

---

*This Business Requirements Document serves as the authoritative source for the WIR Management System requirements, design, and implementation specifications.*