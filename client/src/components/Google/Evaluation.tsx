import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { transcriptState, formState } from '@/app/recoil/atoms'
import { generateTextWPnS } from '@/app/scripts/Google/gscript'
import ReactMarkdown from 'react-markdown';
import { addDocument } from '@/scripts/Google/firebase';
import ReadEvals from './ReadEvals';

const Evaluation = () => {
  const [transcript, setTranscript] = useRecoilState(transcriptState)
  const [form, setForm] = useRecoilState(formState)
  const [evaluation, setEvaluation] = useState<string>("");
  const [eScore, setEScore] = useState<string>("");
  const [eSummary, setESummary] = useState<string>("");
  const [textTranscript, setTextTranscript] = useState<string>("");
  const [tCase, setTCase] = useState<string>(form.testCase);
  

  useEffect(() => {
    let sysIns=`You are a professional Quality Insurance tester. 
        You will evaluate the responses of a conversational AI based on the following test case: ${form.testCase ? form.testCase : "N/A"}. 
    After each response, provide feedback on its relevance, accuracy, and helpfulness of the agent.
    Be concise and specific in your evaluation. Return a JSON object with the following format:
    {
        "evaluation_score": "A score from 1 to 10 evaluating the response quality",
        "evaluation_summary": "A brief summary of the overall evaluation"
    }
    Only return the JSON object, without any additional text or explanation.`;
    transcript.isFinished && console.log("Transcript:", transcript)
    if(transcript.isFinished && transcript.msgHx.length > 0){
        const transcriptText = transcript.msgHx.map(entry => {
          const role = entry.role === 'user' ? 'User' : 'Agent';
          const content = entry.parts.map(part => part.text).join(' ');
          return `${role}: ${content}`;
        }).join('\n');
        const fullText = `Here is the conversation transcript:\n${transcriptText}\n\nPlease evaluate the AI's responses based on the test case: ${form.testCase}. Provide feedback on relevance, accuracy, and helpfulness.`
        //console.log("Full Text for Evaluation:", fullText);
        setTextTranscript(transcriptText);
        generateTextWPnS(fullText, sysIns).then((response) => {
            //console.log("Evaluation Response:", response);
            setEvaluation(response);
        });
        setTCase(sysIns);

    }
           
  }, [transcript, form])

  function parseEvaluation(evaluation: string) {
    const regex = /```json\s*([\s\S]*?)\s*```/;
    const match = evaluation.match(regex);

    let jsonString = null;
    let jsonObject = null;

    if (match && match[1]) {
        jsonString = match[1].trim(); 
        try {
            jsonObject = JSON.parse(jsonString);
            console.log("Successfully Parsed JSON:");
            console.log(jsonObject);
            return jsonObject
        } catch (error) {
            console.error("Error parsing extracted JSON:", error);
            return undefined
        }
    } else {
        console.log("No JSON code block found.");
        return undefined
    }
  }
  
  useEffect(() => {
    if(evaluation && evaluation.length > 0){
      try {
        const parsedEval = parseEvaluation(evaluation);
        console.log("Parsed Evaluation:", parsedEval);
        console.log("Storing evaluation data to Firestore");

        const evalData ={
            company: form.projectId,
            eval_ins: tCase,
            eval_score: parsedEval.evaluation_score,
            eval_summary: parsedEval.evaluation_summary,
            transcript: transcript.msgHx,
        }
        parsedEval.evaluation_score && setEScore(parsedEval.evaluation_score);
        parsedEval.evaluation_summary && setESummary(parsedEval.evaluation_summary);
        addDocument("CATesterEvals", evalData);
      } catch (error) {
        console.error("Error parsing evaluation:", error);
      }
        
    }
  }, [evaluation])

  return (
  <div className="max-w-4xl">
      <div className="rounded-2xl border space-y-4 border-teal-700/40 bg-gradient-to-b bg-gray-100 p-6 shadow-lg">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black">Agent Evaluation</h1>
        </header>
        <h2 className="mb-2 block text-md font-medium text-teal-700">
            Evaluation Instructions :
        </h2>
        <span className="text-black"> {tCase} </span>
        <h2 className="mb-2 block text-md font-medium text-teal-700">
            Evaluation Score :
        </h2> 
        <span className="text-black text-sm mt-2"> 
            {/*<ReactMarkdown>{eScore}</ReactMarkdown>*/}
            {eScore}
        </span>
        <span className="text-black"> {tCase} </span>
        <h2 className="mb-2 block text-md font-medium text-teal-700">
            Evaluation Summary :
        </h2> 
        <span className="text-black text-sm mt-2"> 
            <ReactMarkdown>{eSummary}</ReactMarkdown>
        </span>
        <h2 className="mb-4 block text-md font-medium text-teal-700">
            Transcript :
        </h2>
        
        <span className="text-black text-xs"> 
            { transcript.msgHx.map((entry, index) => {
                const role = entry.role === 'user' ? 'User' : 'Agent';
                const content = entry.parts.map(part => part.text).join(' ');
                return ( <p key={index}>
                <span className="font-bold">{role}:</span> {content}
            </p>);
            })}
      </span>
    </div>
 
  </div>
  )
}

export default Evaluation