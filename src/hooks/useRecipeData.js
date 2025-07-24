import { useState, useEffect, useMemo } from "react";
import * as recipeService from "../services/recipe/recipeService.js";
import { createRecipeCalculationService } from "../services/recipe/recipeCalculationService.js";
import { RECIPE_TYPES } from "../services/recipe/constants.js";

export const useRecipeData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the service on mount
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await recipeService.initialize();

        // Give a small delay to ensure everything is loaded
        await new Promise((resolve) => setTimeout(resolve, 100));

        setIsInitialized(true);
        console.log("Recipe service initialized successfully");
      } catch (err) {
        setError(err.message);
        console.error("Failed to initialize recipe service:", err);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, []);

  // Create service functions object
  const recipeServiceFunctions = useMemo(() => {
    if (!isInitialized) {
      console.log("Service not yet initialized, returning null");
      return null;
    }

    try {
      // Get the main service functions
      const mainServiceFunctions = recipeService.createRecipeServiceFunctions();

      if (!mainServiceFunctions) {
        console.error("Failed to create main service functions");
        return null;
      }

      // Create calculation service
      const calculationService = createRecipeCalculationService(
        mainServiceFunctions.findRecipeByIdentifier,
        mainServiceFunctions.findRawComponentByIdentifier
      );

      if (!calculationService) {
        console.error("Failed to create calculation service");
        return mainServiceFunctions; // Return at least the main functions
      }

      // Combine both services
      const combinedFunctions = {
        ...mainServiceFunctions,
        ...calculationService,
      };

      console.log(
        "Combined service functions created:",
        Object.keys(combinedFunctions)
      );
      return combinedFunctions;
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
    recipeServiceFunctions,
    // Direct access to helper functions (with null checks)
    findRecipeByIdentifier: isInitialized
      ? recipeService.findRecipeByIdentifier
      : null,
    findRawComponentByIdentifier: isInitialized
      ? recipeService.findRawComponentByIdentifier
      : null,
  };
};

export default useRecipeData;
