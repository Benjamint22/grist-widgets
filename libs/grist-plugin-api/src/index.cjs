const contents = require("../build/_build/app/plugin/grist-plugin-api");

module.exports = "default" in contents ? contents.default : contents;
