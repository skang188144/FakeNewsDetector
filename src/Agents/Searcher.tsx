import 'dotenv/config';
import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from "@langchain/core/runnables";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

export async function searcherAgent (state : GraphState, config? : RunnableConfig) {
  const { query } = state;
  const searchTool = new TavilySearchResults({ maxResults: 10 }); // TODO: increase max limit once in production
  const searchResults = JSON.parse(await searchTool.invoke(query).then());

  state.querySearchResults = searchResults;

  return state;
}