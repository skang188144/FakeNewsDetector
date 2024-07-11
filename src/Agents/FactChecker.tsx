import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from "@langchain/core/runnables";
import { ChatPromptTemplate } from '@langchain/core/prompts';

export async function factCheckerAgent (state : GraphState, config? : RunnableConfig) {
  const llm = state.llm;
  const query = state.query;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a fact checker for a misinformation detector application. Your sole job is to '
             + 'determine if the query you receive is true or false.\n'
    ],
    ['user', 'Your role is being a fact checker for a misinformation detector application. Your task '
           + 'is to take a certain statement as input, and determine if that statement is a fact or '
           + 'not.\n'
           
           + 'A statement is a fact if it is provably true. Opinions are not facts. All other statements '
           + 'are considered to be not a fact.\n'

           + 'Here is the statement:\n'
           + '{query}\n'

           + 'Please return nothing but a single string of the word FACT in all uppercase if the '
           + 'statement is a fact, and NOT_A_FACT if the statement is not a fact.'
    ]
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query
  });

  if (response.content === 'FACT') {
    state.queryIsAFact = true;
  } else if (response.content === 'NOT_A_FACT') {
    state.queryIsAFact = false;
  }

  return state;
}

export function discardIfNotAFact(state : GraphState) {
  const queryIsAFact = state.queryIsAFact;

  if (queryIsAFact === true) {
    return 'searcherAgent';
  } else {
    return 'end';
  }
};