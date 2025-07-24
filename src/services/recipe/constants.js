/**
 * Recipe system constants and configuration
 */

export const RECIPE_TYPES = {
  RAW_COMPONENTS: "raw_components",
  INTERMEDIATE_RECIPES: "intermediate_recipes",
  CRAFTED_ITEMS: "crafted_items",
};

export const VALID_RECIPE_TYPES = Object.values(RECIPE_TYPES);

export const SKILL_LEVELS = {
  NONE: "none",
  NOVICE: "novice",
  APPRENTICE: "apprentice",
  JOURNEYMAN: "journeyman",
  EXPERT: "expert",
  MASTER: "master",
};

export const GATHERING_SKILLS = {
  MINING: "mining",
  LUMBERJACKING: "lumberjacking",
  HERBALISM: "herbalism",
  FISHING: "fishing",
  HUNTING: "hunting",
  VENDOR: "vendor",
};

export const ARTISAN_SKILLS = {
  ALCHEMY: "alchemy",
  LUMBER_MILLING: "lumber_milling",
  METALWORKING: "metalworking",
  STONEMASONRY: "stonemasonry",
  LEATHERWORKING: "leatherworking",
  COOKING: "cooking",
  WEAPONSMITHING: "weaponsmithing",
  BOWCRAFT: "bowcraft",
  ARMORSMITHING: "armorsmithing",
  TAILORING: "tailoring",
  SCRIBE: "scribe",
};
