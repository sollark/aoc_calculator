import { createContext, useContext, useState, useEffect } from "react";

/**
 * React Context for managing and sharing recipe data and services across components
 *
 * This context provides a centralized way to:
 * - Load and cache all available recipes
 * - Share recipe service functions across the component tree
 * - Manage loading states and error handling for recipe operations
 * - Provide state management utilities for recipe list operations
 *
 * @example
 * // In your app root:
 * <RecipeProvider recipeService={recipeService} stateManagers={stateManagers}>
 *   <App />
 * </RecipeProvider>
 *
 * // In any child component:
 * const { availableRecipes, isLoading, recipeService } = useRecipeContext();
 */
const RecipeContext = createContext();

/**
 * Provider component that makes recipe data and services available to child components
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to the context
 * @param {Object} props.recipeService - Recipe service object containing data access methods
 * @param {Function} props.recipeService.getAllRecipes - Function to fetch all available recipes
 * @param {Function} props.recipeService.getRecipesByType - Function to filter recipes by type
 * @param {Function} props.recipeService.getRecipeById - Function to get a specific recipe by ID
 * @param {Object} props.stateManagers - State management utilities for recipe operations
 * @param {Object} props.stateManagers.recipeList - Recipe list management functions
 * @param {Function} props.stateManagers.recipeList.addRecipe - Function to add recipe to list
 * @param {Function} props.stateManagers.recipeList.removeRecipe - Function to remove recipe from list
 * @param {Object} props.stateManagers.rawComponents - Raw components management functions
 * @param {Object} props.stateManagers.appState - Application state management functions
 *
 * @returns {JSX.Element} Provider component wrapping children with recipe context
 *
 * @example
 * <RecipeProvider
 *   recipeService={createRecipeServiceFunctions()}
 *   stateManagers={createStateManagers(...)}>
 *   <RecipeManagement />
 *   <ComponentCalculator />
 * </RecipeProvider>
 */
export const RecipeProvider = ({ children, recipeService, stateManagers }) => {
  /**
   * State for storing all available recipes loaded from the service
   * @type {Array<Object>} Array of recipe objects with id, name, description, requirements, recipe properties
   */
  const [availableRecipes, setAvailableRecipes] = useState([]);

  /**
   * Loading state indicator for recipe data fetching operations
   * @type {boolean} True when recipes are being loaded, false when complete
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Error state for handling recipe loading failures
   * @type {string|null} Error message if loading failed, null if no error
   */
  const [error, setError] = useState(null);

  /**
   * Effect hook to load all recipes when the component mounts or recipeService changes
   *
   * Handles the complete lifecycle of recipe loading:
   * - Sets loading state to true
   * - Calls recipeService.getAllRecipes()
   * - Updates availableRecipes state with fetched data
   * - Handles errors and sets appropriate error state
   * - Sets loading state to false when complete
   *
   * @dependency {Object} recipeService - Triggers reload when service changes
   */
  useEffect(() => {
    /**
     * Async function to fetch recipes from the service
     *
     * @async
     * @function loadRecipes
     * @returns {Promise<void>} Promise that resolves when recipes are loaded
     *
     * @throws {Error} When recipe service is unavailable or fetch operation fails
     */
    const loadRecipes = async () => {
      // Guard clause: ensure recipe service is available
      if (!recipeService?.getAllRecipes) {
        setIsLoading(true);
        return;
      }

      try {
        // Set loading state and clear any previous errors
        setIsLoading(true);
        setError(null);

        // Fetch recipes from the service
        const recipes = await recipeService.getAllRecipes();

        // Validate and set recipes (ensure it's always an array)
        setAvailableRecipes(Array.isArray(recipes) ? recipes : []);
      } catch (err) {
        // Log error for debugging and set user-friendly error state
        console.error("Error loading recipes:", err);
        setError(err.message);
        setAvailableRecipes([]); // Reset to empty array on error
      } finally {
        // Always set loading to false, regardless of success or failure
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [recipeService]); // Re-run when recipeService changes

  /**
   * Context value object containing all recipe-related data and services
   *
   * @type {Object} contextValue
   * @property {Array<Object>} availableRecipes - All recipes loaded from the service
   * @property {boolean} isLoading - Current loading state of recipe data
   * @property {string|null} error - Error message if recipe loading failed
   * @property {Object} recipeService - Recipe service functions for data operations
   * @property {Object} stateManagers - State management utilities for recipe operations
   *
   * @example
   * // Accessing context data in a component:
   * const {
   *   availableRecipes,    // Array of all available recipes
   *   isLoading,          // Boolean indicating if recipes are loading
   *   error,              // String error message or null
   *   recipeService,      // Service functions for recipe operations
   *   stateManagers       // State management utilities
   * } = useRecipeContext();
   */
  const contextValue = {
    availableRecipes,
    isLoading,
    error,
    recipeService,
    stateManagers,
  };

  return (
    <RecipeContext.Provider value={contextValue}>
      {children}
    </RecipeContext.Provider>
  );
};

/**
 * Custom hook to access recipe context data and services
 *
 * This hook provides a convenient way to access the recipe context from any component
 * within the RecipeProvider tree. It includes automatic error checking to ensure
 * the hook is used correctly.
 *
 * @returns {Object} Recipe context object
 * @returns {Array<Object>} returns.availableRecipes - All available recipes from the service
 * @returns {boolean} returns.isLoading - Loading state for recipe operations
 * @returns {string|null} returns.error - Error message if any recipe operation failed
 * @returns {Object} returns.recipeService - Recipe service functions for data operations
 * @returns {Function} returns.recipeService.getAllRecipes - Get all recipes
 * @returns {Function} returns.recipeService.getRecipesByType - Filter recipes by type
 * @returns {Function} returns.recipeService.getRecipeById - Get recipe by ID
 * @returns {Object} returns.stateManagers - State management utilities
 * @returns {Object} returns.stateManagers.recipeList - Recipe list management functions
 * @returns {Object} returns.stateManagers.rawComponents - Raw components management
 * @returns {Object} returns.stateManagers.appState - Application state management
 *
 * @throws {Error} When used outside of a RecipeProvider component tree
 *
 * @example
 * // Basic usage in a component:
 * function RecipeSelector() {
 *   const { availableRecipes, isLoading, error } = useRecipeContext();
 *
 *   if (isLoading) return <div>Loading recipes...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <select>
 *       {availableRecipes.map(recipe => (
 *         <option key={recipe.id} value={recipe.id}>
 *           {recipe.name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 *
 * @example
 * // Using recipe service functions:
 * function RecipeManager() {
 *   const { recipeService, stateManagers } = useRecipeContext();
 *
 *   const handleAddRecipe = async (recipeData) => {
 *     const result = await stateManagers.recipeList.addRecipe(recipeData);
 *     if (result.success) {
 *       console.log('Recipe added successfully');
 *     }
 *   };
 *
 *   return <button onClick={() => handleAddRecipe(someRecipe)}>Add Recipe</button>;
 * }
 */
export const useRecipeContext = () => {
  const context = useContext(RecipeContext);

  // Error boundary: ensure hook is used within provider
  if (!context) {
    throw new Error(
      "useRecipeContext must be used within a RecipeProvider. " +
        "Make sure your component is wrapped in <RecipeProvider>..."
    );
  }

  return context;
};
