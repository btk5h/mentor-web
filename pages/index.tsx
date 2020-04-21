import React, { useCallback, useMemo, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import tw from "twin.macro";
import AutomataSelect, {
  AutomatonType,
  getParser,
} from "components/AutomataSelect";
import { FiniteAutomaton } from "utils/mentor";
const StateMachineGraph = dynamic(
  () => import("components/StateMachineGraph"),
  { ssr: false }
);

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

const Warning = tw.div`
  p-4
  bg-yellow-200
  rounded
`;

const Title = tw.h1`
  text-2xl font-bold
  mb-2
`;

const Text = tw.p`
  mb-2
`;

const Link = tw.a`
  text-blue-600
  hover:underline
`;

const InputSection = tw.div`
  mb-4
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

type AutomatonOrError =
  | { automaton: FiniteAutomaton; error?: never }
  | {
      automaton?: never;
      error: { name: string; message: string; location?: ErrorLocation };
    };

const IndexPage: React.FC = () => {
  const [automatonType, setAutomatonType] = useState<AutomatonType>("DFA");
  const [mentorSource, setMentorSource] = useState(defaultDFA);

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMentorSource(e.target.value);
  }, []);

  const compileResult = useMemo<AutomatonOrError>(() => {
    try {
      return { automaton: getParser(automatonType)(mentorSource) };
    } catch (e) {
      const location = e?.location?.start || undefined;
      return { error: { name: e.name, message: e.message, location } };
    }
  }, [mentorSource, automatonType]);

  return (
    <PageLayout>
      <Head>
        <title>Mentor</title>
      </Head>
      <Block>
        <Title>Web Mentor Proof of Concept</Title>
        <Text>
          This is a proof of concept for a web port of UCSB's Mentor, a tool for
          testing automata.
        </Text>
        <Text>
          Currently, this app only parses/validates Mentor's DFA/NFA syntax and
          outputs a visualization of the automaton using Graphviz. In the
          future, the goal of this project is to support all of the types of
          automata that Mentor supports and to add tools for testing those
          automata.
        </Text>
        <Text>
          Created by Bryan Terce, check out the source code on{" "}
          <Link href="https://github.com/btk5h/mentor-web">GitHub</Link>.
        </Text>
      </Block>
      <Block>
        <Title>Mentor Source</Title>
        <InputSection>
          <label>
            {"Automaton Type: "}
            <AutomataSelect value={automatonType} onChange={setAutomatonType} />
          </label>
        </InputSection>
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
        {compileResult.automaton ? (
          <StateMachineGraph stateMachine={compileResult.automaton} />
        ) : (
          <Warning>
            <p>
              Your {automatonType} must be valid in order to generate a
              visualization.
            </p>
          </Warning>
        )}
      </Block>
    </PageLayout>
  );
};

export default IndexPage;
