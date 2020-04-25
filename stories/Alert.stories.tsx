import React from "react";
import { Fatal, Info, Warning } from "components/Alert";

export default {
  title: "Alert",
};

export const info = () => (
  <Info>
    <b>Title</b>
    <p>This is an info message</p>
  </Info>
);

export const warning = () => (
  <Warning>
    <b>Title</b>
    <p>This is an warning message</p>
  </Warning>
);

export const fatal = () => (
  <Fatal>
    <b>Title</b>
    <p>This is an error message</p>
  </Fatal>
);
