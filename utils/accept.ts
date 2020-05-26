import { NormalizedDFA, NormalizedNFA } from "utils/mentor";

class AcceptError extends Error {
  name = "AcceptError";

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

function tokenize(text: string, { simpleAlphabet = true } = {}) {
  return text.split(simpleAlphabet ? "" : /\s+/).filter(Boolean);
}

export function acceptDFA(dfa: NormalizedDFA, text: string) {
  const input = tokenize(text, { simpleAlphabet: dfa.simpleAlphabet });
  let state = dfa.initialState;

  for (const symbol of input) {
    if (!dfa.stateTransitions[state][symbol]) {
      throw new AcceptError(`Symbol "${symbol}" not in alphabet`);
    }

    state = dfa.stateTransitions[state][symbol];
  }

  return dfa.acceptingStates.includes(state);
}

export function acceptNFA(nfa: NormalizedNFA, text: string) {
  const input = tokenize(text, { simpleAlphabet: nfa.simpleAlphabet });

  function equivalentStates(stateSet: Set<string>): Set<string> {
    const outputSet = new Set(stateSet);

    for (const state of stateSet) {
      const transitions = nfa.stateTransitions[state][""];

      if (transitions) {
        transitions.forEach((e) => outputSet.add(e));
      }
    }

    if (Array.from(outputSet).every((e) => stateSet.has(e))) {
      return outputSet;
    }

    return equivalentStates(outputSet);
  }

  let stateSet = equivalentStates(new Set([nfa.initialState]));

  for (const symbol of input) {
    if (!nfa.alphabet.includes(symbol)) {
      throw new AcceptError(`Symbol "${symbol}" not in alphabet`);
    }

    const nextStateSet = new Set<string>();

    for (const state of stateSet) {
      if (nfa.stateTransitions[state][symbol]) {
        nfa.stateTransitions[state][symbol].forEach((e) => nextStateSet.add(e));
      }
    }

    if (nextStateSet.size === 0) {
      return false;
    }

    stateSet = equivalentStates(nextStateSet);
  }

  return nfa.acceptingStates.some((e) => stateSet.has(e));
}
