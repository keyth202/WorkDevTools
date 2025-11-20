import React from 'react'
import TTSForm, { TtsJob } from '@/components/TextToSpeech/TTSForm'

const TTSPage = () => {
  const handleSubmit = async (job: TtsJob) => {
    // send to your backend
    console.log("Submitting TTS job:", job);
    const res = await fetch("/api/tts/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error("Failed to submit TTS batch");
  };

  return <TTSForm onSubmit={handleSubmit} endpoint={undefined} />;
}

export default TTSPage