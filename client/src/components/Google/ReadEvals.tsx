import React, {useState, useEffect} from 'react'
import { readDocument } from '@/scripts/Google/firebase'

const ReadEvals = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    
    const fetchData = async () => {
      const result = await readDocument('CATesterEvals', 'wxcc-internal-project');
      setData(result);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Read Evaluations</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default ReadEvals