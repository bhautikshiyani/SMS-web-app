import React from 'react';

interface VideoMessageProps {
  thumbnail?: string;
  duration?: string;
}

const VideoMessage: React.FC<VideoMessageProps> = ({ thumbnail, duration }) => {
  return (
    <div className="relative w-48 h-32 rounded overflow-hidden border">
      {thumbnail ? (
        <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-300 dark:bg-gray-700">
          <span>No thumbnail</span>
        </div>
      )}
      {duration && (
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {duration}
        </div>
      )}
    </div>
  );
};

export default VideoMessage;
