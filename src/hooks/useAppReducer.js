import { useReducer, useCallback } from "react";
import {
  rootReducer,
  initialAppState,
  recipeListActions,
  componentListActions,
} from "../reducers/rootReducer";

/**
 * Custom hook that provides reducer-based state management
 */
export const useAppReducer = () => {
  const [state, dispatch] = useReducer(rootReducer, initialAppState);

  // Recipe List Actions
  const recipeListHandlers = {
    addRecipe: useCallback((recipe) => {
      console.log("🔧 useAppReducer - Adding recipe:", recipe?.name);
      dispatch(recipeListActions.addRecipe(recipe));
    }, []),

    removeRecipe: useCallback((recipeId) => {
      console.log("🔧 useAppReducer - Removing recipe:", recipeId);
      dispatch(recipeListActions.removeRecipe(recipeId));
    }, []),

    clearList: useCallback(() => {
      console.log("🔧 useAppReducer - Clearing recipe list");
      dispatch(recipeListActions.clearList());
    }, []),

    updateQuantity: useCallback((recipeId, quantity) => {
      console.log("🔧 useAppReducer - Updating quantity:", recipeId, quantity);
      dispatch(recipeListActions.updateQuantity(recipeId, quantity));
    }, []),
  };

  // Component List Actions
  const componentListHandlers = {
    setComponents: useCallback((components) => {
      console.log("🔧 useAppReducer - Setting components:", components?.length);
      dispatch(componentListActions.setComponents(components));
    }, []),

    updateComponentQuantity: useCallback((componentId, quantity) => {
      dispatch(
        componentListActions.updateComponentQuantity(componentId, quantity)
      );
    }, []),

    addCustomComponent: useCallback((component) => {
      dispatch(componentListActions.addCustomComponent(component));
    }, []),

    removeComponent: useCallback((componentId) => {
      dispatch(componentListActions.removeComponent(componentId));
    }, []),

    clearComponents: useCallback(() => {
      dispatch(componentListActions.clearComponents());
    }, []),
  };

  return {
    // State
    state,
    recipeList: state.recipeList.recipes,
    components: state.componentList.components,

    // Actions
    recipeListActions: recipeListHandlers,
    componentListActions: componentListHandlers,

    // Raw dispatch for custom actions
    dispatch,
  };
};
