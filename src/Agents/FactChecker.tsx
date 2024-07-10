import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from "@langchain/core/runnables";

export default function factCheckerAgent (state : GraphState, config? : RunnableConfig) {
  return state;
}