/**
 * UI COMPONENTS BARREL EXPORT
 *
 * Centralized export point for all UI components using the "Barrel Export" pattern.
 */

// ==========================================
// CORE UI COMPONENTS
// ==========================================

/**
 * Select - Advanced dropdown with custom value/label extraction
 */
export { default as Select } from "./Select";

/**
 * Button - Multi-variant button with loading states and icons
 */
export { default as Button } from "./Button";

/**
 * IconButton - Circular button for icon-only actions
 */
export { default as IconButton } from "./IconButton";

/**
 * QuantityControl - Reusable quantity input with increment/decrement
 * Features: Min/max validation, keyboard navigation, multiple sizes
 */
export { default as QuantityControl } from "./QuantityControl";

/**
 * COMPARISON: BARREL EXPORTS VS DIRECT IMPORTS
 *
 * ==========================================
 * BARREL EXPORTS (RECOMMENDED)
 * ==========================================
 *
 * // In component files:
 * import { Select, Button } from '../ui';
 *
 * PROS:
 * ✅ Clean, readable imports
 * ✅ Consistent import patterns
 * ✅ Easy to refactor internal structure
 * ✅ Better developer experience
 * ✅ Follows React ecosystem standards
 * ✅ Easy component discovery
 * ✅ Centralized component management
 *
 * CONS:
 * ⚠️ Extra abstraction layer
 * ⚠️ Potential for large bundle if poorly configured
 *
 * ==========================================
 * DIRECT IMPORTS (NOT RECOMMENDED)
 * ==========================================
 *
 * // In component files:
 * import Select from '../ui/Select/Select.jsx';
 * import Button from '../ui/Button/Button.jsx';
 *
 * PROS:
 * ✅ Direct, explicit imports
 * ✅ No abstraction layer
 * ✅ Clear file dependencies
 *
 * CONS:
 * ❌ Verbose import statements
 * ❌ Exposes internal file structure
 * ❌ Breaks when files are moved/renamed
 * ❌ Inconsistent import patterns
 * ❌ Poor developer experience
 * ❌ Harder to maintain at scale
 * ❌ More cognitive load for developers
 *
 * ==========================================
 * CONCLUSION
 * ==========================================
 *
 * Barrel exports through index.js files are a widely adopted pattern
 * in the React ecosystem because they provide:
 *
 * 1. Better Developer Experience
 * 2. Cleaner Code Organization
 * 3. Easier Maintenance
 * 4. Future-Proof Architecture
 * 5. Industry Standard Practices
 *
 * The small overhead is vastly outweighed by the benefits,
 * especially as the component library grows in size and complexity.
 */
