import filesize from "rollup-plugin-filesize";

const env = process.env.NODE_ENV;
const pkg = require("./package.json");

export default {
  input: "lib/index.js",
  output: {
    file: {
      es: pkg.module,
      cjs: pkg.main
    }[env],
    format: env
  },
  plugins: [filesize()]
};
