# Missing Design Tokens Report

## Executive Summary

This report analyzes the lend.fam MVP frontend codebase to identify missing design tokens that should be added to improve consistency, maintainability, and developer experience. While the project has a solid foundation with existing design tokens from Figma, there are significant gaps where hardcoded values are used instead of design tokens.

## Current Design Token Status

### ✅ **Existing Design Tokens**
- **10 Color Tokens**: Basic color palette (white, dark, accent colors, text colors, background colors)
- **14 Typography Token Sets**: Complete heading hierarchy (title, h1-h6, menu variants) and text styles (default, small, bold variants)
- **Infrastructure**: Auto-generated CSS custom properties, TypeScript utilities, React components
- **Implementation**: 78+ components updated to use design tokens

### ❌ **Missing Design Token Categories**

## 1. Color Tokens (HIGH PRIORITY)

### State Colors - Error System
**Primary Error**: `#ef4444` (Red 500)
- **Usage**: Primary error text, error buttons, form validation errors
- **Location**: `base-transaction-modal.module.css:150`, `base-transaction-modal.module.css:194`
- **Components**: Transaction modals, form inputs, error messages

**Error Dark**: `#dc2626` (Red 600)
- **Usage**: Error text in dark backgrounds, hover states for error buttons
- **Location**: `faucet-page.module.css:23`
- **Components**: Faucet error messages, error state buttons

**Error Darker**: `#991b1b` (Red 700)
- **Usage**: Error text in high-contrast scenarios, active error states
- **Location**: `faucet-page.module.css:28`
- **Components**: Critical error messages, error state indicators

**Error Light**: `#fef2f2` (Red 50)
- **Usage**: Error background containers, error state backgrounds
- **Location**: `faucet-page.module.css:13`
- **Components**: Error notification backgrounds, form error containers

**Error Light Border**: `#fecaca` (Red 200)
- **Usage**: Error container borders, error state outlines
- **Location**: `faucet-page.module.css:14`
- **Components**: Error notification borders, validation error outlines

### State Colors - Warning System
**Primary Warning**: `#fbbf24` (Amber 400)
- **Usage**: Warning text, warning buttons, caution indicators
- **Location**: `base-transaction-modal.module.css:335`, `faucet-page.module.css:243`
- **Components**: Transaction warnings, approval prompts, caution messages

**Warning Dark**: `#92400e` (Amber 800)
- **Usage**: Warning text in light backgrounds, warning emphasis
- **Location**: `base-transaction-modal.module.css:338`, `faucet-page.module.css:250`
- **Components**: Warning message text, caution indicators

**Warning Light**: `#fffbeb` (Amber 50)
- **Usage**: Warning background containers, warning state backgrounds
- **Location**: `faucet-page.module.css:242`
- **Components**: Warning notification backgrounds, caution containers

**Warning Light Alt**: `#fef3cd` (Amber 100)
- **Usage**: Alternative warning background, subtle warning states
- **Location**: `base-transaction-modal.module.css:333`
- **Components**: Transaction warning backgrounds, approval notices

### State Colors - Success System
**Success Primary**: `#059669` (Emerald 600)
- **Usage**: Success buttons, positive indicators, confirmation states
- **Location**: `button.module.css:153` (gradient), success button hover states
- **Components**: Submit buttons, success messages, positive feedback

**Success Dark**: `#047857` (Emerald 700)
- **Usage**: Success button hover states, success emphasis
- **Location**: `button.module.css:153` (gradient), success button active states
- **Components**: Success button interactions, positive action feedback

**Success Darker**: `#065f46` (Emerald 800)
- **Usage**: Success text, high-contrast success states
- **Location**: Currently missing but needed for success text
- **Components**: Success messages, positive status indicators

### State Colors - Info System
**Info Primary**: `#3b82f6` (Blue 500)
- **Usage**: Info messages, information buttons, neutral states
- **Location**: `button.module.css:21` (focus shadow), info button states
- **Components**: Info buttons, notification messages, neutral feedback

**Info Secondary**: `#2563eb` (Blue 600)
- **Usage**: Info button hover states, info emphasis
- **Location**: `button.module.css:82`, `button.module.css:104`
- **Components**: Info button interactions, secondary info states

