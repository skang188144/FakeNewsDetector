import 'dotenv/config';
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai';
import { QueryValidity, QueryTruthfulness } from './utilities/StatusCodes'
import { grammaticalFilterAgent, grammaticalFilterRouter } from './agents/GrammaticalFilter';
import { propositionFilterAgent, propositionFilterRouter } from './agents/PropositionFilter';
import { questionFilterAgent, questionFilterRouter } from './agents/QuestionFilter';
import { opinionFilterAgent, opinionFilterRouter } from './agents/OpinionFilter';
import { publicKnowledgeFilterAgent, publicKnowledgeFilterRouter } from './agents/PublicKnowledgeFilter';
import { questionifierAgent } from './agents/Questionifier';
import { searcherAgent } from './agents/Searcher';
import { factCheckerAgent } from './agents/FactChecker';

/**
 * Interface for storing the graph's state
 */
export interface GraphState {
  llm : ChatOpenAI; 
  query : string;
  queryValidity : QueryValidity;
  queryValidityReasoning : string;
  querySearchQuestion : string;
  querySearchResults : string;
  querySourcesTruthfulness : QueryTruthfulness;
  querySourcesTruthfulnessRatio : string;
  querySourcesTruthfulnessReasoning : string;
  queryInternalTruthfulness : QueryTruthfulness;
  queryInternalTruthfulnessReasoning : string;
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
  llm: {
    value: () => new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0
    }),
    default: () => new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0
    })
  },
  query: null,
  queryValidity: null,
  queryValidityReasoning : null,
  querySearchQuestion : null,
  querySearchResults: null,
  querySourcesTruthfulness: null,
  querySourcesTruthfulnessRatio: null,
  querySourcesTruthfulnessReasoning : null,
  queryInternalTruthfulness: null,
  queryInternalTruthfulnessReasoning: null
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
  // .addEdge('questionifierAgent', END)
  .addEdge('questionifierAgent', 'searcherAgent')
  // .addEdge('searcherAgent', END)
  .addEdge('searcherAgent', 'factCheckerAgent')
  .addEdge('factCheckerAgent', END)
  .compile();

  return graph;
}

async function main() {
  const result1 = createGraph().invoke({ 
    llm: new ChatOpenAI({
      modelName: 'gpt-4o'
    }),
    query: 'Pizza is made from dough, sauce, and cheese.'
  });

  const result = await result1.then((r) => [r.query, r.queryValidity, r.queryValidityReasoning, /*r.querySearchResults,*/ r.querySourcesTruthfulness, r.querySourcesTruthfulnessRatio, r.querySourcesTruthfulnessReasoning, r.queryInternalTruthfulness, r.queryInternalTruthfulnessReasoning]);
  console.log(result);
}

main();