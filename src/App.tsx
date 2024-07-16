import './App.css'
import { SetStateAction, useEffect, useState } from 'react';
import FakeNewsDetector from './FakeNewsDetector';
import { QueryState, QueryTruthfulness } from './utilities/StatusCodes';
import { HashLoader, RingLoader } from 'react-spinners';
import { JSX } from 'react/jsx-runtime';

const App = () => {
  /*
   * State
   */
  const [input, setInput] = useState('');
  const [outputDisplay, setOutputDisplay] = useState([<></>]);
  const [queryState, setQueryState] = useState(QueryState.READY_TO_RECEIVE);
  const [queryResults, setQueryResults] = useState({});
  const [sourcesList, setSourcesList] = useState(<></>);
  const [isSourcesListVisible, setSourcesListVisbility] = useState(false);

  const fakeNewsDetector = new FakeNewsDetector('gpt-4o', setQueryState);

  /*
   * OutputDisplay Children
   */
  const versionDisplay =
    <div className='VersionDisplay'>
      <RingLoader className='RingLoader' color='white' loading={ true } size={'5vw'}/>

      <div className='Status'>
        Waiting for Query
      </div>

      <div className='AppTitleVersion'>
        fake news detector
        <br/>
        v0.0.1
      </div>
    </div>;

  const loadingDisplay =
    <div className='LoadingDisplay'>
      <HashLoader className='HashLoader' color='white' loading={ true }/>

      <div className='LoadingText'>
        Loading. . .
      </div>

      <div className='LoadingStatus'>
        Validating query
      </div>
    </div>;

  const validityErrorDisplay =
    <div className='ValidityErrorDisplay'>
      <div className='Error'>
        Error
      </div>

      <div className='ErrorDetails'>
        Your query was invalid. <a href='https://www.github.com/skang188144/FakeNewsDetector'>Find out why.</a>
      </div>
    </div>;

  /*
   * OutputDisplay Async Children Functions
   */
  const getResultsHeaderDisplay = (queryResults : any) => {
    return <div className='ResultsHeaderDisplay'>
      <div className='Bar'/>

      <div className='Query'>
        "{ queryResults.query }"
      </div>
    </div>;
  }

  const getSourcesResultsDisplay = (queryResults : any) => {
    return <div className='SourcesResultsDisplay'>
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
    </div>;
  }

  const getSourcesList = (queryResults : any) => {
    const sources = queryResults.querySearchResults.map((source : any) => {
      return <div className='Source'>
        <a href={ source.url }>
          • { source.title }
        </a>
      </div>
    });
      
    return <div className='SourcesList'>
      { ...sources }
    </div>;
  }

  const getInternalResultsDisplay = (queryResults : any) => {
    return <div className='InternalResultsDisplay'>
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
  }
  
  /*
   * Event Listeners
   */
  const onEnter = (event : React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && queryState === QueryState.READY_TO_RECEIVE) {
      setQueryResults(fakeNewsDetector.runQuery(input));
    } 
  }

  /*
   * useEffect Hooks
   */
  useEffect(() => {
    setOutputDisplay([versionDisplay]);
  }, []);

  useEffect(() => {
    async function setDisplay(versionDisplay : JSX.Element, loadingDisplay : JSX.Element, setOutputDisplay: { (value: SetStateAction<JSX.Element[]>): void; (arg0: JSX.Element[]): void; }) {
      switch (queryState) {
        case QueryState.READY_TO_RECEIVE:
          setOutputDisplay([versionDisplay]);
          break;
        case QueryState.LOADING_VALIDITY_CHECKING:
          setOutputDisplay([loadingDisplay]);
          break;
        case QueryState.ERROR_VALIDITY:
          setOutputDisplay([validityErrorDisplay]);
          break;
        case QueryState.LOADING_SOURCES_SEARCHING:
          document.body.getElementsByClassName('LoadingStatus')[0].innerHTML = 'Searching for sources';
          break;
        case QueryState.LOADING_FACT_CHECKING:
          document.body.getElementsByClassName('LoadingStatus')[0].innerHTML = 'Fact checking';
          break;
        case QueryState.QUERY_COMPLETE:
          document.body.getElementsByClassName('LoadingStatus')[0].innerHTML = 'Query complete';
          // TODO: set timeout here
          setOutputDisplay([getResultsHeaderDisplay(await queryResults), getSourcesResultsDisplay(await queryResults), getInternalResultsDisplay(await queryResults)]);
          break;
      }
    }

    setDisplay(versionDisplay, loadingDisplay, setOutputDisplay);
  }, [queryState]);

  useEffect(() => {
    async function setSources() {
      if (isSourcesListVisible && queryState === QueryState.QUERY_COMPLETE) {
        document.body.getElementsByClassName('ToggleTriangle')[0].innerHTML = '▾';
        setSourcesList(getSourcesList(await queryResults));
      } else {
        document.body.getElementsByClassName('ToggleTriangle')[0].innerHTML = '▸';
        setSourcesList(<></>);
      }
    }
    setSources();
  }, [isSourcesListVisible]);

  /*
   * Return Overarching App Element
   */
  return (
    <div className='App'>
      <div className='BackgroundLeft'/>
      <div className='BackgroundRight'/>

      <div className='TitleContainer'>
        <div className='TitleStart'>
          fake
        </div>

        <div className='TitleEndContainer'>
          <div className='TitleEnd'>
            news detector
          </div>

          <div className='Byline'>
            by Sanghyeok Kang, powered by Tavily AI
          </div>
        </div>
      </div>

      <div className='OutputDisplayContainer'>
        {queryState === QueryState.READY_TO_RECEIVE && <input className='QueryInput' placeholder='Enter a statement to fact check.' onChange={ (event) => {setInput(event.target.value)} } onKeyDown={ onEnter }/>}

        <div className='OutputDisplay'>
          { outputDisplay[0] }

          { outputDisplay.length >= 2 && outputDisplay[1] }

          { queryState === QueryState.QUERY_COMPLETE && <div className='SourcesListDisplay'>
            <div className='HeaderContainer' onClick={ () => {setSourcesListVisbility(!isSourcesListVisible)} }>
              <div className='ToggleTriangle'>▸</div>

              <div className='Header'>View Our Sources</div>
            </div>

            { sourcesList }
          </div>}

          {outputDisplay.length >= 3 && outputDisplay[2]}
        </div>
      </div>
    </div>
  );
}

export default App;