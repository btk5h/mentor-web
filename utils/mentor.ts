import { DFA } from "mentor-parser/parsers/dfa";

class ValidationError extends Error {
  name = "ValidationError";
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

type FiniteAutomaton = {
  readonly alphabet: string[];
  readonly simpleAlphabet: boolean;
  readonly initialState: string;
  readonly acceptingStates: string[];
  readonly stateTransitions: { [state: string]: object };
};

function validateInitialState(automaton: FiniteAutomaton) {
  if (!automaton.stateTransitions[automaton.initialState]) {
    throw new ValidationError(
      `Initial state "${automaton.initialState}" is not a defined state`
    );
  }
}

function validateAcceptingStates(automaton: FiniteAutomaton) {
  for (const state of automaton.acceptingStates) {
    if (!automaton.stateTransitions[state]) {
      throw new ValidationError(
        `Accepting state "${state}" is not a defined state`
      );
    }
  }
}

function populateDFATransitions(source: DFA, dfa: NormalizedDFA) {
  for (const st of source.stateTransitions) {
    let transitionMap = dfa.stateTransitions[st.state];

    if (!transitionMap) {
      transitionMap = dfa.stateTransitions[st.state] = {};
    }

    for (const t of st.transitions) {
      if (!dfa.alphabet.includes(t.symbol)) {
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
}

function validateDFAComplete(dfa: NormalizedDFA) {
  for (const [state, transitionMap] of Object.entries(dfa.stateTransitions)) {
    for (const symbol of dfa.alphabet) {
      if (!transitionMap.hasOwnProperty(symbol)) {
        throw new ValidationError(
          `State "${state}" missing transition for "${symbol}"`
        );
      }
    }

    for (const symbol of Object.keys(transitionMap)) {
      if (!dfa.stateTransitions[transitionMap[symbol]]) {
        throw new ValidationError(
          `State transition from "${state}" under "${symbol}" transitions to "${transitionMap[symbol]}", which is not a defined state`
        );
      }
    }
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

  populateDFATransitions(dfa, output);
  validateInitialState(output);
  validateAcceptingStates(output);
  validateDFAComplete(output);

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
