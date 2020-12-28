import profile from './profile.jpg';
import { queries } from './exampleQueries.js'
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { animateScroll } from "react-scroll";
import axios from 'axios';

function App() {

  const [query, setQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([
    "Hey! I'm Torbot. Ask me a question about Torben and I'll do my best to answer you."
  ]);

  function checkEnter(key) {
    if(key === 'Enter')
      submitQuery(query)
  }

  function scrollToBottom() {
    animateScroll.scrollToBottom({
      containerId: "chat-history",
      delay: 0,
      duration: 1000
    });
  }

  function submitQuery(queryStr) {
    setQueryHistory(prevItems => [...prevItems, queryStr]);
    scrollToBottom()

    const payload = {
      text: queryStr
    }

    axios.post('/query', payload).then(response => {
      setQueryHistory(prevItems => [...prevItems, response.data.result_text]);
      scrollToBottom()
    }).catch(() => {
      console.log('error')
    })

    setQuery('')
  }

  return (
    <div className="root-container">

      <div className="left-container">
        <img src={profile} className="profile-img" alt="profile" />
        <div className="profile-info">
          <a className="profile-link" href="https://www.linkedin.com/in/torben-albert-lindqvist/">LinkedIn</a>
          <a className="profile-link" href="https://scholar.google.com/citations?user=-_dCl4gAAAAJ&hl=en">Google Scholar</a>
          <a className="profile-link" href="/resume">Resume</a>
        </div>
      </div>

      <div className="right-container">
        <div className="chat-history" id="chat-history">
          {queryHistory.map((chat, index) =>
              <div className={`chat-bubble ${(index + 1) % 2 === 0 ? "chat-bubble-right" : "chat-bubble-left"}`} key={index}>
                {chat}
              </div>
          )}
        </div>

        <div className="chat-form">
          <div className="chat-suggestions">
            {queries.map((query, index) =>
                <div className="chat-suggestion button" key={index} onClick={() => submitQuery(query)}>
                  {query}
                </div>
            )}
          </div>

          <div className="chat-input-container">
            <input className="chat-input" type="text" value={query} onChange={event => setQuery(event.target.value)} onKeyPress={event => checkEnter(event.key)} />
            <div className="chat-submit button" onClick={() => submitQuery(query)}>
              <FontAwesomeIcon icon={faQuestion} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
