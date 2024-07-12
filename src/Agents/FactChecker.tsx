import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from "@langchain/core/runnables";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { QueryTruthfulness } from '../Utilities/StatusCodes.tsx';

export async function factCheckerAgent (state : GraphState, config? : RunnableConfig) {
  const { llm, query, querySearchResults } = state;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a fact checker for a misinformation detector application. Your sole job is to '
             + 'determine if the query you receive is true or false. You will be given a list of sources '
             + 'from the Internet to parse through. You must extract the core points from each source, '
             + 'and determine if each source points to the initial query being true or false. In your '
             + 'final output, you must include how many sources pointed to your conclusion, and how '
             + 'many did not agree. In a separate section, include your own determination of whether the '
             + 'query is true or false, based solely on the knowledge that you have, and without the '
             + 'list of sources that was initially provided to you.\n'
    ],
    ['user', 'Here is the query:\n'
           + '{query}\n'

           + 'Like mentioned in your system prompt, you must include two sections in your response. The '
           + 'first section must include three things: the string TRUE_QUERY or FALSE_QUERY depending on '
           + 'your determination based solely on the sources; a fraction in the form of x/y representing '
           + 'the number of sources that agreed with your determination, out of the total number of sources; '
           + 'and finally a short paragraph summarizing why the sources that agreed with you, did so.\n'

           + 'The second section must include two things: the string TRUE_QUERY or FALSE_QUERY depending on '
           + 'your determination based solely on your own knowledge, excluding the previous sources; and '
           + 'finally a short paragraph summarizing why your determination is so.'
    ]
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query
  });

  console.log(response.content);

  if (response.content.toString().includes('TRUE_QUERY')) {
    state.queryTruthfulness = QueryTruthfulness.TRUE_QUERY;
  } else if (response.content.toString().includes('FALSE_QUERY')) {
    state.queryTruthfulness = QueryTruthfulness.FALSE_QUERY
  } else {
    state.queryTruthfulness = QueryTruthfulness.QUERY_TRUTHFULNESS_ERROR;
  }

  return state;
}

export function factCheckerRouter(state : GraphState) {
  const { queryTruthfulness } = state;

  if (queryTruthfulness === QueryTruthfulness.TRUE_QUERY) {
    return 'searcherAgent';
  } else {
    return 'end';
  }
};