import GraphState from '../Utilities/GraphState.tsx';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { QueryState, QueryTruthfulness } from '../Utilities/StatusCodes.tsx';
import { queryTruthfulnessOutputStructure } from '../Utilities/OutputStructures.tsx';

export async function factCheckerAgent (state : GraphState) {
  /*
   * State
   */
  const { query, querySearchResults, setQueryState } = state;
  const llm = state.llm.withStructuredOutput(queryTruthfulnessOutputStructure);

  // Update the App React component on what stage the graph is in
  setQueryState(QueryState.LOADING_FACT_CHECKING);

  /*
   * AI Prompt
   */
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a fact checker for a misinformation detector application. Your sole job is to '
             + 'determine if the query you receive is true or false. You will be given a list of sources '
             + 'from the Internet to parse through. You must extract a detailed summary of each source, '
             + 'and determine if each source points to the initial query being true or false. In your '
             + 'final output, you must include how many sources pointed to your conclusion, and how '
             + 'many did not agree. In a separate section, include your own determination of whether the '
             + 'query is true or false, based solely on the knowledge that you have, and without the '
             + 'list of sources that was initially provided to you.\n'
    ],
    ['user', 'Here is the original query:\n'
           + '{query}\n'

           + 'Here is the list of sources:\n'
           + '{querySearchResults}'
    ]
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query,
    querySearchResults: querySearchResults.map((obj : any) => obj.url).join(' , ')
  });

  if (response.sourcesTruthfulness === 'TRUE_QUERY') {
    state.querySourcesTruthfulness = QueryTruthfulness.TRUE_QUERY;
  } else if (response.sourcesTruthfulness === 'FALSE_QUERY') {
    state.querySourcesTruthfulness = QueryTruthfulness.FALSE_QUERY;
  } else {
    state.querySourcesTruthfulness = QueryTruthfulness.QUERY_TRUTHFULNESS_ERROR;
  }

  if (response.internalTruthfulness === 'TRUE_QUERY') {
    state.queryInternalTruthfulness = QueryTruthfulness.TRUE_QUERY;
  } else if (response.internalTruthfulness === 'FALSE_QUERY') {
    state.queryInternalTruthfulness = QueryTruthfulness.FALSE_QUERY;
  } else {
    state.queryInternalTruthfulness = QueryTruthfulness.QUERY_TRUTHFULNESS_ERROR;
  }

  state.querySourcesTruthfulnessRatio = response.sourcesRatio;
  state.querySourcesTruthfulnessReasoning = response.sourcesReasoning;
  state.queryInternalTruthfulnessReasoning = response.internalReasoning;

  setQueryState(QueryState.QUERY_COMPLETE);

  return state;
}