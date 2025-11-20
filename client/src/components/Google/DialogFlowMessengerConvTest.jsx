import React, { useEffect,useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateTextWHxMood, generateTextWOhx } from '@/scripts/Google/gscript';
const randomNum = Math.floor(Math.random() * 4) + 1;
const DialogflowMessengerConvTest = () => {
  const navigate = useNavigate();

  const [msgHx, setMsgHx] = useState([]);
  const [msgCount, setMsgCount] = useState(0);

  
  
  const randomMood = randomNum == 1 ? "friendly" : randomNum == 2 ? "frustrated" : "curious";
  const msgCountRef = useRef(0);
  useEffect(() => { msgCountRef.current = msgCount; }, [msgCount]);
  
  useEffect(() => {
    // Load script
    const script = document.createElement('script');
    script.src = "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { 
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const dfMessenger = document.querySelector('df-messenger');
    
    const handleRequestSent = (event) => {
      console.log('Request Sent:', event.detail.requestBody); 

    };
    const handleResponseReceived = (event) => {
      const responseData = event.detail?.messages[0]?.text;
      
      if (responseData == null) return;
      if (msgCountRef.current >= 20 + 2 * randomNum) return;
      setTimeout(() => {
        appendToHistory({ role: 'model', parts: [{ text: responseData }] }, async (nextHistory) => {

          const response = await generateTextWHxMood(responseData, nextHistory, randomMood, randomNum);
          //const response = await generateTextWOhx(responseData, randomMood);
          sendProgrammaticMessage(response, nextHistory);
        });
      }, 500);
    };

    dfMessenger.addEventListener('df-response-received', handleResponseReceived);
    dfMessenger.addEventListener('df-request-sent', handleRequestSent);

    return () => {
      dfMessenger.removeEventListener('df-request-sent', handleRequestSent);
      dfMessenger.removeEventListener('df-response-received', handleResponseReceived);
    };
  }, [randomMood, randomNum]);

  function appendToHistory(entry, afterAppend) {
    setMsgHx(prev => {
      const next = [...prev, entry];
      setMsgCount(c => c + 1);
      if (afterAppend) afterAppend(next);
      return next;
    });
}
function sendProgrammaticMessage(queryText, baseHistory) {
    const dfMessenger = document.querySelector('df-messenger');
    if (!dfMessenger) return;

    const entry = { role: 'user', parts: [{ text: queryText }] };
    if (baseHistory) {

      const next = [...baseHistory, entry];
      setMsgHx(next);           
      setMsgCount((c) => c + 1); 
    } else {
      appendToHistory(entry);
    }

    try {
      dfMessenger.renderCustomText(queryText, false);
      dfMessenger.sendQuery(queryText);
      console.log('Sending programmatic message to Dialogflow:', queryText);
    } catch (e) {
      console.error('Error sending programmatic message:', e);
    }
  }

 
  return (
    <div>
      <df-messenger
        location="us-central1"
        project-id="parasolmega"
         agent-id="9f11b0a2-f78f-49d4-b845-ee541c9a9687"
        language-code="en"
        max-query-length="-1"
        storage-option="sessionStorage">
        <df-messenger-chat-bubble
          chat-title="KC-Demo">
        </df-messenger-chat-bubble>
      </df-messenger>
      <style>
        {`
          df-messenger {
            z-index: 999;
            position: fixed;
            --df-messenger-font-color: #000;
            --df-messenger-font-family: Google Sans;
            --df-messenger-chat-background: #f3f6fc;
            --df-messenger-message-user-background: #d3e3fd;
            --df-messenger-message-bot-background: #fff;
            bottom: 16px;
            right: 16px;
          }
        `}
      </style>
    </div>
  );
};

export default DialogflowMessengerConvTest;

