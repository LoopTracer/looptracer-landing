# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing
No specific test scripts are configured. The project relies on Next.js built-in linting and TypeScript checking.

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.0.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Deployment**: Likely Vercel (Next.js standard)

### File Structure
```
app/
├── page.tsx           # Main landing page component
├── layout.tsx         # Root layout with metadata
├── globals.css        # Global styles
└── api/
    ├── lead/route.ts  # Lead form submission endpoint
    └── log/route.ts   # Analytics/logging endpoint
```

### Key Components

**Landing Page (`app/page.tsx`)**
- Single-page application with multiple sections
- UTM parameter tracking for marketing campaigns
- Case study modal system with image galleries
- FAQ section with collapsible content
- Contact form with WhatsApp integration
- Promotional modal for "LoopTracer" offering

**API Routes**
- `/api/lead` - Handles contact form submissions, forwards to Google Apps Script
- `/api/log` - Handles pageview and interaction tracking (fail-safe design)

### Design System

**Colors (Tailwind config)**
- `dark-bg`: #0E0E0E (main background)
- `text-primary`: #EDEDED (main text)  
- `text-secondary`: #BFBFBF (secondary text)
- Emerald accent colors for CTAs and highlights

**Typography**
- Inter font family
- Responsive text sizing with mobile-first approach

### State Management
Uses React's built-in useState for:
- Form data management
- Modal states (case studies, promotional modal)
- FAQ accordion states
- UTM parameter storage

### External Integrations

**WhatsApp**
- Environment variable: `NEXT_PUBLIC_WHATSAPP_PHONE`
- Custom prefill message: `NEXT_PUBLIC_WHATSAPP_PREFILL`
- UTM campaign data appended to messages

**Google Apps Script**
- `GAS_LEADS_ENDPOINT` - Lead form submissions
- `GAS_LOGS_ENDPOINT` - Analytics tracking (optional)
- Both endpoints expect JSON payloads

### Data Flow
1. UTM parameters captured on page load
2. User interactions logged via `/api/log`
3. Form submissions processed via `/api/lead`  
4. WhatsApp integration with campaign attribution
5. All external calls designed with fail-safe patterns

### Business Context
This is a landing page for "LoopTracer" - an AI automation service for businesses, specifically targeting management consulting ("gestorías"). The page showcases case studies, handles lead generation, and includes a promotional offering modal.