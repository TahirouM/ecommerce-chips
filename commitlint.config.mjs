/** Conventional Commits — voir CONTRIBUTING.md. */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Les messages sont rédigés en français : on n'impose pas la casse anglaise.
    "subject-case": [0],
    "body-max-line-length": [1, "always", 100],
  },
};

export default config;
