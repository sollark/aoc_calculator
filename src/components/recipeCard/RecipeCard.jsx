import React, { useState } from "react";
import PropTypes from "prop-types";
import CraftComponent from "../craftComponent/CraftComponent";
import { recipePropType } from "../../types/recipePropTypes";

const RecipeCard = ({
  recipe, // ✅ SINGLE source of truth
  playerLevel = 1,
  playerArtisanLevel = "novice",
  showRequirements = true,
}) => {
  console.log(`✅ RecipeCard initialized with recipe:`, recipe);

  const [quantity, setQuantity] = useState(0);
  const [playerHasQuantity, setPlayerHasQuantity] = useState(0);

  // Early return if no recipe data
  if (!recipe) {
    console.warn("No recipe data provided");
    return null;
  }

  // Extract recipe data - handle both flat and nested structures
  const {
    name,
    icon,
    description,
    requirements = { playerLevel: 0, artisanLevel: "novice" },
    // Handle nested recipe structure if it exists
    recipe: nestedRecipe,
    // Handle flat structure
    workStation,
    artisanSkill,
    components = [],
  } = recipe;

  // Use nested recipe data if available, otherwise use flat structure
  const recipeDetails = nestedRecipe || {
    workStation,
    artisanSkill,
    components,
  };

  const {
    workStation: finalWorkStation,
    artisanSkill: finalArtisanSkill,
    components: finalComponents = [],
  } = recipeDetails;

  console.log(`🔍 Processed recipe data:`, {
    name,
    description,
    workStation: finalWorkStation,
    artisanSkill: finalArtisanSkill,
    components: finalComponents,
  });

  return (
    <div className="recipe">
      <div className="recipe__header">
        <h2 className="recipe__title">
          {icon ? <img src={icon} alt={name} className="recipe__icon" /> : null}
          {name || "Unknown Recipe"}
        </h2>

        {showRequirements && (
          <div className="recipe__requirements">
            <span className="recipe__level">Lv.{requirements.playerLevel}</span>
            <span className="recipe__artisan">{requirements.artisanLevel}</span>
          </div>
        )}
      </div>

      <p className="recipe__description">
        {description || "No description available"}
      </p>

      <div className="recipe__details">
        <div className="recipe__workstation">
          <strong>Work Station:</strong> {finalWorkStation || "Unknown"}
        </div>
        <div className="recipe__skill">
          <strong>Artisan Skill:</strong> {finalArtisanSkill || "Unknown"}
        </div>
      </div>

      <div className="recipe__components">
        <strong>Components:</strong>
        <ul className="recipe__components-list">
          {finalComponents.length > 0 ? (
            finalComponents.map((component, index) => (
              <li
                key={component.id || index}
                className="recipe__component-item"
              >
                <CraftComponent
                  id={component.id || index}
                  name={component.name}
                  quantity={component.quantity}
                  onQuantityChange={(id, name, value) => {
                    console.log(`Updated ${name} (${id}) quantity to ${value}`);
                  }}
                />
              </li>
            ))
          ) : (
            <li>No components found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

// PropTypes validation
RecipeCard.propTypes = {
  recipe: recipePropType.isRequired, // ✅ SINGLE prop for recipe data
  playerLevel: PropTypes.number,
  playerArtisanLevel: PropTypes.oneOf([
    "novice",
    "apprentice",
    "journeyman",
    "expert",
    "master",
  ]),
  showRequirements: PropTypes.bool,
};

export default RecipeCard;
