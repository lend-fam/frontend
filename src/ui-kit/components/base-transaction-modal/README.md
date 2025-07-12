# BaseTransactionModal

A unified, reusable modal component that consolidates all shared logic from the existing transaction modals (Supply, Borrow, Withdraw, Repay). This component provides a consistent interface and behavior across all DeFi transaction types while maintaining the exact same functionality and UI as the original modals.

## Features

- **Unified Transaction Flow**: Handles all 4 transaction types (supply, borrow, withdraw, repay) with a single component
- **Smart Approval Management**: Automatic approval flow with user preferences for unlimited vs exact amounts
- **Auto-progression**: Seamless transition from approval to main transaction
- **Type-safe Configuration**: Strongly typed transaction configs and props
- **Consistent UI**: Maintains the exact same styling and layout as existing modals
- **Error Handling**: Comprehensive error handling with user alerts
- **State Management**: Centralized transaction state management with useTransactionFlow hook

## Usage

### Basic Usage

```tsx
import { BaseTransactionModal, TRANSACTION_CONFIGS } from './base-transaction-modal';

// Supply Modal
<BaseTransactionModal
  isOpen={isSupplyModalOpen}
  onClose={() => setIsSupplyModalOpen(false)}
  marketAddress={marketAddress}
  config={TRANSACTION_CONFIGS.supply}
  supplyAPY="5.24%"
  isCollateralEnabled={true}
/>

// Borrow Modal
<BaseTransactionModal
  isOpen={isBorrowModalOpen}
  onClose={() => setIsBorrowModalOpen(false)}
  marketAddress={marketAddress}
  config={TRANSACTION_CONFIGS.borrow}
  borrowAPY="3.87%"
  availableLiquidity={availableLiquidityAmount}
/>
```

### Transaction Configurations

The component uses transaction configurations to determine behavior:

```tsx
const TRANSACTION_CONFIGS = {
  supply: {
    type: 'supply',
    contractFunction: 'mint',
    requiresApproval: true,
  },
  borrow: {
    type: 'borrow', 
    contractFunction: 'borrow',
    requiresApproval: false,
  },
  withdraw: {
    type: 'withdraw',
    contractFunction: 'redeem', 
    requiresApproval: false,
    needsExchangeRateCalculation: true,
  },
  repay: {
    type: 'repay',
    contractFunction: 'repayBorrow',
    requiresApproval: true,
  },
};
```

## Props

### BaseTransactionModalProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Whether the modal is open |
| `onClose` | `() => void` | ✅ | Callback when modal should close |
| `marketAddress` | `Address` | ✅ | The cToken market contract address |
| `config` | `TransactionConfig` | ✅ | Transaction type configuration |
| `supplyAPY` | `string` | ❌ | Supply APY (for supply/withdraw modals) |
| `borrowAPY` | `string` | ❌ | Borrow APY (for borrow/repay modals) |
| `isCollateralEnabled` | `boolean` | ❌ | Collateral status (for supply modal) |
| `availableLiquidity` | `bigint` | ❌ | Available market liquidity (for borrow modal) |

### TransactionConfig

| Prop | Type | Description |
|------|------|-------------|
| `type` | `'supply' \| 'borrow' \| 'withdraw' \| 'repay'` | Transaction type |
| `contractFunction` | `string` | Contract function name to call |
| `requiresApproval` | `boolean` | Whether ERC20 approval is needed |
| `needsExchangeRateCalculation` | `boolean` | Whether exchange rate calculation is needed |

## Architecture

### Components

- **BaseTransactionModal**: Main modal component with configurable sections
- **useTransactionFlow**: Custom hook handling all transaction logic
- **transaction.types**: TypeScript definitions for all transaction-related types

### Key Features

1. **Shared State Management**: Amount input, processing states, approval settings
2. **Common Data Fetching**: Underlying token address, decimals, balances
3. **Unified Transaction Flow**: Approval → Transaction → Success
4. **Configurable Sections**: Approval settings, transaction overview adapt to transaction type
5. **Consistent Error Handling**: Standardized alerts and state management

### Transaction Flow

1. User enters amount
2. Component validates amount against available balance/limits
3. If approval needed, triggers approval transaction first
4. Auto-progresses to main transaction after approval success
5. Shows appropriate loading states and error handling
6. Closes modal on transaction success

## Migration from Existing Modals

To migrate from existing specific modals:

1. Replace the specific modal import with BaseTransactionModal
2. Add the appropriate transaction config
3. Pass the same props but rename them to match the new interface
4. The component behavior and UI will remain identical

### Before
```tsx
<SupplyModal
  isOpen={isOpen}
  onClose={onClose}
  marketAddress={marketAddress}
  supplyAPY={supplyAPY}
  isCollateralEnabled={isCollateralEnabled}
/>
```

### After
```tsx
<BaseTransactionModal
  isOpen={isOpen}
  onClose={onClose}
  marketAddress={marketAddress}
  config={TRANSACTION_CONFIGS.supply}
  supplyAPY={supplyAPY}
  isCollateralEnabled={isCollateralEnabled}
/>
```

## Files

- `base-transaction-modal.component.tsx` - Main modal component
- `use-transaction-flow.hook.ts` - Transaction logic hook
- `transaction.types.ts` - TypeScript type definitions
- `base-transaction-modal.module.css` - Component styles
- `examples.tsx` - Usage examples for each transaction type
- `index.ts` - Public exports