**Info Dark**: `#1d4ed8` (Blue 700)
- **Usage**: Info button active states, high-contrast info
- **Location**: `button.module.css:170`
- **Components**: Info button active states, emphasized info text

### Semantic Colors - Text Hierarchy
**Text Primary**: `#18171e` (existing token)
- **Usage**: Primary text, headings, main content
- **Location**: Already tokenized as `--color-text-default`
- **Components**: All primary text elements

**Text Secondary**: `#6b7280` (Gray 500)
- **Usage**: Secondary text, labels, less important content
- **Location**: `button.module.css:230`, `faucet-page.module.css:42`
- **Components**: Form labels, secondary information, helper text

**Text Muted**: `#9ca3af` (Gray 400)
- **Usage**: Muted text, placeholders, disabled text
- **Location**: `modal.module.css:56`, `base-transaction-modal.module.css:22`, `base-transaction-modal.module.css:27`
- **Components**: Placeholder text, disabled states, subtle information

**Text Disabled**: `#d1d5db` (Gray 300)
- **Usage**: Disabled text, inactive states, very muted content
- **Location**: `base-transaction-modal.module.css:22`, `base-transaction-modal.module.css:175`
- **Components**: Disabled form elements, inactive states, very subtle text

### Semantic Colors - Interactive States
**Hover Light**: `#f3f4f6` (Gray 100)
- **Usage**: Hover backgrounds for light elements
- **Location**: `button.module.css:126`, `faucet-page.module.css:149`
- **Components**: Button hover states, card hover backgrounds

**Hover Medium**: `#374151` (Gray 700)
- **Usage**: Hover backgrounds for medium elements, hover text
- **Location**: `button.module.css:127`, `modal.module.css:71`
- **Components**: Button hover states, interactive element backgrounds

**Hover Dark**: `#1e40af` (Blue 700)
- **Usage**: Hover states for primary elements, active states
- **Location**: `button.module.css:102`, `button.module.css:104`
- **Components**: Primary button hover states, active interactive elements

**Hover Primary**: `#2563eb` (Blue 600)
- **Usage**: Primary hover states, main interactive elements
- **Location**: `button.module.css:82`
- **Components**: Primary button hover, main interactive states

### Semantic Colors - Surface & Borders
**Surface Light**: `#f9fafb` (Gray 50)
- **Usage**: Light backgrounds, card backgrounds, surface elements
- **Location**: `button.module.css:120`, `faucet-page.module.css:149`
- **Components**: Card backgrounds, light surface areas, container backgrounds

**Surface Medium**: `#374151` (Gray 700)
- **Usage**: Medium backgrounds, input backgrounds, elevated surfaces
- **Location**: `base-transaction-modal.module.css:42`, `base-transaction-modal.module.css:159`
- **Components**: Input backgrounds, elevated cards, medium surface areas

**Surface Dark**: `#1f2937` (Gray 800)
- **Usage**: Dark backgrounds, high-contrast surfaces
- **Location**: `base-transaction-modal.module.css:86`
- **Components**: Dark surface areas, high-contrast backgrounds

**Border Light**: `#e5e7eb` (Gray 200)
- **Usage**: Light borders, subtle dividers, soft outlines
- **Location**: `button.module.css:122`, `button.module.css:175`, `faucet-page.module.css:135`
- **Components**: Card borders, form element borders, subtle dividers

**Border Medium**: `#d1d5db` (Gray 300)
- **Usage**: Medium borders, standard dividers, form borders
- **Location**: `faucet-page.module.css:135`
- **Components**: Standard borders, form element outlines, dividers

**Border Dark**: `#4b5563` (Gray 600)
- **Usage**: Dark borders, high-contrast outlines, focus borders
- **Location**: `base-transaction-modal.module.css:44`, `base-transaction-modal.module.css:248`
- **Components**: Input borders, high-contrast outlines, focus states

**Border Darker**: `#374151` (Gray 700)
- **Usage**: Very dark borders, strong outlines, emphasized borders
- **Location**: `base-transaction-modal.module.css:88`
- **Components**: Strong borders, emphasized outlines, high-contrast dividers

### Component-Specific Colors
**Input Background**: `#374151` (Gray 700)
- **Usage**: Input field backgrounds, form element backgrounds
- **Location**: `base-transaction-modal.module.css:42`
- **Components**: Text inputs, form fields, editable areas

