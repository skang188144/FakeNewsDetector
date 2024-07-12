import 'dotenv/config';
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai';
import { QueryValidity, QueryTruthfulness } from './Utilities/StatusCodes'
import { grammaticalFilterAgent, grammaticalFilterRouter } from './Agents/GrammaticalFilter';
import { propositionFilterAgent, propositionFilterRouter } from './Agents/PropositionFilter';
import { questionFilterAgent, questionFilterRouter } from './Agents/QuestionFilter';
import { opinionFilterAgent, opinionFilterRouter } from './Agents/OpinionFilter';
import { publicKnowledgeFilterAgent, publicKnowledgeFilterRouter } from './Agents/PublicKnowledgeFilter';
import { questionifierAgent } from './Agents/Questionifier';
import { searcherAgent } from './Agents/Searcher';
import { factCheckerAgent } from './Agents/FactChecker';

/**
 * Interface for storing the graph's state
 */
export interface GraphState {
  llm: ChatOpenAI; 
  query: string;
  queryValidity: QueryValidity;
  queryValidityReasoning : string;
  querySearchQuestion : string;
  querySearchResults : any;
  queryTruthfulness: QueryTruthfulness;
  queryTruthfulnessReasoning : string
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
      modelName: 'gpt-4o',
      temperature: 0
    }),
    default: () => new ChatOpenAI({
      modelName: 'gpt-4o',
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
  queryValidityReasoning : null,
  // {
  //   value: (oldQueryValidity : boolean, newQueryValidity : boolean) => newQueryValidity,
  //   default: () => false
  // },
  querySearchQuestion : null,
  querySearchResults: 
  {
    value: (oldQuerySearchResults : any, newQuerySearchResults : any) => newQuerySearchResults,
    default: () => [{}]
  },
  queryTruthfulness: null,
  queryTruthfulnessReasoning : null
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
  .addNode('questionifierAgent', questionifierAgent)
  .addNode('searcherAgent', searcherAgent)
  .addNode('factCheckerAgent', factCheckerAgent)
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
    questionifierAgent: 'questionifierAgent',
    end: END
  })
  .addEdge('questionifierAgent', 'searcherAgent')
  .addEdge('searcherAgent', 'factCheckerAgent')
  .addEdge('factCheckerAgent', END)


  // .addConditionalEdges('publicKnowledgeFilterAgent', publicKnowledgeFilterRouter, {
  //   factCheckerAgent: 'factCheckerAgent',
  //   end: END
  // })
  // .addConditionalEdges('factCheckerAgent', discardIfNotAFact, {
  //   searcherAgent: 'searcherAgent',
  //   end: END
  // })
  // .addEdge('searcherAgent', END)
  .compile();

  return graph;
}

async function main() {
  const result1 = createGraph().invoke({ 
    llm: new ChatOpenAI({
      modelName: 'gpt-4o'
    }),
    // new ChatGoogleGenerativeAI({
    //   modelName: 'gemini-pro',
    //   safetySettings: [{
    //     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    //     threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    //   }],
    //   temperature: 0
    // }),
    query: 'Is pizza made from dough, sauce, and cheese?'
  });

  const result = await result1.then((r) => [r.query, r.queryValidity, r.queryIsAFact]);
  console.log(result);
}

main();