import { useState, useEffect } from "react";
import { createRecipeServiceFunctions } from "../services/recipe/recipeService.js";

/**
 * Hook to load and manage recipe data
 * Initializes recipe service and provides functions for recipe operations
 */
export const useRecipeData = () => {
  const [recipeServiceFunctions, setRecipeServiceFunctions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔧 Creating recipe service functions...");

        // Create service functions immediately
        const serviceFunctions = createRecipeServiceFunctions();
        setRecipeServiceFunctions(serviceFunctions);

        console.log("🔧 Initializing recipe service...");

        // Initialize the service (loads data)
        const result = await serviceFunctions.initialize();

        if (result.success) {
          console.log("✅ Recipe service initialized successfully");
          setIsInitialized(true);
        } else {
          throw new Error(
            result.message || "Failed to initialize recipe service"
          );
        }
      } catch (err) {
        console.error("❌ Error initializing recipe data:", err);
        setError(err.message);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRecipes();
  }, []);

  return {
    recipeServiceFunctions,
    isLoading,
    error,
    isInitialized,
  };
};

export default useRecipeData;
