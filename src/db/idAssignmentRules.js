import recipesData from "../db/recipes.json";

/**
 * Recipe ID Assignment Rules for Ashes of Creation Calculator
 * These rules ensure consistent ID assignment across all recipes
 */

export const ID_RANGES = {
  // Raw Components (1000-1999)
  RAW_COMPONENTS: {
    MINING: {
      start: 1000,
      end: 1099,
      description: "Mining materials (ores, stones, gems)",
    },
    LUMBERJACKING: {
      start: 1100,
      end: 1199,
      description: "Wood and lumber materials",
    },
    HERBALISM: {
      start: 1200,
      end: 1299,
      description: "Herbs, plants, flowers",
    },
    FISHING: {
      start: 1300,
      end: 1399,
      description: "Fish, aquatic plants, shells",
    },
    HUNTING: {
      start: 1400,
      end: 1499,
      description: "Leather, bones, meat, fur",
    },
    VENDOR: { start: 1500, end: 1599, description: "Vendor purchased items" },
    SPECIAL: { start: 1600, end: 1699, description: "Special/Event materials" },
    RESERVED: {
      start: 1700,
      end: 1999,
      description: "Reserved for future gathering types",
    },
  },

  // Intermediate Recipes (2000-3999) - Organized by Artisan Skill
  INTERMEDIATE_RECIPES: {
    ALCHEMY: {
      start: 2000,
      end: 2199,
      description: "Alchemy processing recipes",
    },
    LUMBER_MILLING: {
      start: 2200,
      end: 2399,
      description: "Lumber milling recipes",
    },
    METALWORKING: {
      start: 2400,
      end: 2599,
      description: "Metalworking and smelting recipes",
    },
    STONEMASONRY: {
      start: 2600,
      end: 2799,
      description: "Stonemasonry processing recipes",
    },
    LEATHERWORKING: {
      start: 2800,
      end: 2999,
      description: "Leatherworking processing recipes",
    },
    WEAVING: {
      start: 3000,
      end: 3199,
      description: "Weaving and textile recipes",
    },
    COOKING: {
      start: 3200,
      end: 3399,
      description: "Cooking intermediate recipes",
    },
    JEWEL_CUTTING: {
      start: 3400,
      end: 3599,
      description: "Jewel cutting recipes",
    },
    FISHING_PROCESSING: {
      start: 3600,
      end: 3799,
      description: "Fish processing recipes",
    },
    RESERVED: {
      start: 3800,
      end: 3999,
      description: "Reserved for future artisan skills",
    },
  },

  // Crafted Items (4000-7999)
  CRAFTED_ITEMS: {
    // Weapons by Artisan Profession (4000-5999)
    WEAPONSMITHING: {
      start: 4000,
      end: 4399,
      description: "Weaponsmithing crafted weapons",
    },
    BOWCRAFT: {
      start: 4400,
      end: 4799,
      description: "Bowcraft weapons (bows, crossbows)",
    },
    STAFF_MAKING: {
      start: 4800,
      end: 5199,
      description: "Staff making (staves, wands)",
    },
    WEAPON_RESERVED: {
      start: 5200,
      end: 5999,
      description: "Reserved for future weapon crafting",
    },

    // Armor by Artisan Profession (6000-6999)
    ARMORSMITHING: {
      start: 6000,
      end: 6299,
      description: "Heavy armor (plate, mail)",
    },
    LEATHERWORKING_ARMOR: {
      start: 6300,
      end: 6599,
      description: "Light armor (leather, studded)",
    },
    TAILORING: {
      start: 6600,
      end: 6899,
      description: "Cloth armor (robes, garments)",
    },
    ARMOR_RESERVED: {
      start: 6900,
      end: 6999,
      description: "Reserved for future armor types",
    },

    // Tools (7000-7099) - Reduced to 100 IDs
    TOOLS: {
      start: 7000,
      end: 7099,
      description: "Gathering and crafting tools",
    },

    // Consumables (7100-7999) - Divided by Type
    SCROLLS: {
      start: 7100,
      end: 7299,
      description: "Magical scrolls and enchantments",
    },
    FOOD: { start: 7300, end: 7599, description: "Food items and meals" },
    POTIONS: { start: 7600, end: 7799, description: "Potions and elixirs" },
    OTHER_CONSUMABLES: {
      start: 7800,
      end: 7999,
      description: "Other consumable items",
    },
  },
};

