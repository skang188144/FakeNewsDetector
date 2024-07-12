import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from "@langchain/core/runnables";
import { ChatPromptTemplate } from '@langchain/core/prompts';

export async function questionifierAgent (state : GraphState, config? : RunnableConfig) {
  const llm = state.llm;
  const query = state.query;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', ''],
    ['user', '']
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query
  });


  return state;
}