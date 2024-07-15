import GraphState from '../utilities/GraphState.tsx';
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { QueryState, QueryValidity } from '../utilities/StatusCodes.tsx';
import { queryValidityOutputStructure } from '../utilities/OutputStructures.tsx';

export async function questionFilterAgent (state : GraphState, config? : RunnableConfig) {
  const { query } = state;
  const llm = state.llm.withStructuredOutput(queryValidityOutputStructure);

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
    ]
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query
  });

  console.log(response.validity);

  if (response.validity === 'VALID_QUERY') {
    state.queryValidity = QueryValidity.VALID_QUERY;
  } else if (response.validity === 'INVALID_QUERY') {
    state.queryValidity = QueryValidity.INVALID_QUERY;
    state.queryValidityReasoning = response.reasoning;
  } else {
    state.queryValidity = QueryValidity.QUERY_VALIDITY_ERROR;
    state.queryValidityReasoning = response.reasoning;
  }

  return state;
};

export function questionFilterRouter(state : GraphState) {
  const { queryValidity, setQueryState } = state;

  if (queryValidity === QueryValidity.VALID_QUERY) {
    return 'opinionFilterAgent';
  } else {
    setQueryState(QueryState.ERROR_VALIDITY);
    return 'end';
  }
};