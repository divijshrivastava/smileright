# 🦷 Smile Right — Admin Dashboard UX Audit Report

> **Date:** 19 February 2026
> **Auditor:** UX Engineering Review
> **Scope:** All pages, components, and styles under `/admin`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Inconsistencies Identified](#3-inconsistencies-identified)
4. [Recommended Design Token System](#4-recommended-design-token-system)
5. [Color Scheme Recommendation](#5-color-scheme-recommendation)
6. [Typography Standardization](#6-typography-standardization)
7. [Button & Interactive Element Standardization](#7-button--interactive-element-standardization)
8. [Card & Surface Standardization](#8-card--surface-standardization)
9. [Form Element Standardization](#9-form-element-standardization)
10. [Badge & Status Indicator Standardization](#10-badge--status-indicator-standardization)
11. [Spacing & Layout Recommendations](#11-spacing--layout-recommendations)
12. [Loading & Empty State Patterns](#12-loading--empty-state-patterns)
13. [Accessibility Improvements](#13-accessibility-improvements)
14. [Library Recommendations](#14-library-recommendations)
15. [Priority Roadmap](#15-priority-roadmap)

---

## 1. Executive Summary

The admin dashboard is functional and already has a strong foundation — a collapsible sidebar, mobile-responsive layout, glassmorphic surface cards, and a subtle gradient background. However, a deep audit reveals **significant per-component style drift** that undermines the premium feel. The root cause: styling is done via inline `React.CSSProperties` objects independently in each file, with no shared design tokens.

### Key Findings

| Area | Severity | Description |
|---|---|---|
| **Button styles** | 🔴 Critical | 7+ different button style variants across components — different radii, padding, colors, sizes |
| **Border radius** | 🟠 High | Ranges from `4px` to `16px` across the same UI layer |
| **Color usage** | 🟠 High | Hard-coded hex values everywhere; different shades of the same semantic meaning |
| **Card styles** | 🟡 Medium | Inconsistent shadow, border, padding across list, form, and dashboard cards |
| **Badge styles** | 🟡 Medium | Publish/Draft badges are re-declared in 5+ files with slight variations |
| **Spacing** | 🟡 Medium | No consistent spacing scale; values drift between `8px`, `10px`, `12px`, `14px`, `16px` |
| **Typography scales** | 🟡 Medium | Font sizes vary for the same purpose (labels, captions, headings) |
| **Empty/loading states** | 🟢 Low | Different patterns per page; could be unified |

---

## 2. Current State Analysis

### Architecture
- **Framework:** Next.js App Router
- **Styling approach:** Inline `React.CSSProperties` objects per component + global CSS classes in `globals.css`
- **Icons:** Lucide React
- **Fonts:** 
  - Headings: `var(--font-serif)` → `Merriweather`
  - Body: `var(--font-sans)` → `Open Sans`

### Global Admin Theme (from `globals.css`)
The global CSS already defines some reusable admin classes:
- `.admin-primary-btn` — gradient blue button
- `.admin-secondary-btn` — light gray button
- `.admin-input` — styled inputs with focus ring
- `.admin-form-card` / `.admin-surface-card` — glassmorphic cards
- `.admin-page-header`, `.admin-page-title`, `.admin-page-subtitle`
- `.admin-nav-link` with `.is-active` state

**Problem:** These classes exist but are **inconsistently applied**. Most components define their own inline styles that duplicate or conflict with the global theme.

---

## 3. Inconsistencies Identified

### 3.1 Border Radius

| File | Element | Value |
|---|---|---|
| `page.tsx` (Dashboard) | `statCard`, `actionCard`, `recentColumn` | `12px` |
| `page.tsx` (Dashboard) | `analyticsStatCard`, `analyticsTableCard` | `10px` |
| `page.tsx` (Dashboard) | `viewAllLink` | `6px` |
| `TestimonialList.tsx` | `table` | `8px` |
| `TestimonialList.tsx` | `mobileCard` | `12px` |
| `ServiceList.tsx` | `card` | `8px` |
| `ApprovalList.tsx` | `card` | `12px` |
| `UserList.tsx` | `inviteCard`, `table` | `8px` |
| `error.tsx` | `card` | `8px` |
| `login/page.tsx` | `card` | `8px` |
| All forms | `input`, `submitBtn` | `4px` ← *most outdated* |
| `globals.css` | `.admin-form-card` | `16px` |
| `globals.css` | `.admin-primary-btn` | `10px` |
| `globals.css` | `.admin-input` | `10px` |
| `analytics/page.tsx` | `statCard`, `card` | `1rem (16px)` |

> **Verdict:** Border radii range from **4px to 16px** with no consistency. The globals.css defines `10px–16px` but inline styles ignore this.

---

### 3.2 Button Styles — Side-by-Side Comparison

| Component | Button Type | Padding | Radius | Background | Font Size |
|---|---|---|---|---|---|
| `TestimonialList` | `actionBtn` | `6px 12px` | `4px` | `#f5f5f5` | `0.8rem` |
| `TestimonialList` | `editLink` | `6px 12px` | `4px` | `#1B73BA` | `0.8rem` |
| `TestimonialList` | `deleteBtn` | `6px 12px` | `4px` | `#fff / border #c00` | `0.8rem` |
| `TestimonialList` | `mobileActionBtn` | `12px 16px` | `8px` | `#f5f5f5` | `0.9rem` |
| `ServiceList` | `editBtn` | `8px 16px` | `4px` | `#1B73BA` | `0.9rem` |
| `ServiceList` | `toggleBtn` | `8px 16px` | `4px` | `#28a745` | `0.9rem` |
| `ServiceList` | `deleteBtn` | `8px 16px` | `4px` | `#dc3545` | `0.9rem` |
| `ApprovalList` | `approveBtn` | `8px 20px` | `6px` | `#28a745` | `0.85rem` |
| `ApprovalList` | `rejectBtn` | `8px 20px` | `6px` | `#dc3545` | `0.85rem` |
| `ApprovalList` | `cancelBtn` | `6px 14px` | `4px` | `#f5f5f5` | `0.8rem` |
| `UserList` | `inviteButton` | `10px 16px` | `6px` | `#1B73BA` | `0.9rem` |
| All forms | `submitBtn` | `12px 24px` | `4px` | `#1B73BA` | `0.95rem` |
| All forms | `cancelBtn` | `12px 24px` | `4px` | `#f5f5f5` | `0.95rem` |
| `login/page.tsx` | `button` | `14px` (all) | `4px` | `#1B73BA` | `1rem` |
| `error.tsx` | `retryBtn` | `12px 24px` | `4px` | `#1B73BA` | `0.95rem` |
| `LogoutButton` | logout | `8px 16px` | `4px` | `transparent` | `0.85rem` |
| `globals.css` | `.admin-primary-btn` | *inherited* | `10px` | gradient | *inherited* |

> **Verdict:** 7+ button size & shape variants exist for the same semantic purpose. The globals prescribe `10px` radius and gradients, but almost no component uses them exclusively.

---

### 3.3 Color Values — Semantic Inconsistencies

| Semantic Meaning | Values Used |
|---|---|
| **Primary brand blue** | `#1B73BA`, `#1561a0`, `#155a93`, `#144d7e`, `#1f86d8`, `#3b82f6`, `#1976d2` |
| **Success / Published** | `#28a745`, `#1e7e34`, `#155724`, `#059669`, `#10b981` |
| **Error / Delete** | `#c00`, `#dc3545`, `#721c24`, `#9b2c2c`, `#dc2626`, `#b91c1c` |
| **Warning / Draft** | `#bf6c00`, `#ffc107`, `#856404` |
| **Text primary** | `#292828`, `#0f172a`, `#102a43`, `#1e293b` |
| **Text secondary** | `#666`, `#666666`, `#64748b`, `#62718a` |
| **Text tertiary** | `#999`, `#7a7a7a`, `#94a3b8`, `#777` |
| **Border** | `#ddd`, `#e0e0e0`, `#d5d7db`, `#d2dce8`, `#dee2e6`, `#f0f0f0`, `#eee` |
| **Background surface** | `#fff`, `#f5f5f5`, `#f8f9fa`, `#f9f9f9`, `#fcfdff`, `#f8fafc` |
| **Published badge bg** | `#e6f4ea`, `#d4edda` |
| **Draft badge bg** | `#fef3e0`, `#f8d7da` |
| **Draft badge text** | `#bf6c00`, `#721c24` |

> **Verdict:** Massive color drift. The same semantic concept uses 3-7 different hex values depending on which component you're looking at. The analytics page uses Tailwind-style Slate colors (`#0f172a`, `#64748b`) while the rest of the admin uses a different palette.

---

### 3.4 Box Shadows

| Component | Shadow Value |
|---|---|
| Dashboard cards | `0 2px 8px rgba(0,0,0,0.08)` |
| Analytics cards | `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)` |
| Mobile cards | `0 2px 12px rgba(0,0,0,0.1)` |
| TrustImage cards | `0 1px 3px rgba(0,0,0,0.1)` |
| Login card | `0 4px 16px rgba(0,0,0,0.12)` |
| Error card | `0 4px 16px rgba(0,0,0,0.08)` |
| `globals.css` `.admin-surface-card` | `0 8px 24px rgba(15,47,84,0.08)` |
| Page header | `0 10px 28px rgba(15,47,84,0.08)` |

> **Verdict:** 6+ shadow definitions. The globals define a tinted shadow (`rgba(15,47,84,...)`) while inline styles use neutral black.

---

## 4. Recommended Design Token System

Create a centralized token file. This can be either CSS custom properties (recommended for zero-JS overhead) or a TypeScript constants file.

### CSS Custom Properties Approach (Recommended)

```css
/* ==========================================
   ADMIN DESIGN TOKENS
   ========================================== */
:root {
  /* —— Colors: Brand —— */
  --admin-blue-50:  #ebf5ff;
  --admin-blue-100: #d4e8fa;
  --admin-blue-200: #a8d1f5;
  --admin-blue-500: #1B73BA;
  --admin-blue-600: #155a93;
  --admin-blue-700: #104570;

  /* —— Colors: Semantic —— */
  --admin-success-50:  #ecfdf5;
  --admin-success-100: #d1fae5;
  --admin-success-500: #10b981;
  --admin-success-700: #047857;

  --admin-warning-50:  #fffbeb;
  --admin-warning-100: #fef3c7;
  --admin-warning-500: #f59e0b;
  --admin-warning-700: #b45309;

  --admin-danger-50:  #fef2f2;
  --admin-danger-100: #fee2e2;
  --admin-danger-500: #ef4444;
  --admin-danger-700: #b91c1c;

  /* —— Colors: Neutral —— */
  --admin-gray-50:  #f8fafc;
  --admin-gray-100: #f1f5f9;
  --admin-gray-200: #e2e8f0;
  --admin-gray-300: #cbd5e1;
  --admin-gray-400: #94a3b8;
  --admin-gray-500: #64748b;
  --admin-gray-700: #334155;
  --admin-gray-800: #1e293b;
  --admin-gray-900: #0f172a;

  /* —— Typography —— */
  --admin-font-heading: var(--font-serif);
  --admin-font-body: var(--font-sans);

  --admin-text-xs:   0.75rem;   /* 12px */
  --admin-text-sm:   0.875rem;  /* 14px */
  --admin-text-base: 1rem;      /* 16px */
  --admin-text-lg:   1.125rem;  /* 18px */
  --admin-text-xl:   1.25rem;   /* 20px */
  --admin-text-2xl:  1.5rem;    /* 24px */
  --admin-text-3xl:  2rem;      /* 32px */

  /* —— Spacing Scale —— */
  --admin-space-1:  4px;
  --admin-space-2:  8px;
  --admin-space-3:  12px;
  --admin-space-4:  16px;
  --admin-space-5:  20px;
  --admin-space-6:  24px;
  --admin-space-8:  32px;
  --admin-space-10: 40px;
  --admin-space-12: 48px;

  /* —— Border Radius —— */
  --admin-radius-sm:   6px;
  --admin-radius-md:   10px;
  --admin-radius-lg:   14px;
  --admin-radius-xl:   18px;
  --admin-radius-full: 9999px;

  /* —— Shadows —— */
  --admin-shadow-sm:  0 1px 3px rgba(15, 47, 84, 0.05);
  --admin-shadow-md:  0 4px 12px rgba(15, 47, 84, 0.08);
  --admin-shadow-lg:  0 8px 24px rgba(15, 47, 84, 0.10);
  --admin-shadow-xl:  0 12px 32px rgba(15, 47, 84, 0.12);

  /* —— Transitions —— */
  --admin-transition-fast: 0.15s ease;
  --admin-transition-base: 0.2s ease;
  --admin-transition-slow: 0.3s ease;
}
```

---

## 5. Color Scheme Recommendation

### Current vs. Proposed

The current admin panel uses a "Rockefeller-Inspired" palette defined in globals.css. The analytics page diverges into Slate tones. We need to **unify** them.

### Proposed Palette

| Role | Token | Hex | Usage |
|---|---|---|---|
| **Primary** | `--admin-blue-500` | `#1B73BA` | CTAs, active states, links, primary stat numbers |
| **Primary Hover** | `--admin-blue-600` | `#155a93` | Button hover |
| **Primary Light** | `--admin-blue-50` | `#ebf5ff` | Badge backgrounds, icon containers |
| **Success** | `--admin-success-500` | `#10b981` | Publish button, success badges, approve actions |
| **Success Light** | `--admin-success-50` | `#ecfdf5` | Published badge background |
| **Warning** | `--admin-warning-500` | `#f59e0b` | Draft badges, pending states |
| **Warning Light** | `--admin-warning-50` | `#fffbeb` | Draft badge background |
| **Danger** | `--admin-danger-500` | `#ef4444` | Delete buttons, error states, reject |
| **Danger Light** | `--admin-danger-50` | `#fef2f2` | Error message background |
| **Sidebar BG** | `--admin-gray-900` | `#0f172a` | Sidebar background *(currently `#292828`)* |
| **Page BG** | Gradient | `#f7f9fc → #eef3f9` | Keep current glassmorphic gradient |
| **Surface** | White 86% | `rgba(255,255,255,0.86)` | Keep current frosted-glass cards |
| **Text Primary** | `--admin-gray-900` | `#0f172a` | Headings & primary text |
| **Text Secondary** | `--admin-gray-500` | `#64748b` | Subtitles, labels |
| **Text Tertiary** | `--admin-gray-400` | `#94a3b8` | Timestamps, hints |
| **Borders** | `--admin-gray-200` | `#e2e8f0` | Default card/table borders |

### Why This Works
- Uses the **existing brand blue** (`#1B73BA`) as anchor
- Unifies the Slate-based grays from the Analytics page with the rest of the admin
- Eliminates the Bootstrap-inspired greens (`#28a745`) and reds (`#dc3545`) in favor of a single consistent palette
- Maintains the premium dark sidebar but with a deeper, more modern slate

---

## 6. Typography Standardization

### Current Issues
- Page titles use `2rem` in dashboard, `2rem` in analytics — ✅ consistent
- Section headings alternate between `1.3rem` and `1.125rem`
- Body text ranges from `0.8rem` to `1rem` for similar content
- Labels vary between `0.75rem`, `0.8rem`, `0.82rem`, `0.85rem`

### Proposed Type Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `--admin-text-3xl` | `2rem` | `700` (serif) | Page titles (`h1`) |
| `--admin-text-xl` | `1.25rem` | `600` (serif) | Section headings (`h2`) |
| `--admin-text-lg` | `1.125rem` | `600` (serif) | Card titles (`h3`) |
| `--admin-text-base` | `1rem` | `400` (sans) | Body text, paragraph content |
| `--admin-text-sm` | `0.875rem` | `500` (sans) | Table cells, descriptions, list items |
| `--admin-text-xs` | `0.75rem` | `600` (sans) | Label text, badges, timestamps |

### Rules
1. **Headings:** Always use `--admin-font-heading` (Merriweather)
2. **Everything else:** Use `--admin-font-body` (Open Sans)
3. **Labels** are always `uppercase`, `letter-spacing: 0.05em`, `font-weight: 600`, `--admin-text-xs`
4. **Stat numbers** on cards: `--admin-text-2xl`, `font-weight: 700`, serif font

---

## 7. Button & Interactive Element Standardization

### Proposed Button System

All admin buttons should use **one of four variants**, with **two size options**:

#### Sizes

| Size | Padding | Font Size | Min-Height | Radius |
|---|---|---|---|---|
| **Default** | `8px 16px` | `0.875rem` | `36px` | `--admin-radius-md (10px)` |
| **Large** | `12px 24px` | `0.95rem` | `44px` | `--admin-radius-md (10px)` |

#### Variants

| Variant | Background | Color | Border | Usage |
|---|---|---|---|---|
| **Primary** | `linear-gradient(135deg, #1b73ba, #1f86d8)` | `#fff` | none | Submit, Save, CTA |
| **Success** | `--admin-success-500` | `#fff` | none | Publish, Approve |
| **Danger** | `--admin-danger-500` | `#fff` | none | Delete, Reject |
| **Secondary** | `--admin-gray-50` | `--admin-gray-700` | `1px solid --admin-gray-200` | Cancel, Unpublish, neutral actions |
| **Ghost** | `transparent` | `--admin-gray-500` | `1px solid --admin-gray-300` | Logout, dismiss, subtle actions |
| **Danger Outline** | `transparent` | `--admin-danger-500` | `1px solid --admin-danger-500` | Secondary destructive (current TestimonialList deleteBtn) |

#### Shared Button Properties
```css
.admin-btn {
  font-family: var(--admin-font-body);
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  border-radius: var(--admin-radius-md);
  transition: transform var(--admin-transition-fast),
              box-shadow var(--admin-transition-fast),
              opacity var(--admin-transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.admin-btn:hover {
  transform: translateY(-1px);
}

.admin-btn:active {
  transform: translateY(0);
}

.admin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

### Action Mapping

| Context | Current | Proposed |
|---|---|---|
| Form submit | `.submitBtn` (inline) | `.admin-btn.admin-btn--primary.admin-btn--lg` |
| Form cancel | `.cancelBtn` (inline) | `.admin-btn.admin-btn--secondary.admin-btn--lg` |
| Table Edit link | `.editLink` (inline) | `.admin-btn.admin-btn--primary` |
| Table Publish | `.actionBtn` (inline) | `.admin-btn.admin-btn--success` |
| Table Delete | `.deleteBtn` (inline) | `.admin-btn.admin-btn--danger-outline` |
| Approve (ApprovalList) | `.approveBtn` (inline) | `.admin-btn.admin-btn--success` |
| Reject (ApprovalList) | `.rejectBtn` (inline) | `.admin-btn.admin-btn--danger` |
| Logout | inline styles on `<button>` | `.admin-btn.admin-btn--ghost` |

---

## 8. Card & Surface Standardization

### Current Issues
- Dashboard stat cards: `padding: 30px`, `radius: 12px`, `shadow: 0 2px 8px`
- Analytics stat cards: `padding: 1.5rem`, `radius: 1rem`, `shadow: 0 4px 6px -1px`
- Table cards: `radius: 8px`, `shadow: 0 2px 8px`
- Mobile cards: `radius: 12px`, `shadow: 0 2px 12px`
- Approval cards: `radius: 12px`, `shadow: 0 2px 8px`
- The globals already define `.admin-surface-card` with `radius: 16px`, `shadow: 0 8px 24px` — but it's overridden by inline styles

### Proposed Card System

| Token | Padding | Radius | Shadow | Border | Usage |
|---|---|---|---|---|---|
| `.admin-card` | `var(--admin-space-5)` (20px) | `var(--admin-radius-lg)` (14px) | `var(--admin-shadow-md)` | `1px solid var(--admin-gray-200)` | Default content card |
| `.admin-card--stat` | `var(--admin-space-6)` (24px) | `var(--admin-radius-lg)` | `var(--admin-shadow-md)` | Same | Dashboard stat cards |
| `.admin-card--table` | `0` (cells have padding) | `var(--admin-radius-lg)` | `var(--admin-shadow-md)` | Same | Table wrappers |
| `.admin-card--form` | `var(--admin-space-6)` | `var(--admin-radius-xl)` (18px) | `var(--admin-shadow-lg)` | Same | Form containers |

All cards should have:
```css
background: rgba(255, 255, 255, 0.86);
backdrop-filter: blur(4px);
```

---

## 9. Form Element Standardization

### Current Issues
- Input `borderRadius` is `4px` in inline styles but overridden to `10px` by `.admin-input`
- Input border color varies: `#ddd`, `#d5d7db`, `#d2dce8`, `#ccc`
- Error messages use `background: #fee` (some) vs `#fef2f2` (analytics) vs `#fff5f5` (dashboard)

### Proposed Form Tokens

```css
.admin-input {
  padding: var(--admin-space-3) var(--admin-space-4);    /* 12px 16px */
  border: 1px solid var(--admin-gray-300);                /* #cbd5e1 */
  border-radius: var(--admin-radius-md);                  /* 10px */
  font-size: var(--admin-text-base);                      /* 1rem */
  font-family: var(--admin-font-body);
  background: var(--admin-gray-50);                       /* #f8fafc */
  color: var(--admin-gray-900);
  transition: border-color var(--admin-transition-base),
              box-shadow var(--admin-transition-base);
  width: 100%;
  outline: none;
}

.admin-input:focus {
  border-color: var(--admin-blue-500);
  box-shadow: 0 0 0 3px rgba(27, 115, 186, 0.12);
}

.admin-label {
  font-family: var(--admin-font-body);
  font-size: var(--admin-text-xs);       /* 0.75rem */
  font-weight: 600;
  color: var(--admin-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--admin-space-1);   /* 4px */
}

.admin-help-text {
  font-size: var(--admin-text-xs);
  color: var(--admin-gray-400);
  margin-top: var(--admin-space-1);
}

.admin-error {
  background: var(--admin-danger-50);
  color: var(--admin-danger-700);
  padding: var(--admin-space-3) var(--admin-space-4);
  border-radius: var(--admin-radius-md);
  border: 1px solid var(--admin-danger-100);
  font-size: var(--admin-text-sm);
}
```

---

## 10. Badge & Status Indicator Standardization

### Current Inconsistencies

Published/Draft badges are re-defined in **5 files** with slightly different values:

| File | Published BG | Published Text | Draft BG | Draft Text |
|---|---|---|---|---|
| `page.tsx` (Dashboard) | `#e6f4ea` | `#1e7e34` | `#fef3e0` | `#bf6c00` |
| `TestimonialList` | `#e6f4ea` | `#1e7e34` | `#fef3e0` | `#bf6c00` |
| `BlogList` | `#e6f4ea` | `#1e7e34` | `#fef3e0` | `#bf6c00` |
| `ServiceList` | `#d4edda` | `#155724` | `#f8d7da` | `#721c24` |
| `ApprovalList` (create) | `#d4edda` | `#155724` | — | — |

### Proposed Badge System

```css
/* Base badge */
.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--admin-radius-full);
  font-size: var(--admin-text-xs);
  font-weight: 600;
  font-family: var(--admin-font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  line-height: 1.2;
}

/* Variants */
.admin-badge--published {
  background: var(--admin-success-50);
  color: var(--admin-success-700);
}

.admin-badge--draft {
  background: var(--admin-warning-50);
  color: var(--admin-warning-700);
}

.admin-badge--info {
  background: var(--admin-blue-50);
  color: var(--admin-blue-500);
}

.admin-badge--danger {
  background: var(--admin-danger-50);
  color: var(--admin-danger-700);
}

.admin-badge--neutral {
  background: var(--admin-gray-100);
  color: var(--admin-gray-500);
}

/* Role badges */
.admin-badge--admin {
  background: var(--admin-blue-500);
  color: #fff;
}

.admin-badge--editor {
  background: var(--admin-success-500);
  color: #fff;
}

.admin-badge--viewer {
  background: var(--admin-gray-400);
  color: #fff;
}
```

---

## 11. Spacing & Layout Recommendations

### Current State
- Page padding: `40px` (layout.tsx inline style)
- Section spacing: varies `2rem`, `2.5rem`, `3rem`
- Card internal padding: varies `16px`, `20px`, `24px`, `28px 24px`, `30px`
- Grid gaps: varies `12px`, `16px`, `20px`, `1.5rem`, `30px`

### Proposed Spacing Scale

Use multiples of `4px`:

| Token | Value | Usage |
|---|---|---|
| `--admin-space-1` | `4px` | Micro gaps (badge inner, label-to-input) |
| `--admin-space-2` | `8px` | Within badges, tight lists |
| `--admin-space-3` | `12px` | Input padding, button padding |
| `--admin-space-4` | `16px` | Card internal gaps, between form fields |
| `--admin-space-5` | `20px` | Default card padding |
| `--admin-space-6` | `24px` | Card padding (large), grid gap |
| `--admin-space-8` | `32px` | Between sections |
| `--admin-space-10` | `40px` | Page padding, major section spacing |

### Layout Rules
1. **Page padding:** `var(--admin-space-10)` on desktop, `var(--admin-space-4)` on mobile
2. **Section spacing:** `var(--admin-space-8)` (`margin-bottom`)
3. **Card internal padding:** `var(--admin-space-5)` default, `var(--admin-space-6)` for forms
4. **Grid gap:** `var(--admin-space-6)` for card grids, `var(--admin-space-4)` for list items

---

## 12. Loading & Empty State Patterns

### Current Issues

**Loading states:**
- `loading.tsx`: Generic spinner centered on page
- `analytics/loading.tsx`: Uses `Skeleton` component
- No loading indicators for individual CRUD operations (just disabled buttons)

**Empty states:**
- `TestimonialList`: White card, centered text + link
- `ServiceList`: Centered text, no card
- `TrustImageList`: Dashed border card + CTA button
- `UserList`: Centered text, no card
- `ApprovalList`: Green checkmark icon + message in dashed card

### Proposed: Unified Empty State Component

```tsx
// components/admin/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}
```

Design:
- Dashed border card (matches ApprovalList pattern — the best current implementation)
- Centered icon (40px, `--admin-gray-400`)
- Title: `--admin-text-base`, `font-weight: 600`
- Description: `--admin-text-sm`, `--admin-gray-500`
- CTA: `.admin-btn.admin-btn--primary` 

### Proposed: Skeleton Loading

Extend the existing `Skeleton` component from analytics to cover all list pages:
- Testimonials: 5 horizontal bars (like table rows)
- Services: 3 horizontal cards with image placeholder
- Blogs: 5 horizontal bars
- Contact Messages: 5 horizontal bars

---

## 13. Accessibility Improvements

### Current Gaps

1. **No focus-visible styles on admin buttons** — The globals define `a:focus-visible` but admin buttons use inline styles that don't include focus states.

2. **Color contrast issues:**
   - Draft badge `#bf6c00` on `#fef3e0` = **4.2:1** → passes AA for normal text but fails for small text
   - `#999` on white = **2.85:1** → **fails WCAG AA** (many timestamp/meta texts use this)
   - `rgba(255,255,255,0.45)` on `#292828` sidebar = very low contrast sub-links

3. **Missing `aria-label` on icon-only buttons** — The sidebar collapse button has `aria-label` ✅ but action buttons in lists don't.

4. **No `role="status"` on loading spinners** — Screen readers won't announce loading.

5. **`confirm()` for destructive actions** — Browser-native `confirm()` is not keyboard-accessible on all platforms. Consider a proper modal dialog.

### Recommendations

```css
/* Add to all interactive admin elements */
.admin-btn:focus-visible,
.admin-input:focus-visible {
  outline: 2px solid var(--admin-blue-500);
  outline-offset: 2px;
}
```

- Replace `#999` with `#64748b` (5.3:1 contrast ratio) for all meta/tertiary text
- Replace sidebar sub-link opacity `0.45` with `0.65` minimum
- Add `aria-label` to all icon-only buttons
- Add `role="status"` and `aria-live="polite"` to loading states
- Replace `confirm()` with a custom confirmation modal component

---

## 14. Library Recommendations

### Already In Use
| Library | Usage | Verdict |
|---|---|---|
| **Lucide React** | Icons | ✅ Keep — great tree-shaking, consistent design |
| **Next.js Image** | Optimized images | ✅ Keep |
| **CKEditor** | Rich text editing | ✅ Keep for blog content |

### Recommended Additions

| Library | Purpose | Why |
|---|---|---|
| **[clsx](https://npm.im/clsx)** | Conditional class joining | Tiny (< 1KB), eliminates the need for string concatenation in `className` |
| **[cva](https://npm.im/class-variance-authority)** | Variant-based styling | Works perfectly with CSS classes; define button/badge variants declaratively |
| **[@radix-ui/react-dialog](https://npm.im/@radix-ui/react-dialog)** | Confirmation modals | Fully accessible, headless. Replaces `confirm()` |
| **[@radix-ui/react-alert-dialog](https://npm.im/@radix-ui/react-alert-dialog)** | Destructive action confirmation | Purpose-built for delete/reject confirmations |
| **[@radix-ui/react-toast](https://npm.im/@radix-ui/react-toast)** | Toast notifications | Replace `alert()` calls with accessible, styled toasts |
| **[sonner](https://npm.im/sonner)** | Toast (alternative) | Zero-config beautiful toasts if you prefer simplicity over Radix |
| **[@radix-ui/react-tooltip](https://npm.im/@radix-ui/react-tooltip)** | Tooltips | For icon-only buttons and truncated text |

### Not Recommended
| Library | Reason |
|---|---|
| **Tailwind CSS** | Would require a major rewrite and conflicts with the existing `globals.css` approach. CSS custom properties achieve the same token consistency. |
| **Chakra UI / MUI** | Too heavy for an admin panel that already has its own design system. Would import unnecessary CSS and JS. |
| **Framer Motion** | Overkill for the admin — the existing CSS transitions/animations are sufficient. |

---

## 15. Priority Roadmap

### Phase 1: Foundation (1-2 days) — *Critical*

- [ ] **Create design tokens** — Add `--admin-*` CSS custom properties to `globals.css`
- [ ] **Standardize button classes** — Define `.admin-btn` variants in `globals.css`; deprecate inline button styles
- [ ] **Standardize badge classes** — Define `.admin-badge` variants; remove badge duplication from 5+ files
- [ ] **Fix color values** — Replace all hard-coded hex with tokens; unify analytics palette with admin palette
- [ ] **Unify border-radius** — All cards → `14px`, all buttons/inputs → `10px`, all badges → `9999px`

### Phase 2: Component Refactor (2-3 days) — *High*

- [ ] **Migrate inline styles to CSS classes** — For each admin component, move styles from `const styles: Record<string, React.CSSProperties>` to `globals.css` admin classes
- [ ] **Create shared `EmptyState` component** — Replace 5 different empty patterns
- [ ] **Create shared `ConfirmDialog` component** — Replace `confirm()` calls
- [ ] **Create shared `StatusBadge` component** — Single source of truth for published/draft/role badges
- [ ] **Standardize table layout** — Extract a reusable `AdminTable` pattern (header + rows)
- [ ] **Install `clsx`** for clean conditional class management

### Phase 3: Polish (1-2 days) — *Medium*

- [ ] **Add toast notifications** — Install `sonner` or Radix toast; replace all `alert()` calls
- [ ] **Improve loading states** — Add skeleton loaders for all list pages
- [ ] **Add hover states** — All cards should lift slightly on hover (`transform: translateY(-2px)`)
- [ ] **Login page refresh** — Align login page styling with the new admin theme (currently uses old `4px` radius, no frosted glass)
- [ ] **Sidebar color update** — Move from `#292828` to `#0f172a` (Slate-900) for a more modern feel

### Phase 4: Accessibility (1 day) — *Important*

- [ ] **Fix contrast ratios** — Replace all `#999` and low-opacity text
- [ ] **Add `focus-visible` styles** — For all admin interactive elements
- [ ] **Add `aria` attributes** — Labels, roles, live regions
- [ ] **Replace `confirm()`** — With accessible dialog component
- [ ] **Add keyboard navigation** — Ensure all admin actions are keyboard-accessible

---

## Appendix A: File Inventory

| File | Line Count | Inline Style Lines | Needs Refactor? |
|---|---|---|---|
| `admin/page.tsx` | 614 | ~330 lines of styles | 🔴 Yes |
| `admin/analytics/page.tsx` | 421 | ~200 lines of styles | 🟡 Mostly good, unify colors |
| `admin/layout.tsx` | 51 | 8 inline style props | 🟡 Minor |
| `admin/login/page.tsx` | 169 | ~80 lines of styles | 🟠 Yes |
| `admin/error.tsx` | 95 | ~60 lines of styles | 🟡 Minor |
| `admin/loading.tsx` | 27 | 12 inline style props | 🟡 Minor |
| `AdminSidebar.tsx` | 356 | ~160 lines of styles | 🟠 Yes |
| `TestimonialList.tsx` | 373 | ~170 lines of styles | 🔴 Yes |
| `TestimonialForm.tsx` | 283 | ~80 lines of styles | 🟠 Yes |
| `ServiceList.tsx` | 281 | ~115 lines of styles | 🔴 Yes |
| `ServiceForm.tsx` | 289 | ~75 lines of styles | 🟠 Yes |
| `BlogList.tsx` | 351 | ~160 lines of styles | 🔴 Yes |
| `BlogForm.tsx` | 308 | ~85 lines of styles | 🟠 Yes |
| `TrustImageList.tsx` | 251 | ~85 lines of styles | 🟠 Yes |
| `ApprovalList.tsx` | 452 | ~185 lines of styles | 🟠 Yes |
| `UserList.tsx` | 409 | ~190 lines of styles | 🟠 Yes |
| `LogoutButton.tsx` | 36 | Inline on element | 🟡 Minor |
| `ImageUploader.tsx` | 94 | Inline on element | 🟡 Minor |

> **Total inline style lines across admin components: ~2,000+**

---

## Appendix B: Quick Visual Consistency Checklist

When reviewing any admin component going forward, verify:

- [ ] All colors reference `--admin-*` tokens
- [ ] Border radius uses `--admin-radius-md` (buttons/inputs) or `--admin-radius-lg` (cards)
- [ ] Buttons use `.admin-btn` classes, not inline styles
- [ ] Badges use `.admin-badge` classes
- [ ] Inputs use `.admin-input` class
- [ ] Cards use `.admin-card` class
- [ ] Font sizes use `--admin-text-*` scale
- [ ] Spacing uses `--admin-space-*` scale
- [ ] Box shadows use `--admin-shadow-*` tokens
- [ ] No hard-coded hex colors

---

*End of Report*
