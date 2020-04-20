import { DFA } from "mentor-parser/parsers/dfa";

class ValidationError extends Error {
  name = "ValidationError";
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class NormalizedDFA {
  constructor(
    readonly alphabet: string[],
    readonly simpleAlphabet: boolean,
    readonly initialState: string,
    readonly acceptingStates: string[],
    readonly stateTransitions: { [state: string]: { [symbol: string]: string } }
  ) {}
}

export function normalize(dfa: DFA): NormalizedDFA {
  const output: NormalizedDFA = new NormalizedDFA(
    [...dfa.alphabet],
    dfa.alphabet.every((s) => s.length === 1),
    dfa.initialState,
    dfa.acceptingStates,
    {}
  );

  for (const st of dfa.stateTransitions) {
    let transitionMap = output.stateTransitions[st.state];

    if (!transitionMap) {
      transitionMap = output.stateTransitions[st.state] = {};
    }

    for (const t of st.transitions) {
      if (!output.alphabet.includes(t.symbol)) {
        throw new ValidationError(
          `State transition "${st.state}" accepts "${t.symbol}", which is not in the alphabet`
        );
      }

      if (transitionMap[t.symbol]) {
        throw new ValidationError(
          `Duplicate state transition from "${st.state}" under "${t.symbol}"`
        );
      }

      transitionMap[t.symbol] = t.state;
    }
  }

  if (!output.stateTransitions[output.initialState]) {
    throw new ValidationError(
      `Initial state "${output.initialState}" is not a defined state`
    );
  }

  for (const state of Object.keys(output.stateTransitions)) {
    const transitionMap = output.stateTransitions[state];

    for (const symbol of output.alphabet) {
      if (!transitionMap.hasOwnProperty(symbol)) {
        throw new ValidationError(
          `State "${state}" missing transition for "${symbol}"`
        );
      }
    }

    for (const symbol of Object.keys(transitionMap)) {
      if (!output.stateTransitions[transitionMap[symbol]]) {
        throw new ValidationError(
          `State transition from "${state}" under "${symbol}" transitions to "${transitionMap[symbol]}", which is not a defined state`
        );
      }
    }
  }

  return output;
}

type Edge = {
  start: string;
  end: string;
  symbol: string;
};

export function edgeList(dfa: NormalizedDFA): Edge[] {
  return Object.entries(dfa.stateTransitions).flatMap(
    ([start, transitionMap]) =>
      Object.entries(transitionMap).flatMap(([symbol, end]) => ({
        start,
        end,
        symbol,
      }))
  );
}
