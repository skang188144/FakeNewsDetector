
<br />
<div align="center">
  <a href="https://github.com/skang188144/FakeNewsDetector">
    <img src="public/icon-light.svg" alt="Logo" width="150" height="150">
  </a>

  <h1 align="center">FakeNewsDetector</h1>

  <p align="center">
    An AI fact checker web application designed with React, LangGraph, and Tavily AI.
    <br />
    https://skang188144.github.io/FakeNewsDetector/
  </p>
</div>

[
![GitHub Forks](https://img.shields.io/github/forks/skang188144/FakeNewsDetector.svg?label=Forks)](https://github.com/skang188144/FakeNewsDetector/forks) [![GitHub Stars](https://img.shields.io/github/stars/skang188144/FakeNewsDetector.svg?label=Stars)](https://github.com/skang188144/FakeNewsDetector/stargazers) [![GitHub Contributors](https://img.shields.io/github/contributors/skang188144/FakeNewsDetector.svg?label=Contributors)](https://github.com/skang188144/FakeNewsDetector/graphs/contributors) [![GitHub Issues](https://img.shields.io/github/issues/skang188144/FakeNewsDetector.svg?label=Issues)](https://github.com/skang188144/FakeNewsDetector/issues) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents 
- [Video Summary](#video-summary) 
- [Overview](#overview) 
- [Project Goals](#project-goals) 
- [System Architecture](#system-architecture) 
- [Technical Challenges and Solutions](#technical-challenges-and-solutions) 
- [Conclusion](#conclusion) 
- [Usage](#usage) 
- [License](#license)
- [Contact](#contact)

## Video Summary
[![Video Summary](http://img.youtube.com/vi/jbBTeJi7UOM/0.jpg)](http://www.youtube.com/watch?v=jbBTeJi7UOM "FakeNewsDetector Project Description")

## Overview
FakeNewsDetector is a fact checker web application designed to determine if a given claim is true or false. This application leverages Retrieval-Augmented Generation to supplement existing large language models with sources from the Internet, allowing these models to make better decisions on whether a statement is true or false, based on what the majority of the sources conclude.

## Project Goals
- **Fact Checking**: Determine the truthfulness or falsity of a claim using large language models.
- **Retrieval-Augmented Generation**: Supplement the decision-making process with external sources to mitigate hallucinations common in LLMs. 
- **User-Friendly Interface**: Provide a clean and easy-to-use user interface to interact with the application.

## System Architecture 
This application is designed with a series of specialized agents nodes within a graph to process user queries: 
1. **User Query**: the user inputs their claim. 
2. **Filtering Agents**: the Grammatical, Proposition, Opinion, Public Knowledge, and Opinion filter agents all work to stop invalid or malformed queries.
3.  **Searcher Agent**: the Searcher agent uses the Tavily AI tool to retrieve sources relevant to the query from the Internet.
5. **Fact Checker Agent**: the Fact Checker agent analyzes sources, counts agreements and disagreements, and makes a final determination.

## Technical Challenges and Solutions 
1. **Graph State Management**: Encountered an issue figuring out how to access the graph's state in the middle of a graph's run. Specifically, for the React App component to be updated with the right elements for the loading screen, I needed to store that state using a useState hook, and modify that state at each node of the graph. Although this is most likely bad practice, with the limited time that I had, I decided to apply a quick fix by simply feeding the FakeNewsDetector object with the React setState method, and maintained that method in the internal graph state.
2.  **Accessing External Sources**: Another issue was with the ChatGPT model being reluctant to actually crawl through the provided sources. After some research, it seemed like others have had similar issues with ChatGPT 4 being reluctant to search through URLs that were directly provided to it. I tried a number of different solutions, including many Web Loaders in the LangChain library such as Cheerio or Puppeteer, but it seems to be deprecated or non-functioning. This was a bit of a weird problem, but one that I would definitely try to fix given more time.

## Conclusion 
Despite the challenges and tight deadlines, this project has been a valuable learning experience, allowing me to hone my skills in AI, web development, and project management. Whether or not I get the position at Tavily, I believe this project can stand on its own as a testament to my growth and capability.

## Usage
You can use FakeNewsDetector at https://skang188144.github.io/FakeNewsDetector/

To build the project on your own,
1. Install Node.js
2. Clone the repository: 
   ```bash 
   git clone https://github.com/skang188144/FakeNewsDetector.git
   ```
3. Create your own .env file with the following API keys
   ```bash 
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_TAVILY_API_KEY=your_tavily_api_key
   ```
4. Install dependencies
   ```bash 
   npm install
   ```
5. Run the development server
   ```bash 
   npx vite
   ```

## License
FakeNewsDetector is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Contact
For inquiries or suggestions, contact the developer at skang188144@gmail.com.