**Input Border**: `#4b5563` (Gray 600)
- **Usage**: Input field borders, form element outlines
- **Location**: `base-transaction-modal.module.css:44`
- **Components**: Input borders, form field outlines, editable area borders

**Input Icon Background**: `#1f2937` (Gray 800)
- **Usage**: Input icon backgrounds, form element icons
- **Location**: `base-transaction-modal.module.css:86`
- **Components**: Input icons, form element decorations

**Card Background**: `#f9fafb` (Gray 50)
- **Usage**: Card backgrounds, container backgrounds
- **Location**: `faucet-page.module.css:149`
- **Components**: Cards, containers, elevated surfaces

**Card Border**: `#e5e7eb` (Gray 200)
- **Usage**: Card borders, container outlines
- **Location**: `faucet-page.module.css:150`
- **Components**: Card borders, container outlines, surface dividers

**Focus Ring**: `#3b82f6` (Blue 500)
- **Usage**: Focus indicators, accessibility outlines
- **Location**: `button.module.css:21` (with rgba), focus states
- **Components**: Focus rings, accessibility indicators, keyboard navigation

**Focus Ring Secondary**: `#2563eb` (Blue 600)
- **Usage**: Secondary focus indicators, alternative focus states
- **Location**: `button.module.css:82`
- **Components**: Secondary focus rings, alternative focus indicators

### Transparency & Overlays
**Focus Shadow**: `rgba(59, 130, 246, 0.5)` (Blue 500 @ 50%)
- **Usage**: Focus shadows, accessibility indicators
- **Location**: `button.module.css:21`
- **Components**: Focus shadows, button focus states

**Gradient Shadow Blue**: `rgba(99, 102, 241, 0.3)` (Indigo 500 @ 30%)
- **Usage**: Gradient button shadows, elevated element shadows
- **Location**: `button.module.css:145`
- **Components**: Gradient buttons, elevated interactive elements

**Gradient Shadow Green**: `rgba(5, 150, 105, 0.3)` (Emerald 600 @ 30%)
- **Usage**: Success button shadows, positive action shadows
- **Location**: `button.module.css:157`
- **Components**: Success buttons, positive action elements

**Modal Overlay**: `rgba(0, 0, 0, 0.5)` (Black @ 50%)
- **Usage**: Modal overlays, backdrop elements
- **Location**: `modal.module.css:8`
- **Components**: Modal backgrounds, overlay elements

**Row Hover**: `rgba(0, 0, 0, 0.05)` (Black @ 5%)
- **Usage**: Table row hover states, subtle hover effects
- **Location**: `table.module.css:20`
- **Components**: Table rows, list items, subtle hover states

**Row Hover Light**: `rgba(255, 255, 255, 0.05)` (White @ 5%)
- **Usage**: Table row hover shadow, subtle elevation
- **Location**: `table.module.css:21`
- **Components**: Table row shadows, subtle elevation effects

**Header Background**: `rgba(255, 255, 255, 0.2)` (White @ 20%)
- **Usage**: Header backgrounds, translucent surfaces
- **Location**: `market-header.module.css:12`
- **Components**: Header backgrounds, translucent overlays

**Header Hover**: `rgba(255, 255, 255, 0.3)` (White @ 30%)
- **Usage**: Header hover states, interactive header elements
- **Location**: `market-header.module.css:24`
- **Components**: Header interactive elements, hover states

**Success Background**: `rgba(76, 175, 80, 0.3)` (Green @ 30%)
- **Usage**: Success state backgrounds, positive feedback
- **Location**: `market-header.module.css:49`
- **Components**: Success indicators, positive feedback backgrounds

### Color Token Naming Convention
All color tokens should follow the pattern:
- **State Colors**: `--color-{state}-{intensity}` (e.g., `--color-error-primary`)
- **Semantic Colors**: `--color-{semantic}-{variant}` (e.g., `--color-text-secondary`)
- **Component Colors**: `--color-{component}-{property}` (e.g., `--color-input-background`)
- **Transparency**: `--color-{base}-{opacity}` (e.g., `--color-focus-shadow`)

