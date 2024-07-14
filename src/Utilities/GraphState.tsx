import { ChatOpenAI } from '@langchain/openai';
import { QueryValidity, QueryTruthfulness, QueryState } from './StatusCodes'
import FakeNewsDetector from '../FakeNewsDetector';

export default interface GraphState {
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
    changeQueryState : (queryState : QueryState) => {};
};