import React, { useEffect, useState } from 'react'
import PrettyProcessor from '@/components/processor/PrettyProcessor'
import KeywordProcessor from '@/components/processor/KeywordProcessor';
import { useRecoilState } from 'recoil';
import { queueState } from '@/app/recoil/recoilState';
import {getQueues} from '@/app/scripts/Genesys/genesysRecServices';

const DataProcessor = () => {
  const [queueData, setQueueData] = useRecoilState(queueState);
  const [processorType, setProcessorType] = useState<'pretty' | 'keyword'>('pretty');
  useEffect(() => {
    const fetchQueues = async () => {
      const queues = await getQueues();
      console.log("Fetched Queues:", queues.length);
      setQueueData((prev)=>({
        ...prev,
        queues: queues
      }));
    }
    fetchQueues();
  }, []);

  return (
    <div>
      <div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setProcessorType('pretty')}
        >
          Queue Processor
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setProcessorType('keyword')}
        >
          Keyword Processor
        </button>
      </div>
      {processorType === 'pretty' ? <PrettyProcessor /> : <KeywordProcessor />}
    </div>
  )
}

export default DataProcessor