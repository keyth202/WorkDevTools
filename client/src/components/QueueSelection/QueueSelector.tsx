import React, { useState, useRef, useEffect } from 'react';

type Queue = {
  id: string;
  name: string;
};

interface QueueSelectorProps {
  queues: Queue[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const QueueSelector: React.FC<QueueSelectorProps> = ({ queues, onSelectionChange }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredQueues = queues.filter((q) => q.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10);
  //Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleQueue = (id: string) => {
    let newSelected;
    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((qid) => qid !== id);
    } else {
      newSelected = [...selectedIds, id];
    }
    setSelectedIds(newSelected);
    onSelectionChange(newSelected);
  };

  return (
       <div  ref={dropdownRef} className="relative max-w-md mx-auto mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-gray-100 border rounded-lg shadow-sm text-left"
      >
        {selectedIds.length > 0 ? `${selectedIds.length} queue(s) selected` : 'Select queues'}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search queues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            {filteredQueues.length > 0 ? (
              filteredQueues.map((queue) => (
                <label
                  key={queue.id}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(queue.id)}
                    onChange={() => toggleQueue(queue.id)}
                    className="mr-2"
                  />
                  {queue.name}
                </label>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No queues found</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default QueueSelector;