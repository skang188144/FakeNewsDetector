import GraphState from '../utilities/GraphState.tsx';
import { RunnableConfig } from "@langchain/core/runnables";
import { ChatPromptTemplate } from '@langchain/core/prompts';

export async function questionifierAgent (state : GraphState, config? : RunnableConfig) {
  const { llm, query } = state;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an AI agent for a certain web application. Your job is to receive a query, '
             + 'and turn that query into a question. Queries are guaranteed to be a statement that can '
             + 'be either true or false. You are to extract the core statement from the query, and '
             + 'turn it into a question about the truthfulness or falsity of that statement.\n'

    ],
    ['user', 'Here is the query:\n'
           + '{query}\n'

           + 'Please return nothing but the question that has been converted from the query.'
    ]
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query
  });

  console.log(response.content);

  state.querySearchQuestion = response.content.toString();

  return state;
}