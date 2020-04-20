import React, { useCallback, useMemo, useState } from "react";
import tw from "twin.macro";
import { normalize, NormalizedDFA } from "utils/mentor";
import { parseDFA } from "mentor-parser";
import StateMachineGraph from "components/StateMachineGraph";

const PageLayout = tw.div`
  min-h-screen
  bg-gray-200
  py-px
`;

const Block = tw.div`
  p-6 my-4 mx-auto
  max-w-screen-md
  bg-white
  rounded-lg
  shadow
`;

const Editor = tw.textarea`
  p-4
  w-full
  bg-gray-100
  rounded
`;

const Error = tw.div`
  p-4
  bg-red-200
  rounded
`;

const Title = tw.h1`
  text-2xl font-bold
`;

const defaultDFA = `alphabet: {a}
start: Q0
accepting: {Q0}

Q0 (a -> Q1)
Q1 (a -> Q2)
Q2 (a -> Q0)
`;

type ErrorLocation = {
  line: number;
  column: number;
};

type FSMOrError =
  | { fsm: NormalizedDFA; error?: never }
  | {
      fsm?: never;
      error: { name: string; message: string; location?: ErrorLocation };
    };

const IndexPage: React.FC = () => {
  const [mentorSource, setMentorSource] = useState(defaultDFA);

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMentorSource(e.target.value);
  }, []);

  const compileResult = useMemo<FSMOrError>(() => {
    try {
      return { fsm: normalize(parseDFA(mentorSource)) };
    } catch (e) {
      const location = e?.location?.start || undefined;
      return { error: { name: e.name, message: e.message, location } };
    }
  }, [mentorSource]);

  return (
    <PageLayout>
      <Block>
        <Title>Mentor DFA Source</Title>
        <Editor rows={10} value={mentorSource} onChange={onChange} />
        {compileResult.error && (
          <Error>
            <b>{compileResult.error.name}</b>
            <p>
              {compileResult.error.location &&
                `Line ${compileResult.error.location.line}, column ${compileResult.error.location.column}: `}
              {compileResult.error.message}
            </p>
          </Error>
        )}
      </Block>
      <Block>
        <Title>State Machine Graph</Title>
        {compileResult.fsm && (
          <StateMachineGraph stateMachine={compileResult.fsm} />
        )}
      </Block>
    </PageLayout>
  );
};

export default IndexPage;
