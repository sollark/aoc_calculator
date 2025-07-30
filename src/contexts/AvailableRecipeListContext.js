/**
 * AvailableRecipeListContext.js
 *
 * This module provides a React Context and custom hook for managing the list of available recipes
 * in the application. It fetches recipes from an external service and exposes loading/error state.
 *
 * Design Pattern:
 * - The context provider (`AvailableRecipeListProvider`) supplies shared state and actions to all
 *   descendant components.
 * - The custom hook (`useAvailableList`) encapsulates context access and error handling, making it
 *   easy and safe for components to consume the context data.
 *
 * Why use a custom hook for context?
 * - Encapsulation: The hook hides context details and error handling logic.
 * - Consistency: All components use the same API to access context data.
 * - Safety: The hook throws an error if used outside the provider, preventing bugs.
 * - Readability: Using `useAvailableList()` is clearer and more maintainable than calling
 *   `useContext(AvailableRecipeListContext)` everywhere.
 *
 * Usage Example:
 *   // In any component wrapped by AvailableRecipeListProvider:
 *   const {  availableRecipes, isLoading, error, recipeService, stateManagers, } = useAvailableList();
 *
 *   // Now you can read the available recipes and check loading/error state.
 *
 * Provider Value:
 * - availableRecipes: Array of recipes fetched from the service.
 * - isLoading: Boolean indicating if recipes are being loaded.
 * - error: Error message if loading fails.
 * - recipeService: The service object used to fetch/manipulate recipes.
 * - stateManagers: Additional state management utilities or objects passed from parent.
 *
 * This pattern is recommended by the React team and is widely used in modern React codebases
 * for sharing state and actions across many components.
 */

import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * The context object for available recipes.
 */
const AvailableRecipeListContext = createContext();

/**
 * Custom hook to access the available recipe list context.
 * Throws an error if used outside the provider.
 */
export const useAvailableList = () => {
  const context = useContext(AvailableRecipeListContext);
  if (!context) {
    throw new Error(
      "useAvailableList must be used within an AvailableRecipeListProvider"
    );
  }
  return context;
};

/**
 * Provider component for available recipes.
 * Wrap your app (or subtree) with this to provide available recipe state and actions.
 */
export const AvailableRecipeListProvider = ({
  children,
  recipeService,
  stateManagers,
}) => {
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecipes = async () => {
      if (!recipeService?.getAllRecipes) {
        setIsLoading(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const recipes = await recipeService.getAllRecipes();
        setAvailableRecipes(Array.isArray(recipes) ? recipes : []);
      } catch (err) {
        console.error("Error loading recipes:", err);
        setError(err.message);
        setAvailableRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [recipeService]);

  // Context value provided to consumers.
  const contextValue = {
    availableRecipes,
    isLoading,
    error,
    recipeService,
    stateManagers,
  };

  return (
    <AvailableRecipeListContext.Provider value={contextValue}>
      {children}
    </AvailableRecipeListContext.Provider>
  );
};
