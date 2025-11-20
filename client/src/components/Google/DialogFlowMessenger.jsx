import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DialogflowMessenger = () => {
  const navigate = useNavigate();
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

  return (
    <div>
      <df-messenger
        location="us-central1"
        project-id="parasolmega"
         agent-id="9f11b0a2-f78f-49d4-b845-ee541c9a9687"
        language-code="en"
        max-query-length="-1"
        storage-option="localStorage">
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

export default DialogflowMessenger;

/*
<link rel="stylesheet" href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css">
<script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"></script>
<df-messenger
  location="us-central1"
  project-id="parasolmega"
  agent-id="9f11b0a2-f78f-49d4-b845-ee541c9a9687"
  language-code="en"
  max-query-length="-1">
  <df-messenger-chat-bubble
    chat-title="KC-Demo">
  </df-messenger-chat-bubble>
</df-messenger>
<style>
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
</style>
*/