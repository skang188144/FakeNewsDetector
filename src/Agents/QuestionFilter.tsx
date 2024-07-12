import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// import.meta.env.OPENAI_API_KEY

export async function questionFilterAgent (state : GraphState, config? : RunnableConfig) {
  const llm = state.llm;
  const query = state.query;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an AI agent for a certain web application. Your job is to receive queries, and'
             + 'determine if a query can pass through to the next AI agent in the chain. The next agent '
             + 'in the chain is a fact checker agent, so your role is NOT to determine if a query is '
             + 'true or false. Again, it does not matter if a query you receive is false, misinformation,'
             + 'conspiracy theories, or etc. It only matters if the query can be evaluated for its truthfulness.\n'
    ],
    ['user', 'The query is valid and may pass through if it meets the following criteria:\n'

           + '1. The query is not a question, but is an assertion.\n'

           + 'Here is the query:\n'
           + '{query}\n'

           + 'Based solely on the criteria above, please return nothing but a single string of the word '
           + 'VALID or INVALID.'
    ]
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query
  });

  console.log(response.content);

  if (response.content === 'VALID') {
    state.queryValidity = true;
  } else if (response.content === 'INVALID') {
    state.queryValidity = false;
  }

  return state;
};

export function questionFilterRouter(state : GraphState) {
  const queryValidity = state.queryValidity;

  if (queryValidity === true) {
    return 'opinionFilterAgent';
  } else {
    return 'end';
  }
};