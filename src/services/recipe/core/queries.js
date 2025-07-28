import * as transformers from "../processing/transformers.js";
import * as storage from "../data/storage.js";

/**
 * RECIPE QUERY SERVICE
 *
 * This module provides read-only access to recipe data with caching optimization.
 * It handles data retrieval from JSON files, applies transformations, and implements
 * intelligent caching to improve performance for frequently accessed recipe data.
 *
 * DATA FLOW:
 * JSON Files → storage.readRecipes() → transformers.flattenRecipes() → Cache → Return Data
 *
 * CACHING STRATEGY:
 * - Caches flattened recipe arrays in memory for 1 minute
 * - Reduces file I/O operations for repeated requests
 * - Automatically invalidates and refreshes stale cache data
 */

// ==========================================
// CACHING CONFIGURATION
// ==========================================

/**
 * In-memory cache for storing processed recipe data
 * DATA: Flattened Array<RecipeObject> from JSON transformation
 * @type {Array<Object>|null} Cached recipe array or null if not cached
 */
let cachedRecipes = null;

/**
 * Timestamp of when the cache was last populated
 * Used to determine if cached data is still fresh
 * @type {number|null} Unix timestamp in milliseconds or null if no cache
 */
let cacheTimestamp = null;

/**
 * Cache validity duration in milliseconds (1 minute)
 * After this time, cached data is considered stale and will be refreshed
 * @type {number} Cache duration in milliseconds
 */
const CACHE_DURATION = 60000; // Cache for 1 minute

// ==========================================
// PRIMARY QUERY FUNCTIONS
// ==========================================

/**
 * Get all recipes as flattened array with type information
 *
 * This is the main entry point for recipe data access. It implements intelligent
 * caching to optimize performance while ensuring data freshness.
 *
 * DATA FLOW:
 * 1. Check cache validity (timestamp + duration)
 * 2. If cache valid: return cached data immediately
 * 3. If cache invalid/empty:
 *    - Read raw JSON data via storage.readRecipes()
 *    - Transform nested structure to flat array via transformers.flattenRecipes()
 *    - Cache results with current timestamp
 *    - Return processed data
 *
 * INPUT: None
 * OUTPUT: Array of recipe objects with standardized structure
 * DATA: JSON files → Cached Array<RecipeObject>
 *
 * @async
 * @function getAllRecipes
 * @returns {Promise<Array<Object>>} Flattened array of all recipes
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
    // ==========================================
    // CACHE VALIDATION CHECK
    // ==========================================
    const now = Date.now();
    const isCacheValid =
      cachedRecipes && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION;

    if (isCacheValid) {
      console.log("🔍 Returning cached recipes");
      return cachedRecipes;
    }

    // ==========================================
    // FRESH DATA RETRIEVAL AND PROCESSING
    // ==========================================
    console.log("Getting all recipes");

    // Step 1: Read raw JSON data from files
    // DATA: JSON files → Raw nested object structure
    const recipes = await storage.readRecipes();

    // Step 2: Transform nested structure to flat array
    // DATA: Nested objects → Flattened Array<RecipeObject>
    const flattened = transformers.flattenRecipes(recipes);

    // ==========================================
    // CACHE UPDATE
    // ==========================================
    // Store processed data in memory cache
    cachedRecipes = flattened;
    cacheTimestamp = now;

    console.log(`Found ${flattened.length} total recipes`);
    return flattened;
  } catch (error) {
    console.error("Error getting all recipes:", error);
    // Return empty array on error to prevent application crashes
    return [];
  }
};

/**
 * Filter recipes based on multiple criteria
 *
 * Provides flexible filtering capabilities for recipe searches. Applies multiple
 * filter conditions using AND logic (all conditions must match).
 *
 * DATA FLOW:
 * 1. Get all recipes via getAllRecipes() (may use cache)
 * 2. Apply each filter criterion sequentially
 * 3. Return filtered subset
 *
 * INPUT: Object with filter criteria
 * OUTPUT: Filtered Array<RecipeObject>
 * DATA: Cached Array<RecipeObject> → Filtered Array<RecipeObject>
 *
 * @async
 * @function filterRecipes
 * @param {Object} criteria - Filter criteria object
 * @param {string} [criteria.type] - Filter by recipe type (e.g., 'crafted_items', 'raw_components')
 * @param {string} [criteria.name] - Filter by recipe name (case-insensitive partial match)
 * @param {string} [criteria.artisanSkill] - Filter by required artisan skill
 * @returns {Promise<Array<Object>>} Array of recipes matching all criteria
 *
 * @example
 * // Filter for weapon recipes:
 * const weapons = await filterRecipes({
 *   type: 'crafted_items',
 *   artisanSkill: 'weaponsmithing'
 * });
 *
 * @example
 * // Search by name:
 * const swords = await filterRecipes({
 *   name: 'sword'
 * });
 */
