import tw from "twin.macro";

const Alert = tw.div`
  p-4 my-4
  rounded
`;

// @ts-ignore
export const Info = tw(Alert)`
  bg-blue-200
  text-blue-900
`;

// @ts-ignore
export const Warning = tw(Alert)`
  bg-yellow-200
  text-yellow-900
`;

// @ts-ignore
export const Fatal = tw(Alert)`
  bg-red-200
  text-red-900
`;
