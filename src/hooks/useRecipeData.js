import { useState, useEffect, useMemo } from "react";
import * as recipeService from "../services/recipe/recipeService.js";

export const useRecipeData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await recipeService.initialize();
        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Recipe service initialization error:", err);
        setError(err.message);
        setIsLoading(false);
        setIsInitialized(false);
      }
    };

    initializeService();
  }, []);

  // Memoize service functions to prevent infinite re-renders
  const recipeServiceFunctions = useMemo(() => {
    if (!isInitialized) return null;
    try {
      return recipeService.createRecipeServiceFunctions();
    } catch (err) {
      console.error("Error creating service functions:", err);
      setError(err.message);
      return null;
    }
  }, [isInitialized]);

  return {
    isLoading,
    error,
    isInitialized,
    recipeServiceFunctions, // This should match what App.js expects
  };
};

export default useRecipeData;
