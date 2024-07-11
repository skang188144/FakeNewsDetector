import 'dotenv/config';
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { filterAgent, discardIfInvalid } from './Agents/Filter';
import { factCheckerAgent, discardIfNotAFact } from './Agents/FactChecker';
import { searcherAgent } from './Agents/Searcher';

/**
 * Interface for storing the graph's state
 */
export interface GraphState {
  llm: ChatGoogleGenerativeAI;
  query: string;
  queryValidity: boolean;
  queryIsAFact: boolean
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
  llm: // null
  {
    value: () =>  new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      safetySettings: [{
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      }],
      temperature: 0
    }),
    default: () => new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      safetySettings: [{
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      }],
      temperature: 0
    })
  },
  query: // null
  {
    value: (oldQuery : string, newQuery : string) => newQuery,
    default: () => ""
  },
  queryValidity: null,
  // {
  //   value: (oldQueryValidity : boolean, newQueryValidity : boolean) => newQueryValidity,
  //   default: () => false
  // },
  queryIsAFact: null
};

function createGraph() {
  const graph = new StateGraph<GraphState>({
    channels: graphState
  })
  .addNode('filterAgent', filterAgent)
  .addNode('factCheckerAgent', factCheckerAgent)
  .addNode('searcherAgent', searcherAgent)
  .addEdge(START, 'filterAgent')
  .addConditionalEdges('filterAgent', discardIfInvalid, {
    factCheckerAgent: 'factCheckerAgent',
    end: END
  })
  .addConditionalEdges('factCheckerAgent', discardIfNotAFact, {
    searcherAgent: 'searcherAgent',
    end: END
  })
  .addEdge('searcherAgent', END)
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
      }],
      temperature: 0
    }), 
    query: 'Pizza is made with glue.'
  });

  const result = await result1.then((r) => [r.query, r.queryValidity, r.queryIsAFact]);
  await console.log(result);
}

main();