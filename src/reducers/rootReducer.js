import { recipeListReducer, initialRecipeListState } from "./recipeListReducer";
import {
  componentListReducer,
  initialComponentListState,
} from "./componentListReducer";

/**
 * Root Reducer - Combines all reducers
 */

// Combined Initial State
export const initialAppState = {
  recipeList: initialRecipeListState,
  componentList: initialComponentListState,
};

// Root Reducer Function
export const rootReducer = (state = initialAppState, action) => {
  return {
    recipeList: recipeListReducer(state.recipeList, action),
    componentList: componentListReducer(state.componentList, action),
  };
};

// Export all actions for convenience
export { recipeListActions } from "./recipeListReducer";
export { componentListActions } from "./componentListReducer";
