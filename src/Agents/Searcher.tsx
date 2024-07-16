import GraphState from '../utilities/GraphState.tsx';
import { RunnableConfig } from "@langchain/core/runnables";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { QueryState } from '../utilities/StatusCodes.tsx';

export async function searcherAgent (state : GraphState, config? : RunnableConfig) {
  /*
   * State
   */
  const { query, setQueryState } = state;

  // Update the App React component on what stage the graph is in
  setQueryState(QueryState.LOADING_SOURCES_SEARCHING);

  const searchTool = new TavilySearchResults({ apiKey: import.meta.env.VITE_TAVILY_API_KEY, maxResults: 10 }); // TODO: increase max limit once in production
  const searchResults = JSON.parse(await searchTool.invoke(query).then());
  state.querySearchResults = searchResults;

  return state;
}