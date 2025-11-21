import React, {useState, useEffect} from 'react'
import { useRecoilState } from 'recoil';
import {
  progressState,
  isProcessingState,
 keywordState,
 startDateState,
  endDateState,
} from '@/app/recoil/recoilState';
import { searchConversationsByKeyword } from '@/app/scripts/Genesys/genesysRecServices';
import KeywordResults from './KeywordResults';


const KeywordProcessor = () => {
    const [startDate, setStartDate] = useRecoilState(startDateState);
    const [endDate, setEndDate] = useRecoilState(endDateState);
    const [progress, setProgress] = useRecoilState(progressState);
    const [isProcessing, setIsProcessing] = useRecoilState(isProcessingState);
    const [keywordSt, setKeywordSt] = useRecoilState(keywordState);
    const [keywords, setKeywords] = useState<string[]>([]);
    //const [queues, setQueues] = useState<string[]>([]);

    const handleProcess = async () => {
        if (!keywords || keywords.length === 0) {
            alert('Please enter at least one keyword.');
            return;
        } 
        await searchKeywords(keywords);
       
        console.log("Processing data with keywords:", keywords.join(', '));
    }
    async function searchKeywords(keywords: string[]) {
       
        try {
            const results = await searchConversationsByKeyword(keywords, startDate, endDate);
            console.log("Search Results:", results);
            
            setKeywordSt((prev:any) => ({
                ...prev,
                search: results?.results,
            }));
            setIsProcessing(true); 
            setProgress(0);
            // Handle results as needed
        } catch (error) {
            console.error("Error searching keywords:", error);
        } 
    }

  return (
    <div className="bg-gray-50  flex flex-col">
    <div className="container mx-auto px-4 py-8 flex-grow">
            <div>
                <h2>Split keywords by comma</h2>
                <input
                    type="text"
                    placeholder="Search by keyword"
                    className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onChange={(e) => {
                        const value = e.target.value;
                        setKeywords(value.split(',').map((keyword) => keyword.trim()).filter((keyword) => keyword));
                    }}
                />
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
        <KeywordResults />
    </div>

  )
}

export default KeywordProcessor