## 2. Spacing Tokens (HIGH PRIORITY)

### Border Radius Scale
- **Small**: `4px`, `6px` (buttons, small components)
- **Medium**: `8px`, `12px` (cards, modals)
- **Large**: `16px`, `25px` (containers, layouts)

### Padding/Margin Scale
- **Micro**: `2px`, `4px` (fine adjustments)
- **Small**: `8px`, `10px`, `12px` (tight spacing)
- **Medium**: `16px`, `20px`, `24px` (standard spacing)
- **Large**: `32px`, `48px`, `64px` (layout spacing)

### Gap Scale
- **Small**: `4px`, `6px`, `8px` (component gaps)
- **Medium**: `12px`, `16px`, `20px` (layout gaps)

## 3. Typography Tokens (MEDIUM PRIORITY)

### Missing Font Sizes
- **Extra Small**: `10px`, `12px`, `13px` (captions, labels)
- **Small**: `14px` (secondary text, form labels)
- **Medium**: `18px` (section titles)
- **Large**: `24px` (large inputs, emphasis)

### Text Variants
- **Caption**: Small, muted text for descriptions
- **Label**: Form labels and field descriptions
- **Error Text**: Error message styling
- **Link**: Link text styling and states

## 4. Shadow Tokens (MEDIUM PRIORITY)

### Component Shadows
- **Button Shadows**: `0 4px 12px rgba(99, 102, 241, 0.3)` (gradient buttons)
- **Modal Shadows**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
- **Card Shadows**: `0 1px 3px rgba(0, 0, 0, 0.1)` (subtle elevation)
- **Tooltip Shadows**: `0 2px 8px rgba(0, 0, 0, 0.15)`

### Focus Shadows
- **Primary Focus**: `0 0 0 2px rgba(59, 130, 246, 0.5)`
- **Error Focus**: Similar pattern for error states
- **Success Focus**: Similar pattern for success states

## 5. Animation Tokens (LOW PRIORITY)

### Transition Durations
- **Fast**: `0.15s` (hover effects, small changes)
- **Standard**: `0.2s` (most transitions)
- **Slow**: `0.3s` (modal animations, page transitions)

### Easing Functions
- **Standard**: `ease`, `ease-in-out`
- **Smooth**: `cubic-bezier(0.4, 0, 0.2, 1)`

## 6. Component Size Tokens (LOW PRIORITY)

### Button Sizes
- **Small**: `height: 24px`, `padding: 4px 8px`
- **Medium**: `height: 32px`, `padding: 8px 12px`
- **Large**: `height: 48px`, `padding: 16px`

### Input Sizes
- **Standard**: `height: 32px`
- **Large**: `height: 48px` (large inputs)

### Layout Dimensions
- **Header Height**: `64px`
- **Modal Min Width**: `400px`
- **Container Max Width**: Various breakpoints

## 7. Opacity Tokens (LOW PRIORITY)

### State Opacities
- **Disabled**: `0.5`, `0.6`
- **Loading**: `0.7`
- **Hover**: `0.8`, `0.9`
- **Overlay**: `0.5` (modal overlays)

## Impact Analysis

### Files Most Affected by Missing Tokens

1. **`button.module.css`**: 25+ hardcoded values (colors, spacing, shadows)
2. **`base-transaction-modal.module.css`**: 20+ hardcoded values (colors, typography, spacing)
3. **`modal.module.css`**: 15+ hardcoded values (colors, spacing, shadows)
4. **`faucet-page.module.css`**: 15+ hardcoded values (colors, spacing, typography)

### Development Impact
- **Inconsistency**: Same colors defined multiple times with slight variations
- **Maintainability**: Changes require updates in multiple files
- **Design System Gaps**: Missing semantic tokens for common UI patterns
- **Developer Experience**: Guessing appropriate values instead of using standardized tokens

## Conclusion

The lend.fam MVP frontend has a solid foundation for design tokens but needs significant expansion to eliminate hardcoded values and improve consistency. The proposed 4-phase approach will systematically address the most impactful missing tokens while maintaining development velocity and visual consistency.

**Components to Update**: 25+ files
**New Tokens to Add**: 50+ tokens across 7 categories
**Expected Impact**: Improved consistency, reduced CSS bundle size, better developer experience