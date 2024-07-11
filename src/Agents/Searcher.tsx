import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from "@langchain/core/runnables";

export function searcherAgent (state : GraphState, config? : RunnableConfig) {
  return state;
}