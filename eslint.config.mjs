import { createRequire } from "module";

const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next");

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/", ".open-next/", ".wrangler/", "node_modules/"],
  },
];

export default eslintConfig;
