import React, { useState } from "react";
import CraftComponent from "../craftComponent/CraftComponent";

const Recipe = ({ recipeData }) => {
  // if (!recipeData) recipeData = TestRecipeData;
  console.log(`Recipe component initialized with data:`, recipeData);

  const [quantity, setQuantity] = useState(0);
  const [playerHasQuantity, setPlayerHasQuantity] = useState(0);

  const {
    name,
    icon,
    description,
    recipe: { workStation, artisanSkill, components = [] } = {},
  } = recipeData;

  return (
    <div className="recipe">
      <h2>
        {icon ? <img src={icon} alt={name} /> : null} {name}
      </h2>
      <p>{description}</p>
      <div>
        <strong>Work Station:</strong> {workStation}
      </div>
      <div>
        <strong>Artisan Skill:</strong> {artisanSkill}
      </div>
      <div>
        <strong>Components:</strong>
        <ul>
          {components.map((component) => (
            <li key={component.id}>
              <CraftComponent
                name={component.name}
                quantity={component.quantity}
                onQuantityChange={(name, value) => {
                  console.log(`Updated ${name} quantity to ${value}`);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Recipe;
