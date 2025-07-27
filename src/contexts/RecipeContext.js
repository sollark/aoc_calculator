import { createContext, useContext, useState, useEffect } from "react";

// Context for sharing recipe data and services across components
const RecipeContext = createContext();

// Provider component that makes recipe data available to child components
export const RecipeProvider = ({ children, recipeService, stateManagers }) => {
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all recipes directly from recipeService
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

  // Bundle all recipe-related data and services
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

// Hook to access recipe context data
export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipeContext must be used within RecipeProvider");
  }
  return context;
};