export const ASSIGNMENT_GUIDELINES = {
  rules: [
    "Always use getNextAvailableId() to assign new IDs",
    "Never reuse IDs - once assigned, never change",
    "Leave gaps for organization (increment by 10 for related recipes)",
    "Reserve special numbers (X000, X500) for major items",
    "Organize by artisan skill for all crafted items",
  ],
  gapStrategy:
    "Use increments of 1 for sequential items, 10 for related groups, 100 for major categories",
  reservedNumbers: "X000, X500 reserved for significant items in each range",
};

/**
 * Gets the appropriate ID range for a given item type and category
 * @param {string} itemType - "raw", "intermediate", or "crafted"
 * @param {string} category - Specific category within the type
 * @returns {Object} Range object with start, end, and description
 */
export const getIdRange = (itemType, category) => {
  const typeMap = {
    raw: ID_RANGES.RAW_COMPONENTS,
    intermediate: ID_RANGES.INTERMEDIATE_RECIPES,
    crafted: ID_RANGES.CRAFTED_ITEMS,
  };

  return typeMap[itemType]?.[category.toUpperCase()] || null;
};

/**
 * Gets all existing IDs from recipes data
 * @returns {Array} Array of all existing IDs
 */
const getAllExistingIds = () => {
  const allIds = [];

  // Get IDs from raw components
  if (recipesData.raw_components) {
    allIds.push(...recipesData.raw_components.map((item) => item.id));
  }

  // Get IDs from intermediate recipes
  if (recipesData.intermediate_recipes) {
    allIds.push(...recipesData.intermediate_recipes.map((item) => item.id));
  }

  // Get IDs from crafted items
  if (recipesData.crafted_items) {
    allIds.push(...recipesData.crafted_items.map((item) => item.id));
  }

  return allIds;
};

/**
 * Gets the next available ID in a specific range
 * @param {string} itemType - "raw", "intermediate", or "crafted"
 * @param {string} category - Specific category within the type
 * @param {number} gap - Optional gap to leave (default: 1)
 * @returns {number|null} Next available ID or null if range is invalid
 */
export const getNextAvailableId = (itemType, category, gap = 1) => {
  const range = getIdRange(itemType, category);
  if (!range) {
    console.error(`Invalid item type "${itemType}" or category "${category}"`);
    return null;
  }

  const existingIds = getAllExistingIds();
  const idsInRange = existingIds.filter(
    (id) => id >= range.start && id <= range.end
  );

  if (idsInRange.length === 0) {
    // No IDs in this range yet, start from the beginning
    return range.start;
  }

  // Find the highest ID in range and add gap
  const highestId = Math.max(...idsInRange);
  const nextId = highestId + gap;

  // Check if next ID is within range
  if (nextId > range.end) {
    console.error(
      `No more IDs available in range ${range.start}-${range.end} for ${itemType}/${category}`
    );
    return null;
  }

  return nextId;
};

/**
 * Validates if an ID follows the assignment rules
 * @param {number} id - The ID to validate
 * @param {string} itemType - Expected item type
 * @param {string} category - Expected category
 * @returns {Object} Validation result
 */
export const validateId = (id, itemType, category) => {
  const range = getIdRange(itemType, category);

  if (!range) {
    return { isValid: false, error: "Invalid item type or category" };
  }

  const isInRange = id >= range.start && id <= range.end;

  if (!isInRange) {
    return {
      isValid: false,
      range: range,
      error: `ID ${id} is outside range ${range.start}-${range.end} for ${itemType}/${category}`,
    };
  }

  // Check if ID is already in use
  const existingIds = getAllExistingIds();
  const isUnique = !existingIds.includes(id);

  if (!isUnique) {
    return {
      isValid: false,
      range: range,
      error: `ID ${id} is already in use`,
    };
  }

  return {
    isValid: true,
    range: range,
    error: null,
  };
};
