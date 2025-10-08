# StockSight Design Guidelines

## Design Approach
**System-Based Approach**: Modern financial dashboard utilizing Material Design principles with custom glassmorphic enhancements for a professional, data-focused experience.

## Core Design Elements

### A. Color Palette

**Primary Colors**:
- Blue gradient: `from-blue-500 to-purple-600`
- White background: Base color for main surfaces
- Glassmorphic overlays with blue tints

**Accent Colors**:
- Green: Positive trends/gains
- Red: Negative trends/losses
- Neutral gray: Neutral sentiment indicators

**Dark Mode**: Optional toggle support with inverted color scheme

### B. Typography
- **Primary Font**: Sans-serif system fonts via TailwindCSS defaults
- **Headings**: Bold weights (font-bold, font-semibold)
- **Body**: Regular weight (font-normal)
- **Data/Numbers**: Monospace for tabular data and stock prices

### C. Layout System
**Spacing**: TailwindCSS units of 2, 4, 8, 12, 16 for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section margins: my-8, my-12, my-16
- Card spacing: gap-4, gap-6

**Container widths**: max-w-7xl for main content, max-w-4xl for focused sections

### D. Component Library

**Navigation**:
- Sticky navbar with glassmorphic backdrop blur
- Logo with gradient text effect
- Active page highlighting with underline or background
- Mobile: Collapsible hamburger menu

**Cards**:
- Glassmorphic style with `shadow-lg shadow-blue-100`
- Rounded corners: `rounded-lg` or `rounded-xl`
- Hover effects: smooth scale transforms (`hover:scale-105 transition-transform`)
- Glowing edges for predicted data cards

**Charts**:
- Line charts for stock performance (Recharts)
- Tooltips on hover showing precise values
- Responsive sizing that adapts to container
- Color-coded lines for multiple stocks in comparison view
- Shaded confidence intervals for predictions
- Moving average overlays (MA10, MA50, MA200)

**Data Display**:
- Stock metrics in card grids
- Price displays with large, bold typography
- Percentage changes with color indicators (green/red)
- Market cap and volume in formatted, readable numbers
- "Last updated" timestamps on all data sections

**Forms & Inputs**:
- Search bars with icon prefix
- Dropdown selectors for time ranges
- Clear "Search" or "Predict Now" action buttons
- Input validation with error states

**Feedback Components**:
- Loading spinner: Animated with Tailwind keyframes
- Error alerts: Red background with retry button
- Success states: Subtle green indicators

### E. Page-Specific Layouts

**Home Page**:
- Hero section with title: "Empower your Investments with AI-driven Insights"
- Prominent search bar for stock symbols
- Dashboard grid showing current price, open, close, volume, market cap
- Animated line chart (7D or 30D performance)
- "Trend Insight" summary cards
- "Recently Viewed" stocks from localStorage

**Predict Page**:
- Split layout: Left for input/insights, right for chart
- Dual-line chart showing actual vs predicted prices
- Confidence interval shading
- Key metrics summary (growth %, volatility)
- AI insight text: "StockSight predicts AAPL may rise 2.8% next week"

**Historical Page**:
- Time range selector dropdown (1M, 6M, 1Y, 5Y)
- Full-width chart with tooltips
- Moving average toggle controls
- Download CSV button

**News Page**:
- Stock ticker input
- Masonry grid or vertical list layout
- News cards with:
  - Article title (bold)
  - Summary snippet
  - Source with link
  - Sentiment indicator (🔴/🟢/⚪)
- Hover animations on cards
- Source favicons for credibility

**Compare Page**:
- Two-column input section
- Dual-line overlay chart or side-by-side charts
- Summary cards showing:
  - 7-day % change comparison
  - 1-month trend comparison
  - Market cap difference

### F. Animations
- Smooth hover transitions: `transition-all duration-300`
- Scale effects on cards: `hover:scale-105`
- Chart entrance animations
- Loading spinner rotation
- Navbar scroll behavior (sticky positioning)

## Images
**Hero Section**: No large hero image required. The home page features an animated line chart as the primary visual element alongside the headline text.

**News Cards**: Include source favicons/logos for credibility (small icons, 16-24px)

**Stock Logos**: Optional ticker symbols with brand icons in search results

## Quality Standards
- All data fetched from backend APIs (no hardcoded values)
- Responsive breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Graceful error handling with user-friendly messages
- Loading states for all async operations
- Accessible color contrasts meeting WCAG standards
- Professional footer with data attribution and disclaimer