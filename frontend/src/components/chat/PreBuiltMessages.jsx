import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

const PRE_BUILT_MESSAGES = [
  "Hi, I'm interested in getting mentorship from you",
  "When will you be available for a session?"
];

const PreBuiltMessages = ({ onSelect }) => {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-gray-500" />
        <h3 className="font-medium text-gray-700">Quick Messages</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRE_BUILT_MESSAGES.map((message, index) => (
          <Button
            key={index}
            variant="outline"
            className="text-sm"
            onClick={() => onSelect(message)}
          >
            {message}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PreBuiltMessages; 