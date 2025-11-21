import React,{useEffect, useState} from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import DownloadButton from './DownloadButton';
import {
  startDateState,
  endDateState,
  progressState,
  isProcessingState,
  queueState,
} from '@/app/recoil/recoilState';
import { searchConversations, getConvJobStatus, getJobResults, parseConversations,getTranscriptsURL, getNumberConversations } from '@/app/scripts/Genesys/genesysRecServices'; 
import { usePostTranscriptsMutation } from '@/app/redux/apiSlice';


const ResultsProcessor = () => {
    const [time, setTime] = useState('00:00:00');
    const [progress, setProgress] = useRecoilState(progressState);
    const [isProcessing, setIsProcessing] = useRecoilState(isProcessingState);
    const [startProcessing, setStartProcessing] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobResults, setJobResults] = useState<any[]>([]);
    const [jobState, setJobState] = useState<string | null>('idle');
    const [jobCursor, setJobCursor] = useState<string | null>(null);
    const [timeLimit, setTimeLimit] = useState<number | null>(0);
    const [processedConvos, setProcessedConvos] = useState<number>(0);
    const [foundURLS, setFoundURLS] = useState<number | null>(0);
    const [totalConvos, setTotalConvos] = useState<number>(0);
    const queueSt=useRecoilValue(queueState);
    const startDate= useRecoilValue(startDateState);
    const endDate= useRecoilValue(endDateState);
    const [msgLog, setMsgLog] = useState<string[]>(["Waiting for process to start..."]);
    const [postTranscripts, { data:transcriptData, isError:transcriptIsError, error:transcriptError }] = usePostTranscriptsMutation();

    const SIZE_LIMIT_BYTES = 2 * 1024 * 1024;
    //const SIZE_LIMIT_BYTES = 100 * 1024;

    function addLogEntry(message:string) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });

        setMsgLog((prev) => [...prev, `[${timeString}] ${message}`]);
    
    }
    useEffect(() =>{
        if (transcriptData) {
            console.log("Transcript data sent:", transcriptData);
            addLogEntry(`Received Message: ${transcriptData.message}`);
            //setJobState('completed');
            // Optionally, you can process the transcriptData further here
        }else if (transcriptIsError) {
            console.error("Error sending transcript data:", transcriptError);
            addLogEntry(`Error sending transcript data: ${transcriptError.message}`);
            //setJobState('failed');
        }

    },[transcriptData]);

    useEffect(() => {
        async function findConversations() {
            await getNumberConversations(startDate, endDate, queueSt.selectedQueues)
                .then((count) => {
                    console.log("getNumberConversations success! count:", count);
                });
            await searchConversations(startDate, endDate, queueSt.selectedQueues)
                .then((data) => {
                    console.log("searchConversations success! data:", data);
                    if (data && data.jobId) {
                        addLogEntry(`Created job: ${data?.jobId} `);
                        // Process the conversations as needed
                        setJobId(data?.jobId);
                        setJobState("inProgress");
                        setStartProcessing(true);
                    } else {
                        addLogEntry("No conversations found for the selected criteria.");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching conversations:", error);
                    addLogEntry("Error fetching conversations: " + error.message);
                    setJobState('failed');
                });
        }
        if(startDate && endDate && isProcessing) {       
            if (queueSt.selectedQueues.length > 0) {
                addLogEntry("Processing started...");
                setProgress(0);
                setTime('00:00:00');
                setJobResults([]);
                setProcessedConvos(0);
                setFoundURLS(0);
                setTotalConvos(0);
                setTimeLimit(0);
                setIsProcessing(false);
                addLogEntry(`Processing data from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
                addLogEntry(`Processing queues: ${queueSt.selectedQueues.join(', ')}`);
                findConversations();
                
            }
            
            
        }
        
     }, [isProcessing]);
     async function getURL (convBody:any,conversationId:string, sessionId:string) {
        try {
            setProcessedConvos((prev) => (prev !== null ? prev + 1 : 1));
            const transcriptUrl = await getTranscriptsURL(conversationId, sessionId).then((data) => {
                if (data !== null && data?.url) {
                    return data.url;
                }
                return null;
            });
            if (transcriptUrl !== null && transcriptUrl !== undefined) {
                postTranscripts([{ ...convBody, transcriptUrl }]);
                setJobResults((prevResults) => {
                    const updatedResults = prevResults.map((result) => {
                        if (result.conversationId === conversationId) {
                            return { ...result, transcriptUrl };
                        }
                        return result;
                    });
                    return updatedResults;
                });
            }
            
            //setJobState('check');
        } catch (error) {
            console.warn(`Error fetching transcript URL for Conversation ID ${conversationId}:`, error);
            //addLogEntry(`Error fetching transcript URL for Conversation ID ${conversationId}: ${error.message}`);
        }
    }
    function splitArrayBySize(array, sizeLimitBytes) {
        const chunks = [];
        let currentChunk = [];
        let currentSize = 0;
        const checkArray = JSON.stringify(array);
        const checkSize = new Blob([checkArray]).size;
        console.log(`Total size of array: ${checkSize} bytes vs size limit: ${sizeLimitBytes} bytes`);

        for (const item of array) {
            const itemString = JSON.stringify(item);
            const itemSize = new Blob([itemString]).size;
            
            // Check if adding this item would exceed the size limit
            if (currentSize + itemSize > sizeLimitBytes) {
                // Push current chunk and reset
                console.log(`Chunk size: ${currentSize} bytes`);
                chunks.push(currentChunk);
                currentChunk = [];
                currentSize = 0;
            }else{
                currentChunk.push(item);
                currentSize += itemSize;  
            }
           
        }

        // Push any remaining items
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }
     useEffect(() => {
       if (jobResults.length > 0 && jobState === 'gatherURLs') {
           addLogEntry(`Fetched ${jobResults.length} results for job ${jobId}.`);
           jobResults.forEach((result, index) => {
                if (result.conversationId && result.firstSessionId) {
                    //getURL(result.conversationId, result.firstSessionId);
                    const slowResults = setTimeout(() => {
                        getURL(result,result.conversationId, result.firstSessionId);
                        
                    }, index*300);                   
                    return () => clearTimeout(slowResults);
                }
           });
           setJobState('checking');
       }else if(jobState ==='writing' && jobResults.length > 0){
            const convos = jobResults.filter((result) => result.transcriptUrl !== undefined && result.transcriptUrl !== null);
            addLogEntry(`Found urls ${foundURLS}`)
            addLogEntry(`Found ${convos.length} conversations with transcripts for job ${jobId}.`);
            //postTranscripts(convos);
            
            const chunkedArrays = splitArrayBySize(convos, SIZE_LIMIT_BYTES);
            for (const chunk of chunkedArrays){
               addLogEntry(`Chunk of ${chunk.length} conversations sent for processing.`);
               //postTranscripts(chunk);
               
            }
            setJobState('completed');

       }else if(jobState == 'checking'){
            if(processedConvos !== null && totalConvos !== null && processedConvos === totalConvos){
                addLogEntry(`All URLs have been gathered for job ${jobId}.`);
                
                jobResults.forEach((result) => {
                    if (result.transcriptUrl) {
                        
                        setFoundURLS((prev) => (prev !== null ? prev + 1 : 1));
                    }
                });
                setJobState('writing');
            }
            
        }
     }, [jobResults, jobState]);
     
     async function fetchJobResultsWithCursor(jobId:string,cursor, prevCursor) {
        try {
            const results = await getJobResults(jobId, cursor);
            prevCursor = cursor;
            if (results && results?.cursor !== null && results?.cursor !== cursor && results?.cursor !== undefined && prevCursor !== results?.cursor) {
                const parsedResults = await parseConversations(results);
                setJobResults((prevResults) => [...prevResults, ...parsedResults]);
                addLogEntry(`Next cursor set to: ${results?.cursor} vs previous cursor: ${cursor}`);
                setTotalConvos((prev) => (prev + parsedResults.length || 0));
                setJobCursor(results?.cursor);
                await new Promise((resolve) => setTimeout(resolve,500));
                fetchJobResultsWithCursor(jobId, results?.cursor, prevCursor);
                

            }else if (results && results.conversations && results.conversations.length > 0 && !cursor) {
                const parsedResults = await parseConversations(results);
                setJobResults((prevResults) => [...prevResults, ...parsedResults]);
                addLogEntry(`Fetched ${parsedResults.length} results for job ${jobId}.`);
                setJobState('gatherURLs');
                setTotalConvos((prev) => (prev + parsedResults.length || 0));
                return false; // Stop recursion if no cursor is present
            }else{

                addLogEntry(`No more results found for job ${jobId}.`);
                setJobState('gatherURLs')
                return false;
            }
        } catch (error) {
            console.error("Error fetching job results:", error);
            addLogEntry("Error fetching job results: " + error.message);
        }
       
     }

    useEffect(() => {
       
        console.log("useEffect for startProcessing and jobState triggered", startProcessing, jobState);
        async function fetchJobStatus() {
            addLogEntry(`Checking job status...`);
             getConvJobStatus(jobId).then((data) => {
                if (data && data.state === 'FULFILLED') {
                    addLogEntry(`Job ${jobId} is processing.`);
                    //fetchJobResults();
                    setJobState('processing');
                    setIsProcessing(false);
                    setStartProcessing(false);
                } else if (data && (data.state === 'FAILED' || data.state === 'CANCELLED' || data.state === 'REJECTED')) {
                    addLogEntry(`Job ${data.jobId} failed with state: ${data.state}`);
                    setJobState('failed');
                    setIsProcessing(false);
                    setStartProcessing(false);
                } else if (timeLimit !== 3 && data.state ==='PENDING') {
                    addLogEntry(`Job ${data.jobId} is still in progress with state: ${data.state}`);
                    //setJobState(data.state);
                    const rerunTimeout = setTimeout(() => {
                        addLogEntry(`Rerunning job status check for job ${timeLimit+1}`);
                        setTimeLimit((prev) => (prev !== null ? prev + 1 : 1));
                        fetchJobStatus();
                    }, 2000);
                    return () => clearTimeout(rerunTimeout);
                }else {
                     addLogEntry(`Job failed to run`);
                     setIsProcessing(false);
                     setStartProcessing(false);
                     setJobState('failed');
                     console.error(`Job ${data.jobId} failed with state: ${data.state}`);
                }
               
            }).catch((error) => {
                console.error("Error fetching job status:", error);
                addLogEntry("Error fetching job status: " + error.message);
            });
        }
        if (startProcessing && jobState === 'inProgress') {
             fetchJobStatus();
         
        }
        if (jobState == "processing" || jobState ==="rerun"){
            addLogEntry(`Job ${jobId} is still processing with state: ${jobState}`);
            fetchJobResultsWithCursor(jobId, null);

        }

    }, [startProcessing, jobState]);

  return (
    <div>
         {/*<!-- Progress Panel -->*/} {jobState=="completed" && (<DownloadButton jsonData={jobResults} />)}
    <div id="progress-panel" className={`bg-white border-t border-gray-200  ${'shadow-lg'/*transform translate-y-full fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out*/}`}>
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-800 flex items-center">
                    <i className="fas fa-tasks mr-2"></i>
                    Processing Status
                </h3>
                <button id="close-progress" className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <div className="py-4">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <span id="progress-text" className="font-medium">{jobState !== null ? jobState : 'Ready to process'}</span>
                        <span id="progress-percent" className="text-sm text-gray-500 ml-2">Conversations Processed {processedConvos} / {totalConvos}</span>
                    </div>
                    <div id="progress-time" className="text-sm text-gray-500"> ({processedConvos !== null && totalConvos !== 0 && totalConvos !== null? Math.floor((processedConvos / totalConvos) * 100) : 0}%)</div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div id="progress-bar" className={`bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out w-[${processedConvos !== null && totalConvos !== 0 && totalConvos !== null? Math.floor((processedConvos / totalConvos) * 100) : 0}%]`} ></div>
                </div>
                
                <div id="progress-log" className="progress-log h-54 overflow-y-auto bg-gray-50 p-3 rounded-lg text-sm font-mono text-gray-700 max-w-screen-md max-h-56">
                    {msgLog.map((msg, index) => (
                        <div key={index} className="text-gray-400">{msg}</div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default ResultsProcessor