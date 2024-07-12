import 'dotenv/config';
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import { searcherAgent } from './Agents/Searcher';
import { ChatOpenAI } from '@langchain/openai';
import { grammaticalFilterAgent, grammaticalFilterRouter } from './Agents/GrammaticalFilter';
import { factCheckerAgent, discardIfNotAFact } from './Agents/FactChecker';
import { propositionFilterAgent, propositionFilterRouter } from './Agents/PropositionFilter';
import { questionFilterAgent, questionFilterRouter } from './Agents/QuestionFilter';
import { opinionFilterAgent, opinionFilterRouter } from './Agents/OpinionFilter';
import { publicKnowledgeFilterAgent, publicKnowledgeFilterRouter } from './Agents/PublicKnowledgeFilter';

/**
 * Interface for storing the graph's state
 */
export interface GraphState {
  llm: ChatOpenAI; 
  //ChatGoogleGenerativeAI;
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
    value: () => new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0
    }),
    default: () => new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0
    })
    // value: () =>  new ChatGoogleGenerativeAI({
    //   modelName: 'gemini-pro',
    //   safetySettings: [{
    //     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    //     threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    //   }],
    //   temperature: 0
    // }),
    // default: () => new ChatGoogleGenerativeAI({
    //   modelName: 'gemini-pro',
    //   safetySettings: [{
    //     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    //     threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    //   }],
    //   temperature: 0
    // })
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
  .addNode('grammaticalFilterAgent', grammaticalFilterAgent)
  .addNode('propositionFilterAgent', propositionFilterAgent)
  .addNode('questionFilterAgent', questionFilterAgent)
  .addNode('opinionFilterAgent', opinionFilterAgent)
  .addNode('publicKnowledgeFilterAgent', publicKnowledgeFilterAgent)
  .addNode('factCheckerAgent', factCheckerAgent)
  .addNode('searcherAgent', searcherAgent)
  .addEdge(START, 'grammaticalFilterAgent')
  .addConditionalEdges('grammaticalFilterAgent', grammaticalFilterRouter, {
    propositionFilterAgent: 'propositionFilterAgent',
    end: END
  })
  .addConditionalEdges('propositionFilterAgent', propositionFilterRouter, {
    questionFilterAgent: 'questionFilterAgent',
    end: END
  })
  .addConditionalEdges('questionFilterAgent', questionFilterRouter, {
    opinionFilterAgent: 'opinionFilterAgent',
    end: END
  })
  .addConditionalEdges('opinionFilterAgent', opinionFilterRouter, {
    publicKnowledgeFilterAgent: 'publicKnowledgeFilterAgent',
    end: END
  })
  .addConditionalEdges('publicKnowledgeFilterAgent', publicKnowledgeFilterRouter, {
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
    llm: new ChatOpenAI({
      modelName: 'gpt-3.5-turbo'
    }),
    // new ChatGoogleGenerativeAI({
    //   modelName: 'gemini-pro',
    //   safetySettings: [{
    //     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    //     threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    //   }],
    //   temperature: 0
    // }),
    query: 'Pizza is good.'
  });

  const result = await result1.then((r) => [r.query, r.queryValidity, r.queryIsAFact]);
  await console.log(result);
}

main();