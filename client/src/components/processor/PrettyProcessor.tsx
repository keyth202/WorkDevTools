import React, {useState, useEffect} from 'react'
import { useRecoilState } from 'recoil';
import {
  startDateState,
  endDateState,
  progressState,
  isProcessingState,
  queueState,
} from '@/app/recoil/recoilState';
import ResultsProcessor from './ResultsProcessor';
import QueueSelector from '../QueueSelection/QueueSelector';

const PrettyProcessor = () => {
    const [startDate, setStartDate] = useRecoilState(startDateState);
    const [endDate, setEndDate] = useRecoilState(endDateState);
    const [progress, setProgress] = useRecoilState(progressState);
    const [isProcessing, setIsProcessing] = useRecoilState(isProcessingState);
    const [queueSt, setQueueSt]=useRecoilState(queueState);
    const [keywords, setKeywords] = useState<string[]>([]);
    //const [queues, setQueues] = useState<string[]>([]);

    const handleProcess = async () => {
        if (!startDate || !endDate ) {
            alert('Please select both start and end dates.');
            return;
        } else if ( queueSt.selectedQueues.length === 0) {
            alert('Please select at least one queue to process.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        console.log("Processing data from", startDate, "to", endDate);
        console.log("Processing isoString", startDate.toISOString(), "to", endDate.toISOString());

    }
    const handleSelectionChange = (ids: string[]) => {
        //console.log('Selected Queue IDs:', ids);
       
        if (ids.length > 0) {
            setQueueSt((prev:any) => ({
                ...prev,
                selectedQueues: ids,
            }));
        }
    };
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
    <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Data Processor</h1>
                {Array.isArray(queueSt.queues) && queueSt.queues.length > 0 ? (<div>
                    <p className="text-gray-600">Select the queues you want to process:</p>
                    <QueueSelector queues={queueSt?.queues} onSelectionChange={handleSelectionChange} />
                </div>) : <p className="text-gray-600">No queues available for processing</p>}
                <p className="text-gray-600">Select a date range to process your data</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden date-picker-container">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label  className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <div className="relative">
                                <input id="start-date" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    type="date"
                                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        date.setHours(0, 0, 1, 0); 
                                        setStartDate(date);
                                    }} 
                                />
                                <i className="fas fa-calendar-alt absolute right-3 top-3 text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <div className="relative">
                                <input type="date" 
                                    id="end-date" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                    
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        date.setHours(23, 59, 0, 0); 
                                        setEndDate(date);
                                    }}
                                />
                                <i className="fas fa-calendar-alt absolute right-3 top-3 text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="include-weekends" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <label className="text-sm text-gray-700">Include weekends</label>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button id="quick-week" className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
                                Last Week
                            </button>
                            <button id="quick-month" className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
                                Last Month
                            </button>
                            <button id="quick-year" className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
                                Last Year
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button 
                        id="process-btn" 
                        className={`px-6 py-2 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} text-white font-medium rounded-lg shadow-sm transition flex items-center`}
                        onClick={handleProcess}
                        disabled={isProcessing}    
                    >
                        <span>Process Data</span>
                        <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
            
            {/*startDate && endDate ? <div id="date-range-display" className="mt-4 text-center text-gray-500 text-sm">
                {`Processing data from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`}
            </div> : (
                <div id="date-range-display" className="mt-4 text-center text-gray-500 text-sm">
                    No date range selected
                </div>
            )*/}
        </div>
        <ResultsProcessor />
    </div>
    
   
    </div>
  )
}

export default PrettyProcessor