export const filterRecipes = async (criteria) => {
  try {
    // Get base dataset (may return cached data)
    const allRecipes = await getAllRecipes();

    // Start with full dataset, apply filters sequentially
    let filteredRecipes = allRecipes;

    // ==========================================
    // TYPE FILTER
    // ==========================================
    if (criteria.type) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.type === criteria.type
      );
    }

    // ==========================================
    // NAME FILTER (Case-insensitive partial match)
    // ==========================================
    if (criteria.name) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }

    // ==========================================
    // ARTISAN SKILL FILTER
    // ==========================================
    if (criteria.artisanSkill) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.recipe?.artisanSkill === criteria.artisanSkill
      );
    }

    return filteredRecipes;
  } catch (error) {
    console.error("Error filtering recipes:", error);
    return [];
  }
};

/**
 * Get recipes by specific type category
 *
 * Retrieves recipes from a specific category without flattening. This provides
 * direct access to the nested JSON structure for a particular recipe type.
 *
 * DATA FLOW:
 * JSON files → storage.readRecipes() → Extract specific type → Return subset
 *
 * INPUT: String (recipe type)
 * OUTPUT: Array<RecipeObject> for that specific type
 * DATA: JSON files → Raw nested object → Type-specific Array<RecipeObject>
 *
 * @async
 * @function getRecipesByType
 * @param {string} type - Recipe type to retrieve ('crafted_items', 'raw_components', 'intermediate_recipes')
 * @returns {Promise<Array<Object>>} Array of recipes of the specified type
 *
 * @example
 * // Get only crafted items:
 * const craftedItems = await getRecipesByType('crafted_items');
 *
 * @example
 * // Get raw components:
 * const rawComponents = await getRecipesByType('raw_components');
 */
export const getRecipesByType = async (type) => {
  try {
    // Read raw nested JSON structure (bypasses flattening)
    const recipes = await storage.readRecipes();

    // Extract specific type array or return empty array if type doesn't exist
    return recipes[type] || [];
  } catch (error) {
    console.error(`Error getting recipes by type ${type}:`, error);
    return [];
  }
};

/**
 * Get a single recipe by its unique identifier
 *
 * Performs ID-based lookup in the flattened recipe dataset. Uses the cached
 * data when available for optimal performance.
 *
 * DATA FLOW:
 * Cached/Fresh Array<RecipeObject> → Array.find(id match) → Single Object or null
 *
 * INPUT: Number (unique recipe ID)
 * OUTPUT: Single RecipeObject or null if not found
 * DATA: Cached Array<RecipeObject> → Single RecipeObject or null
 *
 * @async
 * @function getRecipeById
 * @param {number} id - Unique recipe identifier
 * @returns {Promise<Object|null>} Recipe object if found, null if not found
 *
 * @example
 * // Get specific recipe:
 * const sword = await getRecipeById(4000);
 * if (sword) {
 *   console.log(`Found: ${sword.name}`);
 * } else {
 *   console.log('Recipe not found');
 * }
 */
export const getRecipeById = async (id) => {
  try {
    // Get all recipes (uses cache when available)
    const allRecipes = await getAllRecipes();

    // Find recipe with matching ID
    return allRecipes.find((recipe) => recipe.id === id) || null;
  } catch (error) {
    console.error(`Error getting recipe by ID ${id}:`, error);
    return null;
  }
};

// ==========================================
// SPECIALIZED QUERY FUNCTIONS
// ==========================================

/**
 * Get recipes that use a specific component as an ingredient
 *
 * Searches through all recipe components to find recipes that require
 * a specific ingredient. Useful for finding what can be made with available materials.
 *
 * DATA FLOW:
 * Cached Array<RecipeObject> → Filter by component requirements → Matching Array<RecipeObject>
 *
 * INPUT: String (component/ingredient name)
 * OUTPUT: Array<RecipeObject> that use the component
 * DATA: Cached Array<RecipeObject> → Filtered Array<RecipeObject>
 *
 * @async
 * @function getRecipesByComponent
 * @param {string} componentName - Name of the component to search for
 * @returns {Promise<Array<Object>>} Array of recipes that use the specified component
 *
 * @example
 * // Find all recipes that use Oak Wood:
 * const recipesUsingOak = await getRecipesByComponent('Oak Wood');
 * // Returns recipes like "Oak Timber", "Novice Hunting Bow", etc.
 */
