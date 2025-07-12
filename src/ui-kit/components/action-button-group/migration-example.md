# ActionButtonGroup Migration Guide

## Overview

The `ActionButtonGroup` component consolidates the functionality of both `ActionButtons` and `BorrowActionButtons` into a single, configurable component.

## Migration Examples

### Supply/Withdraw Actions (Previously ActionButtons)

**Before:**
```tsx
<ActionButtons
	marketAddress={data.marketAddress}
	hasSupplied={data.hasSupplied}
	tokenSymbol={data.symbol}
	supplyAPY={data.supplyAPY}
	isCollateralEnabled={data.isCollateralEnabled}
	walletBalance={data.walletBalance}
	showMoreMenu
/>
```

**After:**
```tsx
<ActionButtonGroup
	variant="supply"
	marketAddress={data.marketAddress}
	hasSupplied={data.hasSupplied}
	tokenSymbol={data.symbol}
	supplyAPY={data.supplyAPY}
	isCollateralEnabled={data.isCollateralEnabled}
	walletBalance={data.walletBalance}
	showMoreMenu
	onAction={(address) => console.log('Supply clicked for:', address)}
	onSecondaryAction={(address) => console.log('Withdraw clicked for:', address)}
	onTertiaryAction={(address) => console.log('More clicked for:', address)}
/>
```

### Borrow/Repay Actions (Previously BorrowActionButtons)

**Before:**
```tsx
<BorrowActionButtons
	marketAddress={data.marketAddress}
	hasBorrowed={data.hasBorrowed}
	tokenSymbol={data.symbol}
	borrowAPY={data.borrowAPY}
	availableLiquidity={data.availableLiquidity}
/>
```

**After:**
```tsx
<ActionButtonGroup
	variant="borrow"
	marketAddress={data.marketAddress}
	hasBorrowed={data.hasBorrowed}
	tokenSymbol={data.symbol}
	borrowAPY={data.borrowAPY}
	availableLiquidity={data.availableLiquidity}
	onAction={(address) => console.log('Borrow clicked for:', address)}
	onSecondaryAction={(address) => console.log('Repay clicked for:', address)}
	onTertiaryAction={(address) => console.log('Details clicked for:', address)}
/>
```

## Key Differences

1. **Single Component**: Both supply and borrow functionality in one component
2. **Variant System**: Use `variant="supply"` or `variant="borrow"` to specify behavior
3. **Unified Styling**: Consistent button styling across both variants
4. **Shared Logic**: Common wallet connection and network validation
5. **Modal Management**: Built-in modal state management

## Benefits

- **DRY Principle**: Eliminates code duplication between action button components
- **Consistency**: Unified behavior and styling across all action buttons
- **Maintainability**: Single component to maintain instead of two separate ones
- **Type Safety**: TypeScript ensures correct props for each variant
- **Performance**: Shared logic reduces bundle size

## Props Interface

### Common Props (Both Variants)
- `marketAddress`: Address of the market contract
- `tokenSymbol`: Symbol of the underlying token
- `onAction`: Primary action callback (Supply/Borrow)
- `onSecondaryAction`: Secondary action callback (Withdraw/Repay)
- `onTertiaryAction`: Tertiary action callback (More/Details)

### Supply Variant Props
- `variant: "supply"`
- `hasSupplied`: Whether user has supplied to this market
- `supplyAPY`: Supply APY percentage
- `isCollateralEnabled`: Whether collateral is enabled
- `walletBalance`: User's wallet balance
- `showMoreMenu`: Whether to show the more menu button

### Borrow Variant Props
- `variant: "borrow"`
- `hasBorrowed`: Whether user has borrowed from this market
- `borrowAPY`: Borrow APY percentage
- `availableLiquidity`: Available liquidity for borrowing