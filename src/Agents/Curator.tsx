import GraphState from '../utilities/GraphState.tsx';
import { RunnableConfig } from "@langchain/core/runnables";

export default function curatorAgent (state : GraphState, config? : RunnableConfig) {
  return state;
}