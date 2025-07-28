import { VALID_RECIPE_TYPES, CACHE_DURATION } from "../constants.js";
import * as storageOperations from "../data/storageOperations.js";

/**
 * RECIPE QUERY SERVICE WITH COMPLETE CRUD OPERATIONS
 *
 * This module provides complete CRUD access to recipe data with optimized caching.
 * All write operations automatically invalidate relevant caches to maintain consistency.
 *
 * DATA FLOW:
 * JSON Files ↔ storageOperations ↔ Cache Layer ↔ Application Layer
 *
 * CACHING STRATEGY:
 * - Type-specific caches for optimal memory usage
 * - Automatic cache invalidation on write operations
 * - Cache warming for application initialization
 * - 5-minute cache duration for read operations
 */

// ==========================================
// CACHING CONFIGURATION
// ==========================================

/**
 * Type-specific recipe caches for optimized memory usage
 * Each cache stores flattened arrays for its respective recipe type
 */
const recipeCaches = {
  /**
   * Cache for raw component recipes
   * DATA: Flattened Array<RawComponentObject>
   * @type {Object|null} Cache object with data and timestamp
   */
  raw_components: {
    data: null,
    timestamp: null,
  },

  /**
   * Cache for intermediate recipe objects
   * DATA: Flattened Array<IntermediateRecipeObject>
   * @type {Object|null} Cache object with data and timestamp
   */
  intermediate_recipes: {
    data: null,
    timestamp: null,
  },

  /**
   * Cache for crafted item recipes
   * DATA: Flattened Array<CraftedItemObject>
   * @type {Object|null} Cache object with data and timestamp
   */
  crafted_items: {
    data: null,
    timestamp: null,
  },
};

/**
 * Global cache for all recipes combined
 * DATA: Flattened Array<RecipeObject> with all types
 * @type {Object|null} Cache object with combined recipe data
 */
const globalRecipeCache = {
  data: null,
  timestamp: null,
};

/**
 * Metadata cache for non-recipe data (skills, statistics)
 * DATA: Object with artisan_levels, gathering_skills, etc.
 * @type {Object|null} Cache object with metadata
 */
const metadataCache = {
  data: null,
  timestamp: null,
};

// ==========================================
// CACHE MANAGEMENT UTILITIES
// ==========================================

/**
 * Check if a specific cache is valid and fresh
 *
 * @function isCacheValid
 * @param {Object} cache - Cache object with data and timestamp
 * @returns {boolean} True if cache is valid and not expired
 */
const isCacheValid = (cache) => {
  if (!cache.data || !cache.timestamp) return false;
  const now = Date.now();
  return now - cache.timestamp < CACHE_DURATION;
};

/**
 * Update a specific cache with new data and current timestamp
 *
 * @function updateCache
 * @param {Object} cache - Cache object to update
 * @param {*} data - Data to store in cache
 */
const updateCache = (cache, data) => {
  cache.data = data;
  cache.timestamp = Date.now();
};

/**
 * Invalidate caches specific to a recipe type
 *
 * More efficient than invalidating all caches when only one type has changed.
 *
 * @function invalidateSpecificCaches
 * @param {string} type - Recipe type that was modified
 */
const invalidateSpecificCaches = (type) => {
  console.log(`🗑️ Invalidating caches for type: ${type}`);

  // Invalidate the specific type cache
  if (recipeCaches[type]) {
    recipeCaches[type].data = null;
    recipeCaches[type].timestamp = null;
  }

  // Invalidate global cache since it contains all types
  globalRecipeCache.data = null;
  globalRecipeCache.timestamp = null;

  // Statistics might have changed, so invalidate metadata cache
  metadataCache.data = null;
  metadataCache.timestamp = null;
};

/**
 * Invalidate all caches (force refresh on next access)
 *
 * OLD FUNCTION NAME: invalidateAllCaches (maintained for backward compatibility)
 *
 * Useful when multiple types have been modified or for complete cache reset.
 */
export const invalidateAllCaches = () => {
  console.log("🗑️ Invalidating all recipe caches");

  // Clear type-specific caches
  Object.keys(recipeCaches).forEach((type) => {
    recipeCaches[type].data = null;
    recipeCaches[type].timestamp = null;
  });

  // Clear global cache
  globalRecipeCache.data = null;
  globalRecipeCache.timestamp = null;

  // Clear metadata cache
  metadataCache.data = null;
  metadataCache.timestamp = null;
};

// ==========================================
// CORE DATA LOADING FUNCTIONS
// ==========================================

/**
 * Load and cache recipes for a specific type
 *
 * Loads recipes of a specific type from storage, flattens them, and caches the result.
 * Uses type-specific caching for optimal memory usage.
 *
 * DATA FLOW:
 * storageOperations.getRecipesByTypeFromStorage() → transformers.flattenRecipesByType() → Type Cache
 *
 * @async
 * @function loadAndCacheRecipesByType
 * @param {string} type - Recipe type ('raw_components', 'intermediate_recipes', 'crafted_items')
 * @returns {Promise<Array>} Flattened array of recipes for the specified type
 *
 * @example
 * const craftedItems = await loadAndCacheRecipesByType('crafted_items');
 */
const loadAndCacheRecipesByType = async (type) => {
  try {
    console.log(`📥 Loading ${type} recipes from storage`);

    // Load raw recipe data for specific type
    const rawRecipes = await storageOperations.getRecipesByTypeFromStorage(
      type
    );

    // Flatten the recipes and add type information
    const flattenedRecipes = rawRecipes.map((recipe) => ({
      ...recipe,
      type: type, // Add type field for consistency
    }));

    // Update type-specific cache
    updateCache(recipeCaches[type], flattenedRecipes);

    console.log(`✅ Cached ${flattenedRecipes.length} ${type} recipes`);
    return flattenedRecipes;
  } catch (error) {
    console.error(`❌ Error loading ${type} recipes:`, error);
    return [];
  }
};

/**
 * Load and cache all recipes combined
 *
 * Loads all recipe types, combines them into a single flattened array, and caches the result.
 * Uses individual type caches when available to avoid redundant loading.
 *
 * DATA FLOW:
 * Type Caches (if valid) OR storageOperations.getAllRecipesFromStorage() → Combine → Global Cache
 *
 * @async
 * @function loadAndCacheAllRecipes
 * @returns {Promise<Array>} Combined flattened array of all recipes
 */
const loadAndCacheAllRecipes = async () => {
  try {
    console.log("📥 Loading all recipes from storage");

    const allRecipes = [];
    const recipeTypes = VALID_RECIPE_TYPES; // ✅ Use constant instead of hardcoded array

    // Load each type (using individual caches when possible)
    for (const type of recipeTypes) {
      let typeRecipes;

      if (isCacheValid(recipeCaches[type])) {
        console.log(`🔍 Using cached ${type} recipes`);
        typeRecipes = recipeCaches[type].data;
      } else {
        typeRecipes = await loadAndCacheRecipesByType(type);
      }

      allRecipes.push(...typeRecipes);
    }

    // Update global cache
    updateCache(globalRecipeCache, allRecipes);

    console.log(`✅ Cached ${allRecipes.length} total recipes globally`);
    return allRecipes;
  } catch (error) {
    console.error("❌ Error loading all recipes:", error);
    return [];
  }
};

/**
 * Load and cache metadata (skills, statistics)
 *
 * Loads non-recipe metadata from storage and caches it separately.
 *
 * @async
 * @function loadAndCacheMetadata
 * @returns {Promise<Object>} Metadata object with skills and other info
 */
const loadAndCacheMetadata = async () => {
  try {
    console.log("📥 Loading metadata from storage");

    const allData = await storageOperations.getAllRecipesFromStorage();

    const metadata = {
      artisan_levels: allData.artisan_levels || [],
      gathering_skills: allData.gathering_skills || [],
      rawData: allData, // Keep reference to raw data for statistics
    };

    updateCache(metadataCache, metadata);

    console.log("✅ Cached recipe metadata");
    return metadata;
  } catch (error) {
    console.error("❌ Error loading metadata:", error);
    return {
      artisan_levels: [],
      gathering_skills: [],
      rawData: {},
    };
  }
};

// ==========================================
// PRIMARY QUERY FUNCTIONS
// ==========================================

/**
 * Get all recipes as flattened array with type information
 *
 * OLD FUNCTION NAME: getAllRecipes (maintained for backward compatibility)
 *
 * This is the main entry point for recipe data access. Uses global caching
 * for optimal performance when all recipes are needed.
 *
 * DATA FLOW:
 * 1. Check global cache validity
 * 2. If valid: return cached data immediately
 * 3. If invalid: load fresh data via loadAndCacheAllRecipes()
 *
 * @async
 * @function getAllRecipes
 * @returns {Promise<Array<Object>>} Flattened array of all recipes with type information
 *
 * @example
 * // Returns array like:
 * [
 *   {
 *     id: 4000,
 *     name: "Novice Iron Sword",
 *     description: "Basic sword crafted by weaponsmiths",
 *     type: "crafted_items",
 *     requirements: { artisan_level: 5, workstation: "weaponsmithing_bench" },
 *     recipe: { artisanSkill: "weaponsmithing", components: [...] }
 *   },
 *   // ... more recipes
 * ]
 */
export const getAllRecipes = async () => {
  try {
    // Check global cache first
    if (isCacheValid(globalRecipeCache)) {
      console.log("🔍 Returning cached all recipes");
      return globalRecipeCache.data;
    }

    // Load fresh data if cache invalid
    return await loadAndCacheAllRecipes();
  } catch (error) {
    console.error("❌ Error getting all recipes:", error);
    return [];
  }
};

/**
 * Get recipes by specific type with caching
 *
 * OLD FUNCTION NAME: getRecipesByType (maintained for backward compatibility)
 *
 * Retrieves recipes from a specific category using type-specific caching.
 * More memory efficient than getAllRecipes when you only need one type.
 *
 * DATA FLOW:
 * 1. Check type-specific cache validity
 * 2. If valid: return cached data for that type
 * 3. If invalid: load fresh data via loadAndCacheRecipesByType()
 *
 * @async
 * @function getRecipesByType
 * @param {string} type - Recipe type ('crafted_items', 'raw_components', 'intermediate_recipes')
 * @returns {Promise<Array<Object>>} Array of recipes of the specified type
 *
 * @example
 * // Get only crafted items (uses type-specific cache):
 * const craftedItems = await getRecipesByType('crafted_items');
 */
export const getRecipesByType = async (type) => {
  try {
    // Validate type using imported constants
    if (!VALID_RECIPE_TYPES.includes(type)) {
      throw new Error(
        `Invalid recipe type: ${type}. Valid types: ${VALID_RECIPE_TYPES.join(
          ", "
        )}`
      );
    }

    // Check type-specific cache
    if (isCacheValid(recipeCaches[type])) {
      console.log(`🔍 Returning cached ${type} recipes`);
      return recipeCaches[type].data;
    }

    // Load fresh data if cache invalid
    return await loadAndCacheRecipesByType(type);
  } catch (error) {
    console.error(`❌ Error getting recipes by type ${type}:`, error);
    return [];
  }
};

/**
 * Get a single recipe by its unique identifier
 *
 * OLD FUNCTION NAME: getRecipeById (maintained for backward compatibility)
 *
 * Performs ID-based lookup across all cached recipe types. Optimizes by checking
 * type-specific caches first, then falls back to global cache if needed.
 *
 * @async
 * @function getRecipeById
 * @param {number|string} id - Unique recipe identifier
 * @returns {Promise<Object|null>} Recipe object if found, null if not found
 *
 * @example
 * // Get specific recipe by ID:
 * const sword = await getRecipeById(4000);
 * if (sword) {
 *   console.log(`Found: ${sword.name} (type: ${sword.type})`);
 * } else {
 *   console.log('Recipe not found');
 * }
 */
export const getRecipeById = async (id) => {
  try {
    const searchId = String(id);

    // ✅ FIX: Use constant instead of hard-coded array
    const recipeTypes = VALID_RECIPE_TYPES; // Instead of ["raw_components", "intermediate_recipes", "crafted_items"]

    for (const type of recipeTypes) {
      if (isCacheValid(recipeCaches[type])) {
        const found = recipeCaches[type].data.find(
          (recipe) => String(recipe.id) === searchId
        );
        if (found) {
          console.log(`🔍 Found recipe ${id} in ${type} cache`);
          return found;
        }
      }
    }

    // If not found in type caches, check global cache
    if (isCacheValid(globalRecipeCache)) {
      const found = globalRecipeCache.data.find(
        (recipe) => String(recipe.id) === searchId
      );
      if (found) {
        console.log(`🔍 Found recipe ${id} in global cache`);
        return found;
      }
    }

    // If still not found, load fresh data and search
    console.log(`🔄 Recipe ${id} not in cache, loading fresh data`);
    const allRecipes = await getAllRecipes();
    return allRecipes.find((recipe) => String(recipe.id) === searchId) || null;
  } catch (error) {
    console.error(`❌ Error getting recipe by ID ${id}:`, error);
    return null;
  }
};

// ==========================================
// FILTERED QUERY FUNCTIONS
// ==========================================

/**
 * Filter recipes based on multiple criteria
 *
 * OLD FUNCTION NAME: filterRecipes (maintained for backward compatibility)
 *
 * Provides flexible filtering capabilities across all recipe types.
 * Uses cached data for optimal performance.
 *
 * @async
 * @function filterRecipes
 * @param {Object} criteria - Filter criteria object
 * @param {string} [criteria.type] - Filter by recipe type
 * @param {string} [criteria.name] - Filter by recipe name (case-insensitive partial match)
 * @param {string} [criteria.artisanSkill] - Filter by required artisan skill
 * @returns {Promise<Array<Object>>} Array of recipes matching all criteria
 */
export const filterRecipes = async (criteria) => {
  try {
    let baseRecipes;

    // Optimize by using type-specific cache if type filter is specified
    if (criteria.type) {
      baseRecipes = await getRecipesByType(criteria.type);
    } else {
      baseRecipes = await getAllRecipes();
    }

    let filteredRecipes = baseRecipes;

    // Apply name filter
    if (criteria.name) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }

    // Apply artisan skill filter
    if (criteria.artisanSkill) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.recipe?.artisanSkill === criteria.artisanSkill
      );
    }

    console.log(
      `🔍 Filtered ${baseRecipes.length} recipes to ${filteredRecipes.length} results`
    );
    return filteredRecipes;
  } catch (error) {
    console.error("❌ Error filtering recipes:", error);
    return [];
  }
};

/**
 * Get recipes that use a specific component as an ingredient
 *
 * OLD FUNCTION NAME: getRecipesByComponent (maintained for backward compatibility)
 *
 * Searches through all cached recipe components to find recipes that require
 * a specific ingredient. Uses global cache for comprehensive search.
 *
 * @async
 * @function getRecipesByComponent
 * @param {string} componentName - Name of the component to search for
 * @returns {Promise<Array<Object>>} Array of recipes that use the specified component
 *
 * @example
 * // Find all recipes that use Oak Wood:
 * const recipesUsingOak = await getRecipesByComponent('Oak Wood');
 */
export const getRecipesByComponent = async (componentName) => {
  try {
    const allRecipes = await getAllRecipes();

    const matchingRecipes = allRecipes.filter((recipe) =>
      recipe.recipe?.components?.some(
        (comp) => comp.name === componentName || comp.item === componentName
      )
    );

    console.log(
      `🔍 Found ${matchingRecipes.length} recipes using component "${componentName}"`
    );
    return matchingRecipes;
  } catch (error) {
    console.error(
      `❌ Error getting recipes by component ${componentName}:`,
      error
    );
    return [];
  }
};

// ==========================================
// METADATA QUERY FUNCTIONS
// ==========================================

/**
 * Get list of available artisan skills
 *
 * OLD FUNCTION NAME: getArtisanSkills (maintained for backward compatibility)
 *
 * Retrieves artisan skills from cached metadata.
 *
 * @async
 * @function getArtisanSkills
 * @returns {Promise<Array<string>>} Array of available artisan skill names
 */
export const getArtisanSkills = async () => {
  try {
    // Check metadata cache first
    if (isCacheValid(metadataCache)) {
      console.log("🔍 Returning cached artisan skills");
      return metadataCache.data.artisan_levels;
    }

    // Load fresh metadata if cache invalid
    const metadata = await loadAndCacheMetadata();
    return metadata.artisan_levels;
  } catch (error) {
    console.error("❌ Error getting artisan skills:", error);
    return [];
  }
};

/**
 * Get list of available gathering skills
 *
 * OLD FUNCTION NAME: getGatheringSkills (maintained for backward compatibility)
 *
 * Retrieves gathering skills from cached metadata.
 *
 * @async
 * @function getGatheringSkills
 * @returns {Promise<Array<string>>} Array of available gathering skill names
 */
export const getGatheringSkills = async () => {
  try {
    // Check metadata cache first
    if (isCacheValid(metadataCache)) {
      console.log("🔍 Returning cached gathering skills");
      return metadataCache.data.gathering_skills;
    }

    // Load fresh metadata if cache invalid
    const metadata = await loadAndCacheMetadata();
    return metadata.gathering_skills;
  } catch (error) {
    console.error("❌ Error getting gathering skills:", error);
    return [];
  }
};

// ==========================================
// ANALYTICS AND STATISTICS
// ==========================================

/**
 * Get comprehensive statistics about the recipe database
 *
 * OLD FUNCTION NAME: getStatistics (maintained for backward compatibility)
 *
 * Analyzes cached recipe data to provide insights about data distribution.
 * Uses type-specific caches for accurate counts.
 *
 * @async
 * @function getStatistics
 * @returns {Promise<Object>} Comprehensive statistics object
 */
export const getStatistics = async () => {
  try {
    // ✅ FIX: Use constant instead of hard-coded array
    const recipeTypes = VALID_RECIPE_TYPES; // Instead of ["raw_components", "intermediate_recipes", "crafted_items"]

    const stats = {
      totalRecipes: 0,
      byType: {},
      artisanSkills: 0,
      gatheringSkills: 0,
    };

    // Get counts from type-specific caches
    for (const type of recipeTypes) {
      const typeRecipes = await getRecipesByType(type);
      stats.byType[type] = typeRecipes.length;
      stats.totalRecipes += typeRecipes.length;
    }

    // Get skill counts from metadata
    const artisanSkills = await getArtisanSkills();
    const gatheringSkills = await getGatheringSkills();

    stats.artisanSkills = artisanSkills.length;
    stats.gatheringSkills = gatheringSkills.length;

    console.log(
      `📊 Statistics: ${stats.totalRecipes} total recipes across ${recipeTypes.length} types`
    );
    return stats;
  } catch (error) {
    console.error("❌ Error getting statistics:", error);
    return {
      totalRecipes: 0,
      byType: {
        raw_components: 0,
        intermediate_recipes: 0,
        crafted_items: 0,
      },
      artisanSkills: 0,
      gatheringSkills: 0,
    };
  }
};

// ==========================================
// CACHE WARMING AND MAINTENANCE
// ==========================================

/**
 * Pre-load all recipe caches
 *
 * Warms up all caches by loading recipe data proactively.
 * Useful for application initialization to ensure fast subsequent access.
 *
 * @async
 * @function warmAllCaches
 * @returns {Promise<Object>} Summary of cache warming results
 */
export const warmAllCaches = async () => {
  console.log("🔥 Warming all recipe caches...");

  try {
    const results = {
      metadata: false,
      raw_components: false,
      intermediate_recipes: false,
      crafted_items: false,
      global: false,
    };

    // Warm metadata cache
    await loadAndCacheMetadata();
    results.metadata = true;

    // ✅ FIX: Use constant instead of hard-coded array
    const recipeTypes = VALID_RECIPE_TYPES; // Instead of ["raw_components", "intermediate_recipes", "crafted_items"]

    for (const type of recipeTypes) {
      await loadAndCacheRecipesByType(type);
      results[type] = true;
    }

    // Warm global cache
    await loadAndCacheAllRecipes();
    results.global = true;

    console.log("✅ All caches warmed successfully");
    return results;
  } catch (error) {
    console.error("❌ Error warming caches:", error);
    return {
      metadata: false,
      raw_components: false,
      intermediate_recipes: false,
      crafted_items: false,
      global: false,
    };
  }
};

// ==========================================
// CREATE OPERATIONS (WRITE + CACHE INVALIDATION)
// ==========================================

/**
 * Add a new recipe to storage with automatic cache invalidation
 *
 * Creates a new recipe in the specified type category, persists to JSON files,
 * and invalidates relevant caches to maintain data consistency.
 *
 * @async
 * @function addRecipe
 * @param {string} type - Recipe type category to add to
 * @param {Object} recipe - Recipe object to add
 * @returns {Promise<Object>} Operation result with success status and data
 *
 * @example
 * const result = await addRecipe('crafted_items', {
 *   id: 5000,
 *   name: "Epic Dragon Sword",
 *   description: "Legendary weapon",
 *   requirements: { artisan_level: 50 },
 *   recipe: { artisanSkill: "weaponsmithing", components: [...] }
 * });
 */
export const addRecipe = async (type, recipe) => {
  try {
    console.log(`➕ Adding recipe "${recipe.name}" to ${type}`);

    // Perform the storage operation
    const result = await storageOperations.addRecipeToStorage(type, recipe);

    if (result.success) {
      // Invalidate relevant caches to maintain consistency
      console.log("🗑️ Invalidating caches after recipe addition");
      invalidateSpecificCaches(type);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error adding recipe:`, error);
    return {
      success: false,
      message: `Failed to add recipe: ${error.message}`,
      addedRecipe: null,
      updatedStorage: null,
    };
  }
};

// ==========================================
// UPDATE OPERATIONS (WRITE + CACHE INVALIDATION)
// ==========================================

/**
 * Update an existing recipe by ID with automatic cache invalidation
 *
 * Updates a recipe by type and ID, applies partial updates while preserving
 * existing data, and invalidates relevant caches.
 *
 * @async
 * @function updateRecipeById
 * @param {string} type - Recipe type category
 * @param {number|string} recipeId - Unique ID of recipe to update
 * @param {Object} updates - Partial updates to apply to the recipe
 * @returns {Promise<Object>} Operation result with success status and data
 *
 * @example
 * const result = await updateRecipeById('crafted_items', 4000, {
 *   description: "Updated description",
 *   requirements: { artisan_level: 25 }
 * });
 */
export const updateRecipeById = async (type, recipeId, updates) => {
  try {
    console.log(`📝 Updating recipe ID ${recipeId} in ${type}`);

    // First, find the recipe index by ID
    const recipeIndex = await findRecipeIndexById(type, recipeId);
    if (recipeIndex === -1) {
      return {
        success: false,
        message: `Recipe with ID ${recipeId} not found in ${type}`,
        updatedRecipe: null,
        updatedStorage: null,
      };
    }

    // Perform the storage operation using index
    const result = await storageOperations.updateRecipeInStorage(
      type,
      recipeIndex,
      updates
    );

    if (result.success) {
      // Invalidate relevant caches to maintain consistency
      console.log("🗑️ Invalidating caches after recipe update");
      invalidateSpecificCaches(type);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error updating recipe:`, error);
    return {
      success: false,
      message: `Failed to update recipe: ${error.message}`,
      updatedRecipe: null,
      updatedStorage: null,
    };
  }
};

/**
 * LEGACY: Update recipe by index (DEPRECATED)
 *
 * @deprecated Use updateRecipeById for ID-based updates
 * @async
 * @function updateRecipeByIndex
 */
export const updateRecipeByIndex = async (type, index, updates) => {
  try {
    console.log(
      `📝 [DEPRECATED] Updating recipe at ${type}[${index}] - Consider using ID-based update`
    );

    const result = await storageOperations.updateRecipeInStorage(
      type,
      index,
      updates
    );

    if (result.success) {
      invalidateSpecificCaches(type);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error updating recipe by index:`, error);
    return {
      success: false,
      message: `Failed to update recipe: ${error.message}`,
      updatedRecipe: null,
      updatedStorage: null,
    };
  }
};

// ==========================================
// DELETE OPERATIONS (WRITE + CACHE INVALIDATION)
// ==========================================

/**
 * Remove a recipe by ID with automatic cache invalidation
 *
 * Removes a recipe by type and ID, returns the deleted recipe for reference,
 * and invalidates relevant caches to maintain consistency.
 *
 * @async
 * @function removeRecipeById
 * @param {string} type - Recipe type category
 * @param {number|string} recipeId - Unique ID of recipe to remove
 * @returns {Promise<Object>} Operation result with success status and data
 *
 * @example
 * const result = await removeRecipeById('crafted_items', 4000);
 * if (result.success) {
 *   console.log(`Removed: ${result.deletedRecipe.name}`);
 * }
 */
export const removeRecipeById = async (type, recipeId) => {
  try {
    console.log(`🗑️ Removing recipe ID ${recipeId} from ${type}`);

    // Use the ID-based removal from storageOperations
    const result = await storageOperations.removeRecipeFromStorage(
      type,
      recipeId
    );

    if (result.success) {
      // Invalidate relevant caches to maintain consistency
      console.log("🗑️ Invalidating caches after recipe removal");
      invalidateSpecificCaches(type);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error removing recipe:`, error);
    return {
      success: false,
      message: `Failed to remove recipe: ${error.message}`,
      deletedRecipe: null,
      updatedStorage: null,
    };
  }
};

/**
 * LEGACY: Remove recipe by index (DEPRECATED)
 *
 * @deprecated Use removeRecipeById for ID-based removal
 * @async
 * @function removeRecipeByIndex
 */
export const removeRecipeByIndex = async (type, index) => {
  try {
    console.log(
      `🗑️ [DEPRECATED] Removing recipe at ${type}[${index}] - Consider using ID-based removal`
    );

    // ✅ FIX: Use existing updateRecipeInStorage instead
    // First get the recipe to find its ID
    const recipes = await getRecipesByType(type);
    if (index < 0 || index >= recipes.length) {
      return {
        success: false,
        message: `Recipe at index ${index} not found in ${type}`,
        deletedRecipe: null,
        updatedStorage: null,
      };
    }

    const recipeToDelete = recipes[index];
    const result = await storageOperations.removeRecipeFromStorage(
      type,
      recipeToDelete.id
    );

    if (result.success) {
      invalidateSpecificCaches(type);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error removing recipe by index:`, error);
    return {
      success: false,
      message: `Failed to remove recipe: ${error.message}`,
      deletedRecipe: null,
      updatedStorage: null,
    };
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Find the array index of a recipe by its ID within a specific type
 *
 * Helper function for operations that need to convert ID to index
 * for compatibility with index-based storage operations.
 *
 * @async
 * @function findRecipeIndexById
 * @param {string} type - Recipe type to search in
 * @param {number|string} recipeId - Recipe ID to find
 * @returns {Promise<number>} Array index of the recipe, or -1 if not found
 */
const findRecipeIndexById = async (type, recipeId) => {
  try {
    // Get recipes of the specified type (may use cache)
    const recipes = await getRecipesByType(type);

    // Find the index of the recipe with matching ID
    const index = recipes.findIndex(
      (recipe) =>
        recipe.id === recipeId ||
        recipe.id === String(recipeId) ||
        recipe.id === Number(recipeId)
    );

    return index;
  } catch (error) {
    console.error(`❌ Error finding recipe index for ID ${recipeId}:`, error);
    return -1;
  }
};

// ==========================================
// MODULE EXPORTS (EXPANDED)
// ==========================================

/**
 * Export all query functions including complete CRUD operations
 * Maintains backward compatibility with old function names
 */
const queriesModule = {
  // READ OPERATIONS (OLD FUNCTION NAMES MAINTAINED)
  getAllRecipes, // OLD: getAllRecipes
  getRecipesByType, // OLD: getRecipesByType
  getRecipeById, // OLD: getRecipeById
  filterRecipes, // OLD: filterRecipes
  getRecipesByComponent, // OLD: getRecipesByComponent

  // METADATA QUERIES (OLD FUNCTION NAMES MAINTAINED)
  getArtisanSkills, // OLD: getArtisanSkills
  getGatheringSkills, // OLD: getGatheringSkills
  getStatistics, // OLD: getStatistics

  // CREATE OPERATIONS (NEW)
  addRecipe, // NEW: addRecipe (with cache invalidation)

  // UPDATE OPERATIONS (NEW)
  updateRecipeById, // NEW: updateRecipeById (ID-based with cache invalidation)
  updateRecipeByIndex, // LEGACY: updateRecipeByIndex (deprecated)

  // DELETE OPERATIONS (NEW)
  removeRecipeById, // NEW: removeRecipeById (ID-based with cache invalidation)
  removeRecipeByIndex, // LEGACY: removeRecipeByIndex (deprecated)

  // CACHE MANAGEMENT
  invalidateAllCaches, // OLD: invalidateAllCaches
  invalidateSpecificCaches, // NEW: invalidateSpecificCaches
  warmAllCaches, // OLD: warmAllCaches
};

export default queriesModule;
