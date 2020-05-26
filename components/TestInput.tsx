import React, { ChangeEvent, useCallback } from "react";
import tw from "twin.macro";

const Input = tw.input`
  
`;

const ResultLabel = tw.div`
  text-xs font-bold
`;

// @ts-ignore
const AcceptLabel = tw(ResultLabel)`
  text-green-700
`;

// @ts-ignore
const RejectLabel = tw(ResultLabel)`
  text-red-700
`;

type TestInputProps = {
  value: string;
  onChange: (value: string) => void;
  state: "accept" | "reject";
};

const TestInput: React.FC<TestInputProps> = (props) => {
  const { value, onChange, state } = props;

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div>
      <Input value={value} onChange={onInputChange} />
      {state === "accept" ? (
        <AcceptLabel>Accept</AcceptLabel>
      ) : (
        <RejectLabel>Reject</RejectLabel>
      )}
    </div>
  );
};

export default TestInput;
