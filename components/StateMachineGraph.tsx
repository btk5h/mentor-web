import React from "react";
import styled from "@emotion/styled/macro";
import { edgeList, NormalizedDFA } from "utils/mentor";
import { Graphviz } from "graphviz-react";

const Wrapper = styled.div`
  svg {
    width: 100%;
  }
`;

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
    <Wrapper>
      <Graphviz
        dot={getDotSource(stateMachine)}
        options={{ width: undefined, height: undefined }}
      />
    </Wrapper>
  );
};

export default StateMachineGraph;
