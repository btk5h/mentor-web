import { DFA } from "mentor-parser/parsers/dfa";
import { NFA } from "mentor-parser/parsers/nfa";

class ValidationError extends Error {
  name = "ValidationError";
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export type FiniteAutomaton = {
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

export function normalizeDFA(dfa: DFA): NormalizedDFA {
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

function edgeListDFA(dfa: NormalizedDFA): Edge[] {
  return Object.entries(dfa.stateTransitions).flatMap(
    ([start, transitionMap]) =>
      Object.entries(transitionMap).flatMap(([symbol, end]) => ({
        start,
        end,
        symbol,
      }))
  );
}

function populateNFATransitions(source: NFA, nfa: NormalizedNFA) {
  function ensureHasState(state: string) {
    let transitionMap = nfa.stateTransitions[state];

    if (!transitionMap) {
      transitionMap = nfa.stateTransitions[state] = {};
    }

    return transitionMap;
  }

  function ensureHasEdges(
    transitionMap: { [symbol: string]: string[] },
    symbol: string
  ) {
    let transitionArray = transitionMap[symbol];

    if (!transitionArray) {
      transitionArray = transitionMap[symbol] = [];
    }

    return transitionArray;
  }

  for (const st of source.stateTransitions) {
    const start = st.state;
    const transitionMap = ensureHasState(start);

    for (const { symbol, state: end } of st.transitions) {
      if (symbol && !nfa.alphabet.includes(symbol)) {
        throw new ValidationError(
          `State transition "${st.state}" accepts "${symbol}", which is not in the alphabet`
        );
      }

      ensureHasState(end);
      const transitionArray = ensureHasEdges(transitionMap, symbol);
      transitionArray.push(end);
    }
  }
}

export class NormalizedNFA {
  constructor(
    readonly alphabet: string[],
    readonly simpleAlphabet: boolean,
    readonly initialState: string,
    readonly acceptingStates: string[],
    readonly stateTransitions: {
      [state: string]: { [symbol: string]: string[] };
    }
  ) {}
}

export function normalizeNFA(nfa: NFA): NormalizedNFA {
  const output: NormalizedNFA = new NormalizedNFA(
    [...nfa.alphabet],
    nfa.alphabet.every((s) => s.length === 1),
    nfa.initialState,
    nfa.acceptingStates,
    {}
  );

  populateNFATransitions(nfa, output);
  validateInitialState(output);
  validateAcceptingStates(output);

  return output;
}

function edgeListNFA(nfa: NormalizedNFA): Edge[] {
  return Object.entries(nfa.stateTransitions).flatMap(
    ([start, transitionMap]) =>
      Object.entries(transitionMap).flatMap(([symbol, endStates]) =>
        endStates.flatMap((end) => ({
          start,
          end,
          symbol,
        }))
      )
  );
}

export function edgeList(automaton: FiniteAutomaton): Edge[] {
  if (automaton instanceof NormalizedDFA) {
    return edgeListDFA(automaton);
  }

  if (automaton instanceof NormalizedNFA) {
    return edgeListNFA(automaton);
  }

  return [];
}

export function collapseEdges(edges: Edge[]): Edge[] {
  edges = [...edges].sort((a, b) =>
    a.start !== b.start
      ? a.start.localeCompare(b.start)
      : a.end.localeCompare(b.end)
  );

  return edges.reduce((acc, edge) => {
    if (!acc.length) {
      return [edge];
    }

    const top = acc[acc.length - 1];

    if (edge.start === top.start && edge.end === top.end) {
      return [
        ...acc.slice(0, acc.length - 1),
        { ...top, symbol: `${top.symbol}, ${edge.symbol}` },
      ];
    }

    return [...acc, edge];
  }, [] as Edge[]);
}
