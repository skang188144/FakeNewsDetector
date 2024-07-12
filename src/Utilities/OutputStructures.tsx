import { z } from 'zod';

export const queryValidityOutputStructure = z.object({
  validity: z.string().describe('The string VALID_QUERY or INVALID_QUERY, determined by the criteria provided in the prompt'),
  reasoning: z.string().describe('The reasoning to the conclusion VALID_QUERY or INVALID_QUERY')
});

export const queryTruthfulnessOutputStructure = z.object({
  sourcesTruthfulness: z.string().describe('The string TRUE_QUERY or FALSE_QUERY depending on your determination based solely on the sources'),
  sourcesRatio: z.string().describe('A fraction in the form of x/y representing the number of sources that agreed with the initial query, out of the total number of sources analyzed'),
  sourcesReasoning: z.string().describe('A short paragraph detailing a summary of why the sources that agreed with your determination, did so'),
  internalTruthfulness: z.string().describe('The string TRUE_QUERY or FALSE_QUERY depending on your determination based solely on your knowledge, and excluding any of the sources that you analyzed in the prior part'),
  internalReasoning: z.string().describe('A short paragraph detailing why you came to your determination')

});