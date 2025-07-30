/**
 * Component List Reducer - For calculated components
 *
 * This reducer manages the state for a list of components required for crafting.
 * It supports adding, removing, updating, and clearing components.
 *
 * Each component should have at least:
 *   - id: unique identifier (string or number)
 *   - name: display name (string)
 *   - quantity: required amount (number)
 *
 * Example usage:
 *   dispatch(componentListActions.addComponent({ id: "copper_ore", name: "Copper Ore", quantity: 2 }))
 *   dispatch(componentListActions.updateComponentQuantity("copper_ore", 5))
 *   dispatch(componentListActions.removeComponent("copper_ore"))
 *   dispatch(componentListActions.clearComponents())
 *
 * NOTE:
 * This file only exports reducer and action creators.
 * The `dispatch` function comes from React's useReducer or Redux's useDispatch.
 *
 * Example with useReducer:
 *   import { useReducer } from "react";
 *   const [state, dispatch] = useReducer(componentListReducer, initialRecipeListState);
 *   dispatch(recipeListActions.addRecipe(recipeObj));
 *
 * Example with Redux:
 *   import { useDispatch } from "react-redux";
 *   const dispatch = useDispatch();
 *   dispatch(recipeListActions.addRecipe(recipeObj));
 */

// Action Types
export const COMPONENT_LIST_ACTIONS = {
  SET_COMPONENTS: "SET_COMPONENTS", // Replace all components
  UPDATE_COMPONENT_QUANTITY: "UPDATE_COMPONENT_QUANTITY", // Change quantity for one component
  ADD_COMPONENT: "ADD_COMPONENT", // Add a new component
  REMOVE_COMPONENT: "REMOVE_COMPONENT", // Remove a component by id
  CLEAR_COMPONENTS: "CLEAR_COMPONENTS", // Remove all components
};

// Initial State
export const initialComponentListState = {
  components: [], // Array of component objects
  isCalculating: false, // Optional: can be used for loading state
};

// Action Creators
export const componentListActions = {
  /**
   * Replace the entire components list.
   * @param {Array} components - Array of component objects
   * @returns {Object} Redux action
   * @example
   * dispatch(componentListActions.setComponents([{ id: "iron", name: "Iron", quantity: 3 }]))
   */
  setComponents: (components) => ({
    type: COMPONENT_LIST_ACTIONS.SET_COMPONENTS,
    payload: components,
  }),

  /**
   * Update the quantity of a specific component.
   * @param {string|number} componentId - The id of the component to update
   * @param {number} quantity - The new quantity
   * @returns {Object} Redux action
   * @example
   * dispatch(componentListActions.updateComponentQuantity("iron", 5))
   */
  updateComponentQuantity: (componentId, quantity) => ({
    type: COMPONENT_LIST_ACTIONS.UPDATE_COMPONENT_QUANTITY,
    payload: { componentId, quantity },
  }),

  /**
   * Add a new component to the list.
   * @param {Object} component - The component object (must have id, name, quantity)
   * @returns {Object} Redux action
   * @example
   * dispatch(componentListActions.addComponent({ id: "wood", name: "Wood", quantity: 10 }))
   */
  addComponent: (component) => ({
    type: COMPONENT_LIST_ACTIONS.ADD_COMPONENT,
    payload: component,
  }),

  /**
   * Remove a component from the list by id.
   * @param {string|number} componentId - The id of the component to remove
   * @returns {Object} Redux action
   * @example
   * dispatch(componentListActions.removeComponent("wood"))
   */
  removeComponent: (componentId) => ({
    type: COMPONENT_LIST_ACTIONS.REMOVE_COMPONENT,
    payload: componentId,
  }),

  /**
   * Clear all components from the list.
   * @returns {Object} Redux action
   * @example
   * dispatch(componentListActions.clearComponents())
   */
  clearComponents: () => ({
    type: COMPONENT_LIST_ACTIONS.CLEAR_COMPONENTS,
  }),
};

/**
 * Reducer function for component list state.
 * @param {Object} state - Current state
 * @param {Object} action - Redux action
 * @returns {Object} New state
 */
export const componentListReducer = (
  state = initialComponentListState,
  action
) => {
  console.log("🧱 ComponentList Reducer:", action.type);

  switch (action.type) {
    case COMPONENT_LIST_ACTIONS.SET_COMPONENTS: {
      // Replace the entire components array
      const components = action.payload || [];
      console.log("✅ Setting components:", components.length, "items");

      return {
        ...state,
        components: Array.isArray(components) ? components : [],
      };
    }

    case COMPONENT_LIST_ACTIONS.UPDATE_COMPONENT_QUANTITY: {
      // Update quantity for a specific component by id
      const { componentId, quantity } = action.payload;

      const updatedComponents = state.components.map((component) =>
        component.id === componentId
          ? { ...component, quantity: Math.max(0, quantity) }
          : component
      );

      return {
        ...state,
        components: updatedComponents,
      };
    }

    case COMPONENT_LIST_ACTIONS.ADD_COMPONENT: {
      // Add a new component (uses id from payload)
      const newComponent = {
        ...action.payload,
        quantity: action.payload.quantity || 1,
      };

      return {
        ...state,
        components: [...state.components, newComponent],
      };
    }

    case COMPONENT_LIST_ACTIONS.REMOVE_COMPONENT: {
      // Remove a component by id
      const componentId = action.payload;

      return {
        ...state,
        components: state.components.filter(
          (component) => component.id !== componentId
        ),
      };
    }

    case COMPONENT_LIST_ACTIONS.CLEAR_COMPONENTS: {
      // Remove all components
      return {
        ...state,
        components: [],
      };
    }

    default:
      return state;
  }
};
