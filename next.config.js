const withTranspiledModules = require("next-transpile-modules")([
  "graphviz-react",
]);

module.exports = withTranspiledModules();
