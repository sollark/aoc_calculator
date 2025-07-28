import * as queries from "./core/queries.js";
import * as calculations from "./core/calculations.js";
import * as utilities from "./core/utilities.js";

/**
 * Create recipe service functions
 *
 * This service acts as a facade/interface layer that provides access to recipe data and operations.
 * It coordinates between different core modules to provide a unified API for recipe management.
 *
 * @returns {Object} Recipe service functions organized by operation type
 */
export const createRecipeServiceFunctions = () => {
  console.log("Creating recipe service functions...");

  // Initialize calculation service with recipe service instance
  const recipeServiceInstance = {
    getAllRecipes: queries.getAllRecipes,
    getRecipesByType: queries.getRecipesByType,
    getRecipeById: queries.getRecipeById,
  };

  // Initialize the calculation service
  calculations.initializeCalculationService(recipeServiceInstance);

  return {
    // ==========================================
    // SERVICE INITIALIZATION
    // ==========================================
    /**
     * Initialize the recipe service and load data
     * DATA: Initializes JSON file reading and caching
     * INPUT: None
     * OUTPUT: Service initialization status
     *
     * @function initialize
     * @returns {Promise<boolean>} Success status of initialization
     */
    initialize: utilities.initializeService,

    // ==========================================
    // QUERY OPERATIONS (READ-ONLY)
    // Work with: JSON database files → Array of Objects
    // ==========================================

    /**
     * Get all available recipes from the database
     * DATA: JSON file → Array<RecipeObject>
     * INPUT: None
     * OUTPUT: Array of recipe objects with {id, name, description, requirements, recipe, type}
     * @function getAllRecipes
     * @returns {Promise<Array<Object>>} All recipes from JSON database
     */
    getAllRecipes: queries.getAllRecipes,

    /**
     * Filter recipes by type (e.g., 'weapon', 'armor', 'consumable')
     * DATA: JSON file → Filtered Array<RecipeObject>
     * INPUT: String (recipe type)
     * OUTPUT: Array of recipe objects matching the type
     * @function getRecipesByType
     * @param {string} type - Recipe type to filter by
     * @returns {Promise<Array<Object>>} Array of recipes matching the specified type
     */
    getRecipesByType: queries.getRecipesByType,

    /**
     * Get single recipe by unique ID
     * DATA: JSON file → Single RecipeObject
     * INPUT: Recipe ID (number or string)
     * OUTPUT: Single recipe object or null if not found
     * @function getRecipeById
     * @param {number|string} id - Recipe ID to find
     * @returns {Promise<Object|null>} Recipe object or null if not found
     */
    getRecipeById: queries.getRecipeById,

    /**
     * Filter recipes based on multiple criteria
     * DATA: JSON file → Filtered Array<RecipeObject>
     * INPUT: Filter criteria object
     * OUTPUT: Array of recipes matching all criteria
     * @function filterRecipes
     * @param {Object} criteria - Filter criteria object
     * @returns {Promise<Array<Object>>} Filtered recipes array
     */
    filterRecipes: queries.filterRecipes,

    /**
     * Find recipes that use a specific component
     * DATA: JSON file → Filtered Array<RecipeObject>
     * INPUT: Component name string
     * OUTPUT: Array of recipes that require the specified component
     * @function getRecipesByComponent
     * @param {string} componentName - Name of component to search for
     * @returns {Promise<Array<Object>>} Recipes using the specified component
     */
    getRecipesByComponent: queries.getRecipesByComponent,

    /**
     * Get list of available artisan skills
     * DATA: JSON file → Array<String>
     * INPUT: None
     * OUTPUT: Array of unique artisan skill names
     * @function getArtisanSkills
     * @returns {Promise<Array<string>>} Unique artisan skills array
     */
    getArtisanSkills: queries.getArtisanSkills,

    /**
     * Get list of available gathering skills
     * DATA: JSON file → Array<String>
     * INPUT: None
     * OUTPUT: Array of unique gathering skill names
     * @function getGatheringSkills
     * @returns {Promise<Array<string>>} Unique gathering skills array
     */
    getGatheringSkills: queries.getGatheringSkills,

    /**
     * Get statistical information about the recipe database
     * DATA: JSON file → Statistics Object
     * INPUT: None
     * OUTPUT: Object with counts, averages, and other stats
     * @function getStatistics
     * @returns {Promise<Object>} Statistics object with database metrics
     */
    getStatistics: queries.getStatistics,

    // ==========================================
    // MUTATION OPERATIONS (WRITE)
    // Work with: Array<Object> → Modified Array<Object>
    // Note: These don't modify JSON files, only runtime data
    // ==========================================

    /**
     * Add a new recipe to the runtime recipe collection
     * DATA: Array<RecipeObject> → Array<RecipeObject> (with new item)
     * INPUT: Single recipe object
     * OUTPUT: Updated array with new recipe added
     * @function addRecipe
     * @param {string} type - Recipe type category
     * @param {Object} recipe - Recipe object to add
     * @returns {Promise<Object>} Result object with success/failure info
     */
    addRecipe: queries.addRecipe, // ✅ REPLACE: mutations.addRecipe → queries.addRecipe

    /**
     * Update an existing recipe in the runtime collection
     * DATA: Array<RecipeObject> → Array<RecipeObject> (with modified item)
     * INPUT: Recipe ID and updated recipe object
     * OUTPUT: Updated array with modified recipe
     * @function updateRecipe
     * @param {number|string} id - Recipe ID to update
     * @param {Object} updatedRecipe - New recipe data
     * @returns {Promise<Object>} Result object with success/failure info
     */
    updateRecipe: queries.updateRecipeById, // ✅ REPLACE: mutations.updateRecipe → queries.updateRecipeById

    /**
     * Remove a recipe from the runtime collection
     * DATA: Array<RecipeObject> → Array<RecipeObject> (without deleted item)
     * INPUT: Recipe ID
     * OUTPUT: Updated array without the deleted recipe
     * @function deleteRecipe
     * @param {number|string} id - Recipe ID to delete
     * @returns {Promise<Object>} Result object with success/failure info
     */
    deleteRecipe: queries.removeRecipeById, // ✅ REPLACE: mutations.deleteRecipe → queries.removeRecipeById

    // ==========================================
    // CALCULATION OPERATIONS
    // Work with: Array<Object> → Calculated Results
    // ==========================================

    /**
     * Calculate total raw components needed for a recipe list
     * DATA: Array<RecipeObjects> → Array<ComponentObjects>
     * INPUT: Array of recipe objects with quantities
     * OUTPUT: Consolidated array of raw components with total quantities
     * @function processRecipeListToRawComponents
     * @param {Array<Object>} recipeList - List of recipes with quantities
     * @returns {Promise<Array<Object>>} Consolidated raw components
     */
    processRecipeListToRawComponents:
      calculations.processRecipeListToRawComponents,

    /**
     * Add a single recipe to an existing recipe list
     * DATA: Array<RecipeObjects> → Array<RecipeObjects> (with new item)
     * INPUT: Current recipe list and new recipe to add
     * OUTPUT: Updated recipe list with new recipe included
     * @function addRecipeToList
     * @param {Array<Object>} currentList - Current recipe list
     * @param {Object} recipeToAdd - Recipe to add to the list
     * @param {number} quantity - Quantity to add (default: 1)
     * @returns {Promise<Array<Object>>} Updated recipe list
     */
    addRecipeToList: calculations.addRecipeToList,

    /**
     * Break down a single recipe into its raw component parts
     * DATA: Single RecipeObject → Array<ComponentObjects>
     * INPUT: Single recipe object
     * OUTPUT: Array of raw components needed for the recipe
     * @function breakDownToRawComponents
     * @param {Object} recipe - Recipe to break down
     * @returns {Promise<Array<Object>>} Raw components for the recipe
     */
    breakDownToRawComponents: calculations.breakDownToRawComponents,

    /**
     * Remove a recipe from the recipe list
     * @function removeRecipeFromList
     * @param {Array<Object>} currentList - Current recipe list
     * @param {number|string} recipeId - ID of recipe to remove
     * @returns {Array<Object>} Updated recipe list
     */
    removeRecipeFromList: calculations.removeRecipeFromList,

    /**
     * Update recipe quantity in the list
     * @function updateRecipeQuantityInList
     * @param {Array<Object>} currentList - Current recipe list
     * @param {number|string} recipeId - ID of recipe to update
     * @param {number} newQuantity - New quantity
     * @returns {Array<Object>} Updated recipe list
     */
    updateRecipeQuantityInList: calculations.updateRecipeQuantityInList,

    /**
     * Get total recipe count in the list
     * @function getTotalRecipeCount
     * @param {Array<Object>} recipeList - Recipe list to count
     * @returns {number} Total number of individual recipes
     */
    getTotalRecipeCount: calculations.getTotalRecipeCount,

    /**
     * Clear the recipe list
     * @function clearRecipeList
     * @returns {Array} Empty array
     */
    clearRecipeList: calculations.clearRecipeList,

    // ==========================================
    // CACHE MANAGEMENT
    // ==========================================

    /**
     * Invalidate all caches to force fresh data loading
     * @function invalidateAllCaches
     * @returns {void}
     */
    invalidateAllCaches: queries.invalidateAllCaches,

    /**
     * Pre-warm all caches for optimal performance
     * @function warmAllCaches
     * @returns {Promise<Object>} Cache warming results
     */
    warmAllCaches: queries.warmAllCaches,
  };
};

export default createRecipeServiceFunctions;
