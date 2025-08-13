declare module "react/jsx-runtime" {
  export { jsx, jsxs, Fragment } from "react";

  export interface JSX {
    Element: React.ReactElement;
    ElementClass: React.Component;
    ElementAttributesProperty: {
      props: {};
    };
    ElementChildrenAttribute: {
      children: {};
    };
    IntrinsicElements: {
      [elemName: string]: any;
    };
  }
}
