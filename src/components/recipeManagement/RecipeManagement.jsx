import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import RecipeSelector from "../recipeSelector/RecipeSelector";
import ManageableRecipeList from "../manageableRecipeList/ManageableRecipeList";
import "./recipeManagement.css";

/**
 * Higher-order component for managing recipe selection and list operations
 * Combines recipe selector and manageable recipe list with their interactions
 *
 * @param {Object} props - Component props
 * @param {Array} props.allRecipes - All available recipes
 * @param {string} props.selectedRecipe - Currently selected recipe name
 * @param {Array} props.recipeList - Current list of selected recipes
 * @param {Function} props.onRecipeChange - Handler for recipe selection change
 * @param {Function} props.onAddRecipe - Handler for adding recipe to list
 * @param {Function} props.onRemoveRecipe - Handler for removing recipe from list
 * @param {Function} props.onClearList - Handler for clearing entire recipe list
 * @param {Object} props.stateManagers - State management functions
 * @param {Object} props.recipeServiceFunctions - Recipe service functions
 * @returns {JSX.Element} Recipe management interface
 */
const RecipeManagement = ({
  allRecipes,
  selectedRecipe,
  recipeList,
  onRecipeChange,
  onAddRecipe,
  onRemoveRecipe,
  onClearList,
  stateManagers,
  recipeServiceFunctions,
}) => {
  /**
   * Memoized recipe statistics for performance optimization
   */
  const recipeStats = useMemo(() => {
    const totalRecipes = allRecipes.length;
    const selectedCount = recipeList.length;
    const availableCount = totalRecipes - selectedCount;

    // Calculate unique recipes vs duplicates
    const uniqueRecipeIds = new Set(recipeList.map((recipe) => recipe.id));
    const duplicateCount = selectedCount - uniqueRecipeIds.size;

    return {
      totalRecipes,
      selectedCount,
      availableCount,
      duplicateCount,
      hasRecipes: selectedCount > 0,
      canAddMore: availableCount > 0,
    };
  }, [allRecipes.length, recipeList]);

  /**
   * Memoized validation for recipe operations
   */
  const recipeValidation = useMemo(() => {
    const canAddSelected = Boolean(
      selectedRecipe &&
        !recipeServiceFunctions.isRecipeAlreadyAdded(
          recipeList,
          allRecipes.find((recipe) => recipe.name === selectedRecipe)
        )
    );

    return {
      canAddSelected,
      canClearList: recipeStats.hasRecipes,
      hasSelection: Boolean(selectedRecipe),
    };
  }, [
    selectedRecipe,
    recipeList,
    recipeServiceFunctions,
    allRecipes,
    recipeStats.hasRecipes,
  ]);

  /**
   * Enhanced add recipe handler with validation and feedback
   */
  const handleAddRecipeWithValidation = useCallback(() => {
    if (!recipeValidation.canAddSelected) {
      console.warn("Cannot add recipe: validation failed");
      return;
    }

    onAddRecipe();
  }, [onAddRecipe, recipeValidation.canAddSelected]);

  /**
   * Enhanced clear list handler with confirmation logic
   */
  const handleClearListWithConfirmation = useCallback(() => {
    if (recipeStats.selectedCount > 0) {
      // In a real app, you might want to show a confirmation dialog
      const shouldClear = window.confirm(
        `Are you sure you want to clear all ${recipeStats.selectedCount} recipes?`
      );

      if (shouldClear) {
        onClearList();
      }
    }
  }, [onClearList, recipeStats.selectedCount]);

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
          onRecipeChange={onRecipeChange}
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
      onRecipeChange,
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
          onRemoveRecipe={onRemoveRecipe}
          onClearList={handleClearListWithConfirmation}
          showStats={true}
          stats={recipeStats}
        />
      </section>
    ),
    [recipeList, onRemoveRecipe, handleClearListWithConfirmation, recipeStats]
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
 * @param {Object} props - Component props
 * @param {Object} props.stats - Recipe statistics
 * @param {Object} props.validation - Recipe validation state
 * @returns {JSX.Element} Statistics display
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
 * PropTypes for type checking and documentation
 */
RecipeManagement.propTypes = {
  allRecipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedRecipe: PropTypes.string.isRequired,
  recipeList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRecipeChange: PropTypes.func.isRequired,
  onAddRecipe: PropTypes.func.isRequired,
  onRemoveRecipe: PropTypes.func.isRequired,
  onClearList: PropTypes.func.isRequired,
  stateManagers: PropTypes.object.isRequired,
  recipeServiceFunctions: PropTypes.object.isRequired,
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
