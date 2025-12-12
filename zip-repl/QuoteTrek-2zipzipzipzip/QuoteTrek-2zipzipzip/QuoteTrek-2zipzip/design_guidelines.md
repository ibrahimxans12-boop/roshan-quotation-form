# Design Guidelines: Roshan Tours & Travels Quotation Management System

## Design Approach

**System-Based Approach**: Drawing inspiration from modern productivity tools (Linear, Notion) and Material Design principles for data-intensive interfaces. This is a utility-focused business application prioritizing efficiency, clarity, and professional presentation over visual flair.

## Core Design Principles

1. **Information Hierarchy**: Clear visual separation between navigation, content areas, and action zones
2. **Data Clarity**: Clean tables and forms with excellent readability
3. **Task-Focused**: Minimize distractions, optimize for quotation creation workflow
4. **Professional Trust**: Design communicates reliability and business competence

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) - exceptional readability for UI and data
- Monospace: JetBrains Mono - for currency values and numerical data

**Hierarchy**:
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Card/Panel Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels: text-sm font-medium uppercase tracking-wide
- Helper Text: text-sm
- Table Data: text-sm
- Currency Values: font-mono text-base font-semibold

## Layout System

**Spacing Primitives**: Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section spacing: mb-8 or mb-12
- Form field gaps: gap-6
- Card spacing: space-y-4

**Grid Structure**:
- Dashboard: 3-column grid (lg:grid-cols-3) for stat cards
- Master Data Tables: Full-width single column with search/filter bar
- Quotation Builder: 2-column layout (lg:grid-cols-2) for form sections
- Quotation Preview: Single column max-w-4xl centered

## Component Library

### Navigation
- **Sidebar**: Fixed left sidebar (w-64) with logo at top, navigation links with icons (Heroicons)
- **Top Bar**: Sticky header with page title, breadcrumbs, and admin profile dropdown

### Data Tables
- Clean bordered tables with hover states
- Sortable columns with arrow indicators
- Action column (right-aligned) with icon buttons: Edit, Delete, Toggle Status
- Pagination at bottom-right
- Search bar and filter dropdowns above table
- Status badges: Pill-shaped with subtle styling

### Forms
- **Layout**: Consistent label-above-input pattern
- **Input Fields**: 
  - Standard height (h-11)
  - Border with focus ring
  - Placeholder text for guidance
- **Dropdowns**: Custom-styled selects with chevron icon
- **Multi-step Forms**: Progress indicator at top for quotation builder
- **Dynamic Sections**: Add/remove buttons for transport routes, add-ons
- **Calculation Display**: Read-only fields showing auto-calculated values in subtle panel

### Cards & Panels
- Subtle borders with rounded corners (rounded-lg)
- Header with title and optional action button
- Consistent padding (p-6)
- Used for: Dashboard stats, form sections, quotation preview

### Buttons & Actions
- **Primary**: Solid fill, medium size (px-6 py-2.5)
- **Secondary**: Border outline style
- **Danger**: For delete actions
- **Icon Buttons**: Small square buttons for table actions (w-8 h-8)
- **Button Groups**: For Save/Cancel, Edit/Delete pairs

### Dashboard Elements
- **Stat Cards**: Icon + Label + Large Number + Trend indicator
- **Recent Activity**: List with timestamps and status indicators
- **Quick Actions**: Large button tiles for common tasks (Create Quotation, Manage Hotels)

### Quotation Builder Specific
- **Traveler Input**: Grouped inputs for Adults/Children/Infants with +/- steppers
- **Hotel Selection**: Card-based selection with radio buttons, showing hotel name, meal plan dropdown, days input, auto-calculated cost
- **Transport Routes**: Checklist with vehicle type dropdown per route, capacity warning if exceeded
- **Pricing Summary Panel**: Sticky right sidebar showing live calculations (Mobile: bottom sheet)
- **Currency Toggle**: Tab-style switcher for SAR/INR/GBP views

### PDF Preview
- A4 paper simulation with margin (max-w-3xl mx-auto)
- Professional letterhead area at top
- Structured sections: Header, Traveler Details, Hotel Details, Transport Itinerary, Add-ons, Pricing Breakdown
- Table format for line items
- Signature area at bottom

## Icons

**Library**: Heroicons (via CDN)
- Use outline style for navigation and secondary actions
- Use solid style for primary buttons and active states
- Common icons: HomeIcon, UsersIcon, BuildingOfficeIcon, TruckIcon, DocumentTextIcon, CurrencyDollarIcon, CogIcon

## Accessibility

- All form inputs with associated labels (for + id)
- Focus indicators on all interactive elements
- Sufficient contrast ratios for text
- Screen reader labels for icon buttons (aria-label)
- Keyboard navigation support throughout

## Responsive Behavior

- **Desktop (lg+)**: Full sidebar navigation, multi-column layouts
- **Tablet (md)**: Collapsible sidebar, 2-column forms become stacked
- **Mobile**: Bottom navigation or hamburger menu, all forms single column, sticky action buttons at bottom

## Key User Flows

1. **Login → Dashboard**: Clean landing with key metrics and quick actions
2. **Master Data Management**: List view → Add/Edit modal or page → Success message
3. **Quotation Creation**: Multi-step form with live calculations → Preview → Generate PDF → Save
4. **Quotation Editing**: Load saved data → Modify → Recalculate → Update

## Animation Philosophy

Minimal and functional only:
- Smooth dropdown/modal transitions (150-200ms)
- Hover states on interactive elements
- No decorative animations
- Loading spinners for calculations and PDF generation

## Professional Business Aesthetic

This is a B2B travel management tool. Design should communicate:
- **Trustworthiness**: Clean, organized, no clutter
- **Efficiency**: Easy to scan, quick to complete tasks
- **Accuracy**: Clear display of calculations and currency values
- **Professionalism**: Polished but not flashy