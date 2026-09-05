import base from "@pos/config/eslint.base.js";

// NestJS relies on decorator metadata (emitDecoratorMetadata) to resolve constructor
// dependencies at runtime, which requires class references to stay as real value imports
// even when only used in a type position. Auto-fixing "import type" here would break DI.
export default [...base, { rules: { "@typescript-eslint/consistent-type-imports": "off" } }];
