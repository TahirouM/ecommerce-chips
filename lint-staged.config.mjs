/** Vérifications rapides sur les seuls fichiers indexés, avant chaque commit. */
export default {
  "*.{ts,tsx,mjs,js}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md,yml,yaml}": "prettier --write",
};
