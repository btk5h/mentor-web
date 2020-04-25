import React from "react";
import { addDecorator } from "@storybook/react";
import { withA11y } from "@storybook/addon-a11y";
import { withKnobs } from "@storybook/addon-knobs";

import "tailwindcss/dist/base.css";

addDecorator((storyFn) => <div style={{ padding: "1rem" }}>{storyFn()}</div>);
addDecorator(withA11y);
addDecorator(withKnobs);
