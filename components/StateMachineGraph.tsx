import React from "react";
import styled from "@emotion/styled/macro";
import { Graphviz } from "graphviz-react";
import { edgeList, FiniteAutomaton } from "utils/mentor";

const Wrapper = styled.div`
  height: 100%;

  & > div {
    height: 100%;
  }

  svg {
    polygon[fill="#ffffff"] {
      fill: transparent;
    }
  }
`;

function getDotSource(automaton: FiniteAutomaton) {
  const edges = edgeList(automaton);

  return `
    digraph {
      rankdir=LR;
      size="8,5";
      node [shape=point]; __start;
      node [shape = doublecircle]; ${automaton.acceptingStates.join()};
      node [shape = circle];
      
      __start -> ${automaton.initialState} [arrowhead = empty];
      ${edges
        .map(
          (edge) =>
            `${edge.start} -> ${edge.end} [label = "${edge.symbol || "λ"}"];`
        )
        .join("\n")}
    }
  `;
}

type StateMachineGraphProps = {
  stateMachine: FiniteAutomaton;
};

const StateMachineGraph: React.FC<StateMachineGraphProps> = (props) => {
  const { stateMachine } = props;
  return (
    <Wrapper>
      <Graphviz
        key={JSON.stringify(stateMachine)} // prevent React from reusing this component
        dot={getDotSource(stateMachine)}
        options={{ width: "100%", height: "100%", zoom: true }}
      />
    </Wrapper>
  );
};

export default StateMachineGraph;
