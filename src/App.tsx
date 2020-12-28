import React from 'react';
import logo from './logo.svg';
import './App.css';
import CreateBounty from './components/CreateBounty/CreateBounty';

//displays list of bounties as UI element
function BountyList(props: any) {
  const bounties = props.bounties;
  const bountyItems = bounties.map((bounty: string) =>
    <li>{bounty}</li>
  );
  return (
    <ul>{bountyItems}</ul>
  )
}

//list of bounties are stored here
const bounties = [
  "Take a pic of the light show line",
  "Write down \"Bob\" on the waitlist",
  "Find out if CashOnlyEatery takes venmo"
];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome, Bounty Hunter</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <div className="bounty-list">
          <h1>Active bounties, 1mi radius:</h1>
          <BountyList bounties={bounties} />
          <CreateBounty />
        </div>
      </header>
    </div>
  );
}

export default App;
