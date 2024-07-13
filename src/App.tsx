import './App.css'

function App() {

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

        <input className='MainColumnInput' placeholder='Enter a statement to fact check.'/>
      </div>
    </div>
  )
}

export default App