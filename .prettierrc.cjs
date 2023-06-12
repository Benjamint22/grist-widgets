/** @type {import('prettier').Config} */
module.exports = {
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
  importOrder: ["^[./]", "^\\/", "^\\.\\.\\/", "^\\.\\/"],
};
