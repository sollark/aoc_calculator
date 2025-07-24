import React, { useCallback } from "react";
import PropTypes from "prop-types";
import RecipeSelector from "../recipeSelector/RecipeSelector";
import ManageableRecipeList from "../manageableRecipeList/ManageableRecipeList";
import { useRecipeSelection } from "../../hooks/useRecipeSelection";
import { useRecipeList } from "../../hooks/useRecipeList";
import { useRecipeStats } from "../../hooks/useRecipeStats";
import { useRecipeValidation } from "../../hooks/useRecipeValidation";
import "./recipeManagement.css";

/**
 * Self-contained recipe management component
 * Manages its own state for recipe selection and list operations
 *
 * @param {Object} props - Component props
 * @param {Array} props.allRecipes - All available recipes
 * @param {Object} props.stateManagers - State management functions
 * @param {Object} props.recipeServiceFunctions - Recipe service functions
 * @param {Function} props.onRecipeListChange - Callback when recipe list changes
 * @returns {JSX.Element} Recipe management interface
 */
const RecipeManagement = ({
  allRecipes,
  stateManagers,
  recipeServiceFunctions,
  onRecipeListChange,
}) => {
  // Internal state management using custom hooks
  const { selectedRecipe, handleRecipeChange } = useRecipeSelection(allRecipes);
  const {
    recipeList,
    handleAddRecipe: addRecipe,
    handleRemoveRecipe,
    handleClearList: clearList,
  } = useRecipeList(stateManagers);

  // Statistics and validation
  const recipeStats = useRecipeStats(allRecipes, recipeList);
  const recipeValidation = useRecipeValidation(
    selectedRecipe,
    recipeList,
    allRecipes,
    recipeServiceFunctions
  );

  // Notify parent component when recipe list changes
  React.useEffect(() => {
    if (onRecipeListChange) {
      onRecipeListChange(recipeList);
    }
  }, [recipeList, onRecipeListChange]);

  /**
   * Enhanced add recipe handler with validation
   */
  const handleAddRecipeWithValidation = useCallback(() => {
    if (!recipeValidation.canAddSelected) {
      console.warn("Cannot add recipe: validation failed");
      return;
    }

    addRecipe(selectedRecipe);
  }, [addRecipe, selectedRecipe, recipeValidation.canAddSelected]);

  /**
   * Enhanced clear list handler with confirmation
   */
  const handleClearListWithConfirmation = useCallback(() => {
    if (recipeStats.selectedCount > 0) {
      const shouldClear = window.confirm(
        `Are you sure you want to clear all ${recipeStats.selectedCount} recipes?`
      );

      if (shouldClear) {
        clearList();
      }
    }
  }, [clearList, recipeStats.selectedCount]);

  /**
   * Render recipe selector section
   */
  const renderRecipeSelector = useCallback(
    () => (
      <section className="recipe-management__selector-section">
        <h3 className="recipe-management__section-title">Recipe Selection</h3>
        <RecipeSelector
          recipes={allRecipes}
          selectedRecipe={selectedRecipe}
          onRecipeChange={handleRecipeChange}
          onAddRecipe={handleAddRecipeWithValidation}
          recipeListCount={recipeStats.selectedCount}
          disabled={!recipeValidation.hasSelection}
          canAdd={recipeValidation.canAddSelected}
        />
        <RecipeSelectionStats
          stats={recipeStats}
          validation={recipeValidation}
        />
      </section>
    ),
    [
      allRecipes,
      selectedRecipe,
      handleRecipeChange,
      handleAddRecipeWithValidation,
      recipeStats,
      recipeValidation,
    ]
  );

  /**
   * Render recipe list section
   */
  const renderRecipeList = useCallback(
    () => (
      <section className="recipe-management__list-section">
        <h3 className="recipe-management__section-title">Selected Recipes</h3>
        <ManageableRecipeList
          recipes={recipeList}
          onRemoveRecipe={handleRemoveRecipe}
          onClearList={handleClearListWithConfirmation}
          showStats={true}
          stats={recipeStats}
        />
      </section>
    ),
    [
      recipeList,
      handleRemoveRecipe,
      handleClearListWithConfirmation,
      recipeStats,
    ]
  );

  return (
    <div className="recipe-management">
      {renderRecipeSelector()}
      {renderRecipeList()}
    </div>
  );
};

/**
 * Pure component for displaying recipe selection statistics
 */
const RecipeSelectionStats = ({ stats, validation }) => (
  <div className="recipe-management__stats">
    <div className="recipe-management__stat-group">
      <span className="recipe-management__stat">
        Total Available: {stats.totalRecipes}
      </span>
      <span className="recipe-management__stat">
        Selected: {stats.selectedCount}
      </span>
      <span className="recipe-management__stat">
        Remaining: {stats.availableCount}
      </span>
    </div>

    {stats.duplicateCount > 0 && (
      <div className="recipe-management__warning">
        ⚠️ {stats.duplicateCount} duplicate recipes detected
      </div>
    )}

    <div className="recipe-management__status">
      {validation.canAddSelected ? (
        <span className="recipe-management__status--ready">
          ✅ Ready to add recipe
        </span>
      ) : validation.hasSelection ? (
        <span className="recipe-management__status--duplicate">
          ⚠️ Recipe already in list
        </span>
      ) : (
        <span className="recipe-management__status--none">
          📝 Select a recipe to add
        </span>
      )}
    </div>
  </div>
);

/**
 * Simplified PropTypes
 */
RecipeManagement.propTypes = {
  allRecipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  stateManagers: PropTypes.object.isRequired,
  recipeServiceFunctions: PropTypes.object.isRequired,
  onRecipeListChange: PropTypes.func, // Optional callback for parent updates
};

RecipeSelectionStats.propTypes = {
  stats: PropTypes.shape({
    totalRecipes: PropTypes.number.isRequired,
    selectedCount: PropTypes.number.isRequired,
    availableCount: PropTypes.number.isRequired,
    duplicateCount: PropTypes.number.isRequired,
    hasRecipes: PropTypes.bool.isRequired,
    canAddMore: PropTypes.bool.isRequired,
  }).isRequired,
  validation: PropTypes.shape({
    canAddSelected: PropTypes.bool.isRequired,
    canClearList: PropTypes.bool.isRequired,
    hasSelection: PropTypes.bool.isRequired,
  }).isRequired,
};

export default RecipeManagement;
