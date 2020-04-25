import React, { useCallback, useMemo, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import tw from "twin.macro";
import AutomataSelect, {
  AutomatonType,
  getParser,
} from "components/AutomataSelect";
import TextArea from "components/TextArea";
import { Info, Fatal } from "components/Alert";
import { FiniteAutomaton } from "utils/mentor";
const StateMachineGraph = dynamic(
  () => import("components/StateMachineGraph"),
  { ssr: false }
);

const Layout = tw.div`
  flex flex-col
  md:flex-row
  min-h-screen
`;

const EditorPane = tw.div`
  px-6 py-4
  md:max-w-md
  flex-grow
  bg-white
  shadow z-20
`;

const InnerStuff = tw.div`
  flex flex-col
  lg:flex-row
  flex-grow
`;

const DetailsPane = tw.div`
  px-6 py-4
  lg:max-w-xs
  flex-grow
  bg-gray-100 
  shadow z-10
`;

const PreviewPane = tw.div`
  flex-grow
  bg-gray-200 
`;

const Title = tw.h1`
  text-4xl font-bold
  mb-2
`;

const Text = tw.p`
  mb-2
`;

const Link = tw.a`
  text-blue-700
  hover:underline
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

function useAutomaton(source: string, type: AutomatonType) {
  return useMemo<AutomatonOrError>(() => {
    try {
      return { automaton: getParser(type)(source) };
    } catch (e) {
      const location = e?.location?.start || undefined;
      return { error: { name: e.name, message: e.message, location } };
    }
  }, [source, type]);
}

const TestPage: React.FC = () => {
  const [automatonType, setAutomatonType] = useState<AutomatonType>("DFA");
  const [mentorSource, setMentorSource] = useState(defaultDFA);
  const [collapseEdges, setCollapseEdges] = useState(true);

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMentorSource(e.target.value);
  }, []);

  const onSetCollapseEdges = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCollapseEdges(e.target.checked);
    },
    []
  );

  const compileResult = useAutomaton(mentorSource, automatonType);

  return (
    <Layout>
      <Head>
        <title>Mentor</title>
      </Head>
      <EditorPane>
        <Title>Mentor</Title>
        <label>
          {"Automaton Type: "}
          <AutomataSelect value={automatonType} onChange={setAutomatonType} />
        </label>
        <br />
        <label>
          {"Collapse similar edges: "}
          <input
            type="checkbox"
            checked={collapseEdges}
            onChange={onSetCollapseEdges}
          />
        </label>
        <TextArea rows={10} value={mentorSource} onChange={onChange} />
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
      </EditorPane>
      <InnerStuff>
        <DetailsPane>
          {compileResult.automaton && (
            <Info>Your {automatonType} is valid</Info>
          )}
          {compileResult.error && (
            <Fatal>
              <b>{compileResult.error.name}</b>
              <p>
                {compileResult.error.location &&
                  `Line ${compileResult.error.location.line}, column ${compileResult.error.location.column}: `}
                {compileResult.error.message}
              </p>
            </Fatal>
          )}
        </DetailsPane>
        <PreviewPane>
          {compileResult.automaton && (
            <StateMachineGraph
              stateMachine={compileResult.automaton}
              collapse={collapseEdges}
            />
          )}
        </PreviewPane>
      </InnerStuff>
    </Layout>
  );
};

export default TestPage;
