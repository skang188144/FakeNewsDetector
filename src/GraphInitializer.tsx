import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import filterAgent from './Agents/Filter';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

/**
 * Interface for storing the graph's state
 */
export interface GraphState {
  llm: ChatGoogleGenerativeAI;
  query: string;
  queryValidity: boolean
};

/**
 * A reducer will:
 * - keep track of the current state
 * - take in new information that causes state modification
 * - process the dispatched information and calculate a new state
 * - return this new state so the application can use it
 */

/**
 * Initialize the graph state
 */


const graphState : StateGraphArgs<GraphState>['channels'] = {
  llm: null
  // {
  //   reducer: (oldLLM, newLLM) => newLLM,
  //   default: () => new ChatGoogleGenerativeAI({
  //     modelName: 'gemini-pro',
  //     safetySettings: [{
  //       category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  //       threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  //     }]
  //   })
  // }
  ,
  query: null
  // {
  //   reducer: (oldQuery : string, newQuery : string) => newQuery,
  //   default: () => ""
  // }
  ,
  queryValidity: null
  // {
  //   reducer: (queryValidity : boolean) => queryValidity,
  //   default: () => false
  // }
};

function createGraph() {
  const graph = new StateGraph<GraphState>({
    channels: graphState
  })
  .addNode('filterNode', filterAgent)
  .addEdge(START, 'filterNode')
  .addEdge('filterNode', END)
  .compile();

  return graph;
}

async function main() {
  const result1 = createGraph().invoke({ 
    llm: new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      safetySettings: [{
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      }]
    }), 
    query: 'testing testing testing'
  });

  console.log(result1);
}

main();