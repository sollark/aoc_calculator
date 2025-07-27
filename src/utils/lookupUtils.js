/**
 * Pure function to create a lookup map from an array of objects
 * @param {Array} items - Array of objects to create lookup from
 * @param {string|Function} keySelector - Property name or function to extract key
 * @param {string|Function} [valueSelector] - Property name or function to extract value (defaults to entire object)
 * @returns {Object} Lookup map where keys map to values
 */
const createLookupMap = (items, keySelector, valueSelector = null) => {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array");
  }

  const getKey =
    typeof keySelector === "function"
      ? keySelector
      : (item) => item[keySelector];

  const getValue = valueSelector
    ? typeof valueSelector === "function"
      ? valueSelector
      : (item) => item[valueSelector]
    : (item) => item;

  return items.reduce((lookup, item) => {
    const key = getKey(item);
    if (key !== undefined && key !== null) {
      lookup[key] = getValue(item);
    }
    return lookup;
  }, {});
};

/**
 * Creates multiple lookup maps with different key selectors
 * @param {Array} items - Array of objects to create lookups from
 * @param {Array<{name: string, keySelector: string|Function, valueSelector?: string|Function}>} configs - Lookup configurations
 * @returns {Object} Object containing named lookup maps
 */
const createMultipleLookups = (items, configs) => {
  return configs.reduce((lookups, config) => {
    lookups[config.name] = createLookupMap(
      items,
      config.keySelector,
      config.valueSelector
    );
    return lookups;
  }, {});
};

/**
 * Helper function
 * Pure function to search items by keyword in specified fields
 * @param {Array} items - Array of objects to search
 * @param {string} keyword - Search keyword
 * @param {Array<string>} searchFields - Fields to search in
 * @param {boolean} [caseSensitive=false] - Whether search is case sensitive
 * @returns {Array} Filtered array of matching items
 */
const searchByKeyword = (
  items,
  keyword,
  searchFields,
  caseSensitive = false
) => {
  if (!Array.isArray(items) || !keyword) {
    return items;
  }

  const searchTerm = caseSensitive ? keyword : keyword.toLowerCase();

  return items.filter((item) =>
    searchFields.some((field) => {
      const fieldValue = item[field];
      if (typeof fieldValue === "string") {
        const value = caseSensitive ? fieldValue : fieldValue.toLowerCase();
        return value.includes(searchTerm);
      }
      return false;
    })
  );
};

/**
 * Higher-order function that creates a search function for specific fields
 * @param {Array<string>} searchFields - Fields to search in
 * @param {boolean} [caseSensitive=false] - Whether search is case sensitive
 * @returns {Function} Search function that takes (items, keyword)
 */
const createSearchFunction = (searchFields, caseSensitive = false) => {
  return (items, keyword) =>
    searchByKeyword(items, keyword, searchFields, caseSensitive);
};

/**
 * Pure function to find item by lookup with fallback search
 * @param {Object} lookup - Lookup map
 * @param {Array} items - Original items array for fallback search
 * @param {string|number} key - Key to lookup
 * @param {string} [fallbackField] - Field to search if lookup fails
 * @returns {*} Found item or undefined
 */
const findWithFallback = (lookup, items, key, fallbackField = null) => {
  // Try lookup first (O(1))
  const result = lookup[key];
  if (result) {
    return result;
  }

  // Fallback to array search if specified (O(n))
  if (fallbackField && Array.isArray(items)) {
    return items.find((item) => item[fallbackField] === key);
  }

  return undefined;
};

export {
  createLookupMap,
  createMultipleLookups,
  createSearchFunction,
  findWithFallback,
};
