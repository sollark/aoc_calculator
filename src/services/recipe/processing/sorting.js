/**
 * Recipe sorting utilities
 * Provides functions for sorting recipes by various criteria
 */

/**
 * Sort recipes by name
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortByName = (recipes, order = "asc") => {
  return [...recipes].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Sort recipes by ID
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortById = (recipes, order = "asc") => {
  return [...recipes].sort((a, b) => {
    const comparison = a.id - b.id;
    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Sort recipes by type
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortByType = (recipes, order = "asc") => {
  return [...recipes].sort((a, b) => {
    const comparison = (a.type || "").localeCompare(b.type || "");
    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Sort recipes by artisan skill
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortByArtisanSkill = (recipes, order = "asc") => {
  return [...recipes].sort((a, b) => {
    const aSkill = a.recipe?.artisanSkill || "";
    const bSkill = b.recipe?.artisanSkill || "";
    const comparison = aSkill.localeCompare(bSkill);
    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Sort recipes by gathering skill
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortByGatheringSkill = (recipes, order = "asc") => {
  return [...recipes].sort((a, b) => {
    const aSkill = a.gathering?.skill || "";
    const bSkill = b.gathering?.skill || "";
    const comparison = aSkill.localeCompare(bSkill);
    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Sort recipes by player level requirement
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortByPlayerLevel = (recipes, order = "asc") => {
  return [...recipes].sort((a, b) => {
    const aLevel = a.requirements?.playerLevel || 0;
    const bLevel = b.requirements?.playerLevel || 0;
    const comparison = aLevel - bLevel;
    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Sort recipes by artisan level requirement
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortByArtisanLevel = (recipes, order = "asc") => {
  return [...recipes].sort((a, b) => {
    const aLevel = a.requirements?.artisanLevel || 0;
    const bLevel = b.requirements?.artisanLevel || 0;
    const comparison = aLevel - bLevel;
    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Generic sort function that can sort by any field
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} field - Field to sort by (supports dot notation)
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortByField = (recipes, field, order = "asc") => {
  return [...recipes].sort((a, b) => {
    // Get nested field value using dot notation
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    const aValue = getNestedValue(a, field) || "";
    const bValue = getNestedValue(b, field) || "";

    let comparison;
    if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = aValue.toString().localeCompare(bValue.toString());
    }

    return order === "desc" ? -comparison : comparison;
  });
};

/**
 * Multi-level sort function
 * @param {Array} recipes - Array of recipes to sort
 * @param {Array} sortCriteria - Array of sort criteria objects
 * @returns {Array} Sorted recipes
 */
export const multiSort = (recipes, sortCriteria) => {
  return [...recipes].sort((a, b) => {
    for (const criteria of sortCriteria) {
      const { field, order = "asc" } = criteria;

      const getNestedValue = (obj, path) => {
        return path.split(".").reduce((current, key) => current?.[key], obj);
      };

      const aValue = getNestedValue(a, field) || "";
      const bValue = getNestedValue(b, field) || "";

      let comparison;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = aValue.toString().localeCompare(bValue.toString());
      }

      if (comparison !== 0) {
        return order === "desc" ? -comparison : comparison;
      }
    }
    return 0;
  });
};

/**
 * Predefined sort functions map for easy access
 */
export const sortFunctions = {
  name: sortByName,
  id: sortById,
  type: sortByType,
  artisanSkill: sortByArtisanSkill,
  gatheringSkill: sortByGatheringSkill,
  playerLevel: sortByPlayerLevel,
  artisanLevel: sortByArtisanLevel,
};

/**
 * Main sort function that routes to appropriate sorter
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
export const sortRecipes = (recipes, sortBy = "name", sortOrder = "asc") => {
  const sortFunction = sortFunctions[sortBy];

  if (sortFunction) {
    return sortFunction(recipes, sortOrder);
  }

  // Fallback to generic field sorting
  return sortByField(recipes, sortBy, sortOrder);
};

const sortingFunctions = {
  sortByName,
  sortById,
  sortByType,
  sortByArtisanSkill,
  sortByGatheringSkill,
  sortByPlayerLevel,
  sortByArtisanLevel,
  sortByField,
  multiSort,
  sortRecipes,
  sortFunctions,
};

export default sortingFunctions;
