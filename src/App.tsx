import './App.css'
import { useEffect, useState } from 'react';
import FakeNewsDetector from './FakeNewsDetector';
import { QueryState } from './utilities/StatusCodes';
import { HashLoader, RingLoader } from 'react-spinners';

const App = () => {
  const [queryState, setQueryState] = useState(QueryState.READY_TO_RECEIVE);
  const [input, setInput] = useState('');

  const fakeNewsDetector = new FakeNewsDetector('gpt-4o', setQueryState);

  const onEnter = (event : React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && queryState === QueryState.READY_TO_RECEIVE) {
      fakeNewsDetector.runQuery(input);
      console.log('ENTER');
    } else if (event.key === 'Enter' && queryState !== QueryState.READY_TO_RECEIVE) {
      // TODO: Add error message
    }
  }

  const versionDisplay =
    <>
      <input className='QueryInput' placeholder='Enter a statement to fact check.' onChange={ (event) => {setInput(event.target.value)} } onKeyDown={ onEnter }/>
      <div className='VersionDisplay'>
        <RingLoader className='RingLoader' color='white' loading={ true }/>
        <div className='AppTitleText'>
          fake news detector
        </div>
        <div className='AppVersionText'>
          v0.0.1
        </div>
      </div>
    </>;

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

  const resultsDisplay =
    <div className='ResultsDisplay'>

    </div>;

  const [outputDisplay, setOutputDisplay] = useState(versionDisplay);

  useEffect(() => {
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
        setOutputDisplay(resultsDisplay);
        break;
    }
  }, [queryState]);

  return (
    <div className='App'>
      <div className='SourcesColumn'>
        {/* <div className='SourcesColumnPageTitle'>
          fake
        </div>

        <div className='SourcesColumnSpacer'/>

        <div className='SourcesColumnHeader'>
          Sources
        </div> */}
      </div>

      <div className='MainColumn'>
        {/* <div className='MainColumnPageTitle'>
          news detector
        </div>

        <div className='MainColumnByline'>
          by Sanghyeok Kang, powered by Tavily AI
        </div>

        <div className='MainColumnHeader'>
          Query
        </div>

        <input className='MainColumnInput' placeholder='Enter a statement to check.' onChange={ (event) => {setInput(event.target.value)} } onKeyDown={ onEnter }/>

        <div className='MainColumnOutputContainer'>
          { mainColumnOutputComponent }
        </div> */}
      </div>

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
        { outputDisplay }
      </div>
    </div>
  );
}

export default App;