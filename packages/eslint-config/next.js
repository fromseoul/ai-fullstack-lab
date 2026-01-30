import baseConfig from "./base.js";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];
