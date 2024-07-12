import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { QueryValidity } from '../Utilities/StatusCodes.tsx';

export async function opinionFilterAgent (state : GraphState, config? : RunnableConfig) {
  const { llm, query } = state;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an AI agent for a certain web application. Your job is to receive queries, and'
             + 'determine if a query can pass through to the next AI agent in the chain. The next agent '
             + 'in the chain is a fact checker agent, so your role is NOT to determine if a query is '
             + 'true or false. Again, it does not matter if a query you receive is false, misinformation,'
             + 'conspiracy theories, or etc. It only matters if the query can be evaluated for its truthfulness.\n'
    ],
    ['user', 'The query is valid and may pass through if it meets the following criteria:\n'

           + '1. The query can be determined to be objectively true or false, and can be proven to be so. A '
           + 'query is invalid if it is an opinion, or is a subjective expression of personal belief, preference, '
           + 'or interpretation that may vary from person to person and cannot be definitively proven true '
           + "or false. For example, the query 'Pizza is good' is invalid, as it is a subjective opinion. However, "
           + "the query 'Lemons are limes' is valid, as even though it is false, it can be proven to be objectively "
           + 'false.\n'

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
    state.queryValidity = QueryValidity.VALID_QUERY;
  } else if (response.content === 'INVALID') {
    state.queryValidity = QueryValidity.INVALID_QUERY;
  } else {
    state.queryValidity = QueryValidity.QUERY_VALIDITY_ERROR;
  }

  return state;
};

export function opinionFilterRouter(state : GraphState) {
  const { queryValidity } = state;

  if (queryValidity === QueryValidity.VALID_QUERY) {
    return 'publicKnowledgeFilterAgent';
  } else {
    return 'end';
  }
};