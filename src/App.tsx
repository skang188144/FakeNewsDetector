import './App.css'
import { SetStateAction, useEffect, useState } from 'react';
import FakeNewsDetector from './FakeNewsDetector';
import { QueryState, QueryTruthfulness } from './utilities/StatusCodes';
import { HashLoader, RingLoader } from 'react-spinners';
import { JSX } from 'react/jsx-runtime';

const App = () => {
  const [queryState, setQueryState] = useState(QueryState.READY_TO_RECEIVE);
  const [queryResults, setQueryResults] = useState({});
  const [input, setInput] = useState('');

  const fakeNewsDetector = new FakeNewsDetector('gpt-4o', setQueryState);

  const onEnter = (event : React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && queryState === QueryState.READY_TO_RECEIVE) {
      setQueryResults(fakeNewsDetector.runQuery(input));
    } 
  }

  const versionDisplay =
    <div className='VersionDisplay'>
      <RingLoader className='RingLoader' color='white' loading={ true }/>
      <div className='AppTitleText'>
        fake news detector
      </div>
      <div className='AppVersionText'>
        v0.0.1
      </div>
    </div>;

  const loadingDisplay =
    <div className='LoadingDisplay'>
      <HashLoader className='HashLoader' color='white' loading={ true }/>
      <div className='LoadingText'>
        Loading. . .
      </div>
      <div className='LoadingStageText'>
        Validating query
      </div>
    </div>;

  const validityErrorDisplay =
    <div className='ValidityErrorDisplay'>
      <div className='ErrorText'>
        Error
      </div>
      <div className='ErrorDetailsText'>
        Your query was invalid. <a href='https://www.github.com/skang188144/FakeNewsDetector'>Find out why.</a>
      </div>
    </div>;

  const getResultsDisplay = (queryResults : any) => {
    const resultsDisplay =
    <div className='ResultsDisplay'>
      <div className='ResultsHeader'>
        <div className='Bar'/>
        <div className='Query'>
          "{ queryResults.query }"
        </div>
      </div>

      <div className='SourcesHeader'>
        <div className='Dot'>
          ■
        </div>
        <div className='Text'>
          FROM OUR SOURCES,
        </div>
      </div>

      <div className='SourcesResult'>
        <div className='Bar' style={ queryResults.querySourcesTruthfulness === QueryTruthfulness.TRUE_QUERY ? {backgroundColor: '#70AE6E'} : {backgroundColor: '#FF6C58'} }/>
        { queryResults.querySourcesTruthfulness === QueryTruthfulness.TRUE_QUERY ? <div className='Result' style={ {color: '#70AE6E'} }>this statement is true</div> : <div className='Result' style={ {color: '#FF6C58'} }>this statement is false</div>}
        <div className='RatioBeginning' style={ queryResults.querySourcesTruthfulness === QueryTruthfulness.TRUE_QUERY ? {color: '#70AE6E'} : {color: '#FF6C58'} }>
          { queryResults.querySourcesTruthfulnessRatio }
        </div>
        <div className='RatioEnding' style={ queryResults.querySourcesTruthfulness === QueryTruthfulness.TRUE_QUERY ? {color: '#70AE6E'} : {color: '#FF6C58'} }>
          sources agree with
          <br/> 
          this statement
        </div>
      </div>

      <div className='SourcesReasoning'>
        { queryResults.querySourcesTruthfulnessReasoning }
      </div>

      <div className='InternalHeader'>
        <div className='Dot'>
          ■
        </div>
        <div className='Text'>
          FROM CHATGPT-4o,
        </div>
      </div>

      <div className='InternalResult'>
        <div className='Bar' style={ queryResults.querySourcesTruthfulness === QueryTruthfulness.TRUE_QUERY ? {backgroundColor: '#70AE6E'} : {backgroundColor: '#FF6C58'} }/>
        { queryResults.queryInternalTruthfulness === QueryTruthfulness.TRUE_QUERY ? <div className='Result' style={ {color: '#70AE6E'} }>this statement is true</div> : <div className='Result' style={ {color: '#FF6C58'} }>this statement is false</div>}
      </div>

      <div className='InternalReasoning'>
        { queryResults.queryInternalTruthfulnessReasoning }
      </div>
    </div>;

    return resultsDisplay;
  }



  const [outputDisplay, setOutputDisplay] = useState(versionDisplay);

  useEffect(() => {
    async function setDisplay(versionDisplay : JSX.Element, loadingDisplay : JSX.Element, setOutputDisplay : { (value : SetStateAction<JSX.Element>) : void; (arg0 : JSX.Element) : void; }) {
      console.log(queryState);

      switch (queryState) {
        case QueryState.READY_TO_RECEIVE:
          setOutputDisplay(versionDisplay);
          break;
        case QueryState.LOADING_VALIDITY_CHECKING:
          setOutputDisplay(loadingDisplay);
          break;
        case QueryState.ERROR_VALIDITY:
          setOutputDisplay(validityErrorDisplay);
          break;
        case QueryState.LOADING_SOURCES_SEARCHING:
          document.body.getElementsByClassName('LoadingStageText')[0].innerHTML = 'Searching for sources';
          break;
        case QueryState.LOADING_FACT_CHECKING:
          document.body.getElementsByClassName('LoadingStageText')[0].innerHTML = 'Fact checking';
          break;
        case QueryState.QUERY_COMPLETE:
          document.body.getElementsByClassName('LoadingStageText')[0].innerHTML = 'Query complete';
          // TODO: set timeout here
          setOutputDisplay(getResultsDisplay(await queryResults));
          break;
      }
    }

    setDisplay(versionDisplay, loadingDisplay, setOutputDisplay);
  }, [queryState]);

  return (
    <div className='App'>
      <div className='LeftColumn'/>
      <div className='RightColumn'/>

      <div className='TitleContainer'>
        <div className='TitleBeginning'>
          fake
        </div>
        <div className='TitleEndingContainer'>
          <div className='TitleEnding'>
            news detector
          </div>
          <div className='Byline'>
            by Sanghyeok Kang, powered by Tavily AI
          </div>
        </div>
      </div>

      <div className='CenterContainer'>
        {queryState === QueryState.READY_TO_RECEIVE && <input className='QueryInput' placeholder='Enter a statement to fact check.' onChange={ (event) => {setInput(event.target.value)} } onKeyDown={ onEnter }/>}
        { outputDisplay }
      </div>
    </div>
  );
}

export default App;