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
  WEAVING: "weaving",
  JEWEL_CUTTING: "jewel_cutting",
  FISHING_PROCESSING: "fishing_processing",
};

export const ITEM_TYPES = {
  RAW: "raw",
  INTERMEDIATE: "intermediate",
  CRAFTED: "crafted",
};

export const SPECIAL_CATEGORIES = {
  SPECIAL: "special",
  RESERVED: "reserved",
  VENDOR: "vendor",
  TOOLS: "tools",
  SCROLLS: "scrolls",
  FOOD: "food",
  POTIONS: "potions",
  OTHER_CONSUMABLES: "other_consumables",
};