export const getRecipesByComponent = async (componentName) => {
  try {
    const allRecipes = await getAllRecipes();

    // Filter recipes that have the component in their requirements
    return allRecipes.filter((recipe) =>
      recipe.recipe?.components?.some(
        (comp) => comp.name === componentName || comp.item === componentName
      )
    );
  } catch (error) {
    console.error(
      `Error getting recipes by component ${componentName}:`,
      error
    );
    return [];
  }
};

/**
 * Get list of available artisan skills from the database
 *
 * Retrieves the complete list of artisan skills defined in the JSON data.
 * Artisan skills represent crafting professions like weaponsmithing, armorsmithing, etc.
 *
 * DATA FLOW:
 * JSON files → storage.readRecipes() → Extract artisan_levels array → Return skills
 *
 * INPUT: None
 * OUTPUT: Array<String> of artisan skill names
 * DATA: JSON files → Raw nested object → Array<String>
 *
 * @async
 * @function getArtisanSkills
 * @returns {Promise<Array<string>>} Array of available artisan skill names
 *
 * @example
 * // Get all artisan skills:
 * const skills = await getArtisanSkills();
 * // Returns: ['weaponsmithing', 'armorsmithing', 'bowcraft', etc.]
 */
export const getArtisanSkills = async () => {
  try {
    const recipes = await storage.readRecipes();
    return recipes.artisan_levels || [];
  } catch (error) {
    console.error("Error getting artisan skills:", error);
    return [];
  }
};

/**
 * Get list of available gathering skills from the database
 *
 * Retrieves the complete list of gathering skills defined in the JSON data.
 * Gathering skills represent resource collection activities like mining, woodcutting, etc.
 *
 * DATA FLOW:
 * JSON files → storage.readRecipes() → Extract gathering_skills array → Return skills
 *
 * INPUT: None
 * OUTPUT: Array<String> of gathering skill names
 * DATA: JSON files → Raw nested object → Array<String>
 *
 * @async
 * @function getGatheringSkills
 * @returns {Promise<Array<string>>} Array of available gathering skill names
 *
 * @example
 * // Get all gathering skills:
 * const skills = await getGatheringSkills();
 * // Returns: ['mining', 'woodcutting', 'foraging', etc.]
 */
export const getGatheringSkills = async () => {
  try {
    const recipes = await storage.readRecipes();
    return recipes.gathering_skills || [];
  } catch (error) {
    console.error("Error getting gathering skills:", error);
    return [];
  }
};

// ==========================================
// ANALYTICS AND STATISTICS
// ==========================================

/**
 * Get comprehensive statistics about the recipe database
 *
 * Analyzes the complete recipe dataset to provide insights about data distribution,
 * counts by category, and other useful metrics for application dashboards or debugging.
 *
 * DATA FLOW:
 * JSON files → storage.readRecipes() + transformers.flattenRecipes() → Calculate stats → Statistics Object
 *
 * INPUT: None
 * OUTPUT: Object with statistical information
 * DATA: JSON files → Raw + Flattened data → Statistics Object
 *
 * @async
 * @function getStatistics
 * @returns {Promise<Object>} Comprehensive statistics object
 * @returns {number} returns.totalRecipes - Total number of recipes across all types
 * @returns {Object} returns.byType - Recipe counts broken down by type
 * @returns {number} returns.byType.raw_components - Count of raw component recipes
 * @returns {number} returns.byType.intermediate_recipes - Count of intermediate recipes
 * @returns {number} returns.byType.crafted_items - Count of final crafted item recipes
 * @returns {number} returns.artisanSkills - Number of available artisan skills
 * @returns {number} returns.gatheringSkills - Number of available gathering skills
 *
 * @example
 * // Get database statistics:
 * const stats = await getStatistics();
 * console.log(`Total recipes: ${stats.totalRecipes}`);
 * console.log(`Crafted items: ${stats.byType.crafted_items}`);
 * console.log(`Artisan skills: ${stats.artisanSkills}`);
 */
export const getStatistics = async () => {
  try {
    // Get both raw and processed data for comprehensive analysis
    const recipes = await storage.readRecipes();
    const allRecipes = transformers.flattenRecipes(recipes);

    return {
      // Total count from flattened array
      totalRecipes: allRecipes.length,

      // Breakdown by original JSON structure categories
      byType: {
        raw_components: recipes.raw_components?.length || 0,
        intermediate_recipes: recipes.intermediate_recipes?.length || 0,
        crafted_items: recipes.crafted_items?.length || 0,
      },

      // Skill system metrics
      artisanSkills: recipes.artisan_levels?.length || 0,
      gatheringSkills: recipes.gathering_skills?.length || 0,
    };
  } catch (error) {
    console.error("Error getting statistics:", error);
    // Return safe default structure on error
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
