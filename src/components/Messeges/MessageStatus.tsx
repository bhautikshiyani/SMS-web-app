import { Check, CheckCheck } from 'lucide-react';
import React from 'react';

interface MessageStatusProps {
  status?: string; // e.g. 'sent', 'delivered', 'read'
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  let IconComponent = Check;
  let colorClass = 'text-gray-400';

  switch (status) {
    case 'sent':
      IconComponent = Check;
      colorClass = 'text-gray-400';
      break;
    case 'delivered':
      IconComponent = CheckCheck;
      colorClass = 'text-blue-400';
      break;
    case 'read':
      IconComponent = CheckCheck;
      colorClass = 'text-green-400';
      break;
    default:
      IconComponent = Check;
  }

  return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
};

export default MessageStatus;
