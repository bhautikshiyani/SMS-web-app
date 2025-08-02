import { FileText } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

interface FileMessageProps {
    fileName?: string;
    fileSize?: string;
    isSent?: boolean;
}

const FileMessage: React.FC<FileMessageProps> = ({ fileName, fileSize, isSent }) => {
    return (
        <div className={`flex items-start gap-4 p-4 border rounded-md bg-muted max-w-sm ${isSent ? 'ml-auto' : ''}`}>
            <FileText className="h-8 w-8 opacity-50 mt-1 flex-shrink-0" />
            <div className="flex flex-col gap-2 min-w-0">
                <div className="text-sm">
                    {fileName}
                    <span className="text-muted-foreground ml-2 text-sm">({fileSize})</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Download</Button>
                    <Button variant="outline" size="sm">Preview</Button>
                </div>
            </div>
        </div>
    );
};

export default FileMessage;
