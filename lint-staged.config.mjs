/** Vérifications rapides sur les seuls fichiers indexés, avant chaque commit. */
const config = {
  "*.{ts,tsx,mjs,js}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md,yml,yaml}": "prettier --write",
};

export default config;
