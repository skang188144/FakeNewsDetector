import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai';
import GraphState from './utilities/GraphState';
import { grammaticalFilterAgent, grammaticalFilterRouter } from './agents/GrammaticalFilter';
import { propositionFilterAgent, propositionFilterRouter } from './agents/PropositionFilter';
import { questionFilterAgent, questionFilterRouter } from './agents/QuestionFilter';
import { opinionFilterAgent, opinionFilterRouter } from './agents/OpinionFilter';
import { publicKnowledgeFilterAgent, publicKnowledgeFilterRouter } from './agents/PublicKnowledgeFilter';
import { questionifierAgent } from './agents/Questionifier';
import { searcherAgent } from './agents/Searcher';
import { factCheckerAgent } from './agents/FactChecker';
import { QueryState } from './utilities/StatusCodes';
import { Dispatch, SetStateAction } from 'react';

export default class FakeNewsDetector {
  /*
   * Private Fields
   */
  private chatGPTModelName;
  private graph;

  /*
   * Public Fields
   */
  public static setComponentQueryState: Dispatch<SetStateAction<QueryState>>;

  /*
   * Constructor
   */
  public constructor(chatGPTModelName : string, setQueryState: Dispatch<SetStateAction<QueryState>>) {
    this.chatGPTModelName = chatGPTModelName;
    this.graph = this.createGraph();
    FakeNewsDetector.setComponentQueryState = setQueryState;
  }
  
  /*
   * A reducer will:
   * - keep track of the current state
   * - take in new information that causes state modification
   * - process the dispatched information and calculate a new state
   * - return this new state so the application can use it
   */

  /*
   * Initialize the graph state
   */
  private graphState : StateGraphArgs<GraphState>['channels'] = {
    llm: {
      value: () => new ChatOpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        modelName: 'gpt-4o',
        temperature: 0
      }),
      default: () => new ChatOpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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
    queryInternalTruthfulnessReasoning: null,
    setQueryState: null
  };

  /*
   * Create the graph
   */
  private createGraph() {
    const graph = new StateGraph<GraphState>({
      channels: this.graphState
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
    .compile();

    return graph;
  }

  /*
   * Set the graph query status, for the App React component to have updates on what stage in the query run the graph is in.
   */
  public setQueryState(queryState : QueryState) {
    FakeNewsDetector.setComponentQueryState(queryState);
  }

  /*
   * Run the query through the graph
   */
  public runQuery(query: string) {
    try {
      return this.graph.invoke({
        llm: new ChatOpenAI({
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          modelName: this.chatGPTModelName,
          temperature: 0
        }), 
        query: query,
        setQueryState: this.setQueryState
      });
    } catch (exception) {
      console.log(exception);
      this.setQueryState(QueryState.ERROR_OTHER);
      return {};
    }
  }
}