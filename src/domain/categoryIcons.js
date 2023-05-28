/**
 * Category icon registry - the extension seam.
 *
 * The backend owns the category list (db/seeds.rb) and is free to add to it.
 * Screens therefore never hardcode a category; they ask this registry, which
 * returns a bundled illustration when one exists and otherwise falls back to
 * the emoji the API already sends. A new backend category renders correctly
 * with no frontend change at all; shipping artwork for it is then a one-line
 * `registerCategoryIcon` call rather than an edit to a screen.
 */
const DEFAULT_ICONS = [
  ['Income', require('../../app/assets/images/emojeIcon.png')],
  ['Food and Drink', require('../../app/assets/images/pizza.png')],
  ['Healthcare', require('../../app/assets/images/medicne.png')],
  ['Shops', require('../../app/assets/images/shop.png')],
  ['Subscription Service', require('../../app/assets/images/tele.png')],
  ['Travel', require('../../app/assets/images/plane.png')],
];

const registry = new Map();

function key(name) {
  return String(name ?? '')
    .trim()
    .toLowerCase();
}

export function registerCategoryIcon(name, source) {
  registry.set(key(name), source);
}

export function resetCategoryIcons() {
  registry.clear();
  for (const [name, source] of DEFAULT_ICONS) {
    registerCategoryIcon(name, source);
  }
}

/**
 * Returns `{ kind: 'image', source }` when artwork is bundled,
 * `{ kind: 'emoji', emoji }` when the API supplied one,
 * or `{ kind: 'initial', initial }` as a last resort so nothing renders blank.
 */
export function getCategoryIcon(category) {
  const name = category?.name ?? '';
  const source = registry.get(key(name));
  if (source !== undefined) {
    return { kind: 'image', source };
  }
  if (category?.emoji) {
    return { kind: 'emoji', emoji: category.emoji };
  }
  return { kind: 'initial', initial: (name.trim()[0] ?? '?').toUpperCase() };
}

export function registeredCategoryNames() {
  return [...registry.keys()];
}

resetCategoryIcons();
