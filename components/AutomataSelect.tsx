import React, { useCallback } from "react";
import { parseDFA, parseNFA } from "mentor-parser";
import { FiniteAutomaton, normalizeDFA, normalizeNFA } from "utils/mentor";

export type AutomatonType = "DFA" | "NFA";

export function getParser(
  type: AutomatonType
): (source: string) => FiniteAutomaton {
  if (type === "DFA") {
    return (source) => normalizeDFA(parseDFA(source));
  }

  if (type === "NFA") {
    return (source) => normalizeNFA(parseNFA(source));
  }

  throw new Error("Invalid parser type");
}

type AutomataSelectProps = {
  value: AutomatonType;
  onChange: (value: AutomatonType) => void;
};

const AutomataSelect: React.FC<AutomataSelectProps> = (props) => {
  const { value, onChange } = props;

  const callback = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value as AutomatonType);
    },
    [onChange]
  );

  return (
    <select value={value} onChange={callback}>
      <option value="DFA">DFA</option>
      <option value="NFA">NFA</option>
    </select>
  );
};

export default AutomataSelect;
