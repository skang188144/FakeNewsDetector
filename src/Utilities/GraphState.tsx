import { ChatOpenAI } from '@langchain/openai';
import { QueryValidity, QueryTruthfulness } from './StatusCodes'

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
};