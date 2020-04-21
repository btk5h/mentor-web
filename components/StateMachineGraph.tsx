import React from "react";
import { edgeList, NormalizedDFA } from "utils/mentor";
import { Graphviz } from "graphviz-react";

function getDotSource(dfa: NormalizedDFA) {
  const edges = edgeList(dfa);

  return `
    digraph {
      rankdir=LR;
      size="8,5";
      node [shape=point]; __start;
      node [shape = doublecircle]; ${dfa.acceptingStates.join()};
      node [shape = circle];
      
      __start -> ${dfa.initialState} [arrowhead = empty];
      ${edges
        .map(
          (edge) => `${edge.start} -> ${edge.end} [label = "${edge.symbol}"];`
        )
        .join("\n")}
    }
  `;
}

type StateMachineGraphProps = {
  stateMachine: NormalizedDFA;
};

const StateMachineGraph: React.FC<StateMachineGraphProps> = (props) => {
  const { stateMachine } = props;
  return (
    <Graphviz
      dot={getDotSource(stateMachine)}
      options={{ width: undefined, height: undefined }}
    />
  );
};

export default StateMachineGraph;
