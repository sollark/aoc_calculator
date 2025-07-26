import * as transformers from "./transformers.js";
import * as filters from "./filters.js";
import * as sorting from "./sorting.js";
import * as fileOps from "./jsonFileOperations.js";

/**
 * Recipe query operations - read-only functions
 */

/**
 * Get all recipes of a specific type
 * @param {string} type - Recipe type
 * @returns {Promise<Array>} Array of recipes of the specified type
 */
export const getRecipesByType = async (type) => {
  try {
    console.log(`Getting recipes by type: ${type}`);
    const recipes = await fileOps.readRecipes();

    if (!recipes || !recipes[type]) {
      console.warn(`No recipes found for type: ${type}`);
      return [];
    }

    const recipesWithType = recipes[type].map((recipe) => ({
      ...recipe,
      type: type,
    }));

    console.log(`Found ${recipesWithType.length} recipes of type ${type}`);
    return recipesWithType;
  } catch (error) {
    console.error(`Error getting recipes by type ${type}:`, error);
    return [];
  }
};

/**
 * Get all recipes as flattened array with type information
 * @returns {Promise<Array>} Array of all recipes
 */
export const getAllRecipes = async () => {
  try {
    console.log("Getting all recipes");
    const recipes = await fileOps.readRecipes();
    const flattened = transformers.flattenRecipes(recipes);
    console.log(`Found ${flattened.length} total recipes`);
    return flattened;
  } catch (error) {
    console.error("Error getting all recipes:", error);
    return [];
  }
};

/**
 * Get recipe by ID
 * @param {number} id - Recipe ID
 * @returns {Promise<Object|null>} Recipe object or null if not found
 */
export const getRecipeById = async (id) => {
  try {
    const allRecipes = await getAllRecipes();
    const recipe = allRecipes.find((recipe) => recipe.id === id);

    if (!recipe) {
      console.warn(`Recipe with ID ${id} not found`);
      return null;
    }

    return recipe;
  } catch (error) {
    console.error(`Error getting recipe by ID ${id}:`, error);
    return null;
  }
};

/**
 * Get recipes that use a specific component
 * @param {number} componentId - Component ID to search for
 * @returns {Promise<Array>} Recipes that use this component
 */
export const getRecipesByComponent = async (componentId) => {
  try {
    console.log(`Finding recipes that use component ID: ${componentId}`);
    const allRecipes = await getAllRecipes();
    const recipesUsingComponent = allRecipes.filter((recipe) =>
      recipe.recipe?.components?.some(
        (component) => component.id === componentId
      )
    );

    console.log(
      `Found ${recipesUsingComponent.length} recipes using component ${componentId}`
    );
    return recipesUsingComponent;
  } catch (error) {
    console.error("Error finding recipes by component:", error);
    return [];
  }
};

/**
 * Filter recipes by various criteria
 * @param {Object} filterCriteria - Filtering options
 * @returns {Promise<Array>} Filtered recipes
 */
export const filterRecipes = async (filterCriteria = {}) => {
  try {
    console.log("Filtering recipes with criteria:", filterCriteria);
    const allRecipes = await getAllRecipes();

    if (Object.keys(filterCriteria).length === 0) {
      return allRecipes;
    }

    const filterFunction = filters.createFilterFunction(filterCriteria);
    const filtered = allRecipes.filter(filterFunction);

    console.log(`Filtered to ${filtered.length} recipes`);
    return filtered;
  } catch (error) {
    console.error("Error filtering recipes:", error);
    return [];
  }
};

/**
 * Search recipes with advanced options
 * @param {Object} searchOptions - Search criteria and options
 * @returns {Promise<Object>} Search results with metadata
 */
export const searchRecipes = async (searchOptions = {}) => {
  const {
    filters: filterCriteria,
    sortBy = "name",
    sortOrder = "asc",
    limit,
    offset = 0,
  } = searchOptions;

  let results = await filterRecipes(filterCriteria || {});

  // Use dedicated sorting service
  if (sortBy) {
    results = sorting.sortRecipes(results, sortBy, sortOrder);
  }

  const total = results.length;

  if (limit) {
    results = results.slice(offset, offset + limit);
  }

  return {
    results: results.map(transformers.transformForResponse),
    metadata: {
      total,
      limit,
      offset,
      hasMore: limit && offset + limit < total,
    },
  };
};
