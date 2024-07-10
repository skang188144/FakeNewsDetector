import { GraphState } from '../GraphInitializer.tsx'
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// import.meta.env.OPENAI_API_KEY

export default async function filterAgent (state : GraphState, config? : RunnableConfig) {
  const llm = state.llm;
  const query = state.query;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a filter for a misinformation detector application. Your sole job is to ' 
                + 'determine if a query you receive is one that is meaningless.\n'],
    ['user', 'Your role is being a filter for a misinformation detector application. Your task is to '
              + 'take a certain question or statement as input, and determine if that query is a '
              + 'valid query.\n' 

              + 'A query is invalid if it is has no determinable meaning in English. All other queries '
              + 'are considered to be valid, if you can parse it to determine what it means.\n'

              + "For example, the query 'asdjhaksdjashkjd' is invalid as it has no meaning. However, a "
              + "query such as 'Are pizzas made with glue?' is valid, even though it may seem like an "
              + 'obvious or nonsensical question, because you can fundamentally understand the question '
              + 'or statement that is underlying.\n'

              + 'Here is the query:\n'
              + '{query}\n'

              + 'Please return nothing but a single string of the word VALID in all uppercase if the '
              + 'query is valid, and INVALID if the query is invalid.']
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({
    query: query
  });

  if (response.content === 'VALID') {
    state.queryValidity = true;
  } else if (response.content === 'INVALID') {
    state.queryValidity = false;
  }

  return state;
}