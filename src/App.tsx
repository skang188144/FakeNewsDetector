import './App.css'
import { useEffect, useState } from 'react';
import FakeNewsDetector from './FakeNewsDetector';
import { QueryState } from './utilities/StatusCodes';

const App = () => {
  const [queryState, setQueryState] = useState(QueryState.READY_TO_RECEIVE);
  const [input, setInput] = useState('');

  const fakeNewsDetector = new FakeNewsDetector('gpt-4o', setQueryState);
  const graph = fakeNewsDetector.getGraph();

  useEffect(() => {
    console.log(queryState);
  }, [queryState]);

  const onEnter = (event : React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && queryState === QueryState.READY_TO_RECEIVE) {
      fakeNewsDetector.runQuery(input);
      console.log('ENTER');
    } else if (event.key === 'Enter' && queryState !== QueryState.READY_TO_RECEIVE) {
      // TODO: Add error message
    }
  }

  return (
    <div className='App'>
      <div className='SourcesColumn'>
        <div className='SourcesColumnPageTitle'>
          fake
        </div>

        <div className='SourcesColumnSpacer'/>

        <div className='SourcesColumnHeader'>
          Sources
        </div>
      </div>

      <div className='MainColumn'>
        <div className='MainColumnPageTitle'>
          news detector
        </div>

        <div className='MainColumnByline'>
          by Sanghyeok Kang, powered by Tavily AI
        </div>

        <div className='MainColumnHeader'>
          Query
        </div>

        <input className='MainColumnInput' placeholder='Enter a statement to check.' onChange={ (event) => {setInput(event.target.value)} } onKeyDown={ onEnter }/>
      </div>
    </div>
  );
}

export default App;