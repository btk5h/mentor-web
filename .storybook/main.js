module.exports = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: [
    "@storybook/preset-typescript",
    "@storybook/addon-actions",
    "@storybook/addon-links",
    "@storybook/addon-storysource",
    "@storybook/addon-viewport/register",
    "@storybook/addon-a11y/register",
    "@storybook/addon-knobs/register",
  ],
  webpackFinal: (config) => {
    config.resolve.modules.push(".");
    config.resolve.alias = {
      "popper.js$": "popper.js/dist/esm/popper.js",
      ...config.resolve.alias,
    };
    return config;
  },
};
