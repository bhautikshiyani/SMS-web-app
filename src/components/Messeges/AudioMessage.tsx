import React from 'react';

interface AudioMessageProps {
  duration?: string;
}

const AudioMessage: React.FC<AudioMessageProps> = () => {
  return (
    <div className="flex items-center justify-center p-4 bg-muted rounded-md border">
            <audio controls className="w-80">
                <source src="/sound.mp3" type="audio/mpeg" />
            </audio>
        </div>
  );
};

export default AudioMessage;
