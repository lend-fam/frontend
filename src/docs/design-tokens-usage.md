# Design Tokens Usage Guide

This guide explains how to use the Figma design tokens that have been integrated into the React frontend.

## Overview

The design tokens from Figma are now available in multiple formats:
- **CSS Custom Properties**: Available in `src/styles/design-tokens.css`
- **TypeScript Utilities**: Available in `src/utils/design-system.ts`
- **React Components**: Available in `src/ui-kit/components/design-tokens/`
- **Theme Provider**: Available in `src/ui-kit/providers/design-theme-provider.tsx`

## Available Design Tokens

### Colors
- `white` - #ffffffff
- `dark` - #18171eff
- `accent.miracle_1` - #5877feff (primary blue)
- `accent.miracle_2` - #ffffffff (white)
- `accent.miracle_3` - #18171eff (dark)
- `accent.green` - #65b261ff
- `accent.pink` - #f58fc7ff
- `accent.ice` - #e7ecffff (light blue)
- `accent.apechain` - #0054faff
- `accent.orange` - #fe8258ff
- `text.inversion` - #ffffffff (white text)
- `text.default` - #18171eff (dark text)
- `bg.miracle_blue` - #5877feff
- `bg.miracle_blue_dark` - #4d6aeaff
- `bg.miracle_blue_light` - #e7ecffff

### Typography
- **Headings**: `title`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `menu`, `menu_active`
- **Text**: `default`, `small`, `default_bold`, `small_bold`

## Usage Methods

### 1. CSS Custom Properties (Direct CSS)

```css
.my-button {
  background-color: var(--color-accent-miracle-1);
  color: var(--color-text-inversion);
  font-size: var(--font-text-default-size);
  font-family: var(--font-text-default-family);
  font-weight: var(--font-text-default-weight);
}
```

### 2. CSS Utility Classes

```jsx
<div className="bg-accent-miracle-1 color-text-inversion font-text-default">
  Primary button style
</div>
```

### 3. TypeScript Design System Utilities

```tsx
import { ds } from '../utils/design-system';

// Get individual values
const primaryColor = ds.color.get('accent.miracle_1');
const titleStyles = ds.typography.styles('heading.desktop.title');

// Create complete style objects
const buttonStyles = ds.createStyle({
  color: 'text.inversion',
  backgroundColor: 'accent.miracle_1',
  typography: 'text.desktop.default_bold',
  additional: {
    padding: '12px 24px',
    borderRadius: '8px',
  }
});

// Use in components
<button style={buttonStyles}>Click me</button>
```

### 4. React Components with Design Tokens

```tsx
import { Text, Heading, Box } from '../ui-kit/components/design-tokens';

// Typography components
<Heading variant="h1" color="text.default">
  Page Title
</Heading>

<Text variant="default" color="text.default">
  Regular body text
</Text>

<Text variant="small_bold" color="accent.green">
  Success message
</Text>

// Layout with colors
<Box backgroundColor="bg.miracle_blue_light" color="text.default">
  <Text variant="default">Content with themed background</Text>
</Box>
```

### 5. Theme Provider and Hooks

```tsx
import { useDesignTheme } from '../ui-kit/providers/design-theme-provider';

function MyComponent() {
  const { getColor, getTypography, currentTheme } = useDesignTheme();
  
  return (
    <div style={{
      backgroundColor: currentTheme.background,
      color: currentTheme.text,
      ...getTypography('heading.desktop.h2')
    }}>
      Themed component
    </div>
  );
}
```

### 6. Enhanced Theme Hook (for existing CSS Modules)

```tsx
import { useEnhancedTheme } from '../ui-kit/providers/design-theme-provider';
import css from './my-component.module.css';

function MyComponent() {
  const theme = useEnhancedTheme(css);
  
  return (
    <div className={theme.container}>
      <h1 style={theme.designTokens.getTypography('heading.desktop.h1')}>
        Title with design tokens
      </h1>
    </div>
  );
}
```

## Best Practices

### 1. Use Type-Safe Token Access
```tsx
// ✅ Good - TypeScript will validate these tokens
const color = ds.color.get('accent.miracle_1');
const typography = ds.typography.styles('heading.desktop.h1');

// ❌ Bad - No type safety
const color = '#5877feff';
const fontSize = '36px';
```

### 2. Prefer Design Token Components
```tsx
// ✅ Good - Uses design tokens automatically
<Heading variant="h1">Title</Heading>
<Text variant="default">Content</Text>

// ❌ Less ideal - Manual styling
<h1 style={{ fontSize: '36px', fontFamily: 'Montserrat' }}>Title</h1>
```

### 3. Use Common Style Patterns
```tsx
import { commonStyles } from '../utils/design-system';

// Pre-defined common styles
<button style={commonStyles.primaryButton}>Primary Action</button>
<div style={commonStyles.success}>Success message</div>
```

### 4. CSS-in-JS with Design Tokens
```tsx
import { styled } from '../utils/design-system';

const StyledButton = styled.button`
  background-color: ${styled.color('accent.miracle_1')};
  color: ${styled.color('text.inversion')};
  ${styled.typography('text.desktop.default_bold')}
  padding: 12px 24px;
  border-radius: 8px;
`;
```

## Migration Guide

### From Hardcoded Values
```tsx
// Before
const styles = {
  color: '#5877feff',
  fontSize: '36px',
  fontFamily: 'Montserrat',
  fontWeight: 800,
};

// After
const styles = ds.createStyle({
  color: 'accent.miracle_1',
  typography: 'heading.desktop.h1',
});
```

### From CSS Variables
```css
/* Before */
.title {
  color: var(--primary-color);
  font-size: var(--large-font);
}

/* After */
.title {
  color: var(--color-accent-miracle-1);
  font-size: var(--font-heading-h1-size);
  font-family: var(--font-heading-h1-family);
  font-weight: var(--font-heading-h1-weight);
}
```

## Development Workflow

1. **Update Design Tokens**: Replace `design-tokens.tokens.json` with new export from Figma
2. **Regenerate CSS**: The CSS custom properties will be automatically updated
3. **Type Safety**: TypeScript will catch any token changes that affect your code
4. **Testing**: Components using design tokens will automatically reflect the new values

## Future Enhancements

- **Dark Mode**: The theme provider is ready for dark mode implementation
- **Dynamic Themes**: Support for multiple color schemes from Figma
- **Build-Time Generation**: Automatic CSS generation from token JSON during build
- **Design Token Validation**: Linting rules to enforce design token usage

This system ensures your UI stays consistent with the Figma design system while providing a great developer experience with full TypeScript support.