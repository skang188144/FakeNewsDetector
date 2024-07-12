import 'dotenv/config';
import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from "@langchain/core/runnables";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

export function searcherAgent (state : GraphState, config? : RunnableConfig) {
  const tools = [new TavilySearchResults({ maxResults: 10 })]; // TODO: increase max limit once in production

  return state;
}