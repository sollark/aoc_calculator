import { useMemo } from "react";
import { createStateManagers } from "../services/appStateService";

/**
 * Custom hook for managing application state managers
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @param {boolean} isInitialized - Whether the app is initialized
 * @returns {Object|null} State managers or null if not ready
 */
export const useAppState = (recipeServiceFunctions, isInitialized) => {
  return useMemo(() => {
    return isInitialized && recipeServiceFunctions
      ? createStateManagers(recipeServiceFunctions)
      : null;
  }, [isInitialized, recipeServiceFunctions]);
};
