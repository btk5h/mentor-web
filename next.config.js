const withPlugins = require("next-compose-plugins");
const transpileModules = require("next-transpile-modules")(["graphviz-react"]);
const offline = require("next-offline");

module.exports = withPlugins(
  [
    transpileModules,
    [
      offline,
      {
        workboxOpts: {
          swDest: "static/service-worker.js",
          runtimeCaching: [
            {
              urlPattern: /^https?.*/,
              handler: "NetworkFirst",
              options: {
                cacheName: "https-calls",
                networkTimeoutSeconds: 15,
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      },
    ],
  ],
  {
    experimental: {
      modern: true,
      polyfillsOptimization: true,
    },

    webpack(config, { dev, isServer }) {
      const splitChunks =
        config.optimization && config.optimization.splitChunks;
      if (splitChunks) {
        const cacheGroups = splitChunks.cacheGroups;
        const preactModules = /[\\/]node_modules[\\/](preact|preact-render-to-string|preact-context-provider)[\\/]/;
        if (cacheGroups.framework) {
          cacheGroups.preact = Object.assign({}, cacheGroups.framework, {
            test: preactModules,
          });
          cacheGroups.commons.name = "framework";
        } else {
          cacheGroups.preact = {
            name: "commons",
            chunks: "all",
            test: preactModules,
          };
        }
      }

      // Install webpack aliases:
      const aliases = config.resolve.alias || (config.resolve.alias = {});
      aliases.react = aliases["react-dom"] = "preact/compat";

      // inject Preact DevTools
      if (dev && !isServer) {
        const entry = config.entry;
        config.entry = () =>
          entry().then((entries) => {
            entries["main.js"] = ["preact/debug"].concat(
              entries["main.js"] || []
            );
            return entries;
          });
      }

      return config;
    },
  }
);
