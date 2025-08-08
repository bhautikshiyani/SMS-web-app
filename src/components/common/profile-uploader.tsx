/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import * as React from 'react';
import Dropzone, { type DropzoneProps, type FileRejection } from 'react-dropzone';

import { Button } from '@/components/ui/button';

import toast from 'react-hot-toast';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn } from '@/lib/utils';
import { Camera, X } from 'lucide-react';


interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: any;
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;
  onUpload?: (files: File[]) => Promise<void>;
  progresses?: Record<string, number>;
  accept?: DropzoneProps['accept'];
  maxSize?: DropzoneProps['maxSize'];
  maxFiles?: DropzoneProps['maxFiles'];
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = { 'image/*': [] },
    maxSize = 1024 * 1024 * 2,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState<(File & { preview?: string | undefined })[]>({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
        toast.error('Cannot upload more than 1 file at a time');
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }

      if (onUpload && updatedFiles.length > 0 && updatedFiles.length <= maxFiles) {
        const target = updatedFiles.length > 0 ? `${updatedFiles.length} files` : `file`;

        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${target}...`,
          success: () => {
            setFiles([]);
            return `${target} uploaded`;
          },
          error: `Failed to upload ${target}`,
        });
      }
    },
    [files, maxFiles, multiple, onUpload, setFiles]
  );

  function onRemove() {
    if (!files) return;
    setFiles([]);
    onValueChange?.([]);
  }

  React.useEffect(() => {
    return () => {
      if (!Array.isArray(files)) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

  return (
    <>
      <div className="relative flex items-center flex-col gap-6 overflow-hidden">
        {typeof files === 'string' ? (
          <div className="">
            <FileCard file={files} onRemove={onRemove} />
          </div>
        ) : files?.length ? (
          <div className="">
            <FileCard file={files[0]} onRemove={onRemove} progress={progresses?.[files[0].name]} />
          </div>
        ) : (
          <Dropzone
            onDrop={onDrop}
            accept={accept}
            maxSize={maxSize}
            maxFiles={maxFiles}
            multiple={maxFiles > 1 || multiple}
            disabled={isDisabled}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={cn(
                  'group border-muted-foreground/25 hover:bg-muted/25 relative grid h-[64px] w-[64px] rounded-full cursor-pointer place-items-center border-2 border-dashed  text-center transition',
                  'ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                  isDragActive && 'border-muted-foreground/50',
                  isDisabled && 'pointer-events-none opacity-60',
                  className
                )}
                {...dropzoneProps}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <div className="flex flex-col items-center justify-center gap-4 ">
                    <div className="rounded-full ">
                      <Camera  />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 ">
                    <div className="rounded-full ">
                      <Camera />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Dropzone>
        )}
        <p className="text-muted-foreground/70 text-sm text-center">
          Please upload profile picture.
          <br />
          Recommended resolution is 60x60 px.
        </p>
      </div>
    </>
  );
}

interface FileCardProps {
  file: string | File | null | undefined; // Notice "preview" is optional here
  onRemove: () => void;
  progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  return (
    <div className="relative flex items-center">
      <div className=" relative">
        {typeof file === 'string' ? (
          <Image
            src={file}
            alt={file}
            width={60}
            height={60}
            loading="lazy"
            className="aspect-square shrink-0 border rounded-full object-cover"
          />
        ) : isFileWithPreview(file) ? (
          <Image
            src={file.preview}
            alt={file.name}
            width={60}
            height={60}
            loading="lazy"
            className="aspect-square shrink-0 border rounded-full object-cover"
          />
        ) : null}

        <div className="flex absolute top-0 -right-1 items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={onRemove}
            disabled={progress !== undefined && progress < 100}
            className="size-4 text-xs cursor-pointer hover:bg-red-500 transition duration-300 hover:text-white rounded-full"
          >
            <X className="text-xs" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function isFileWithPreview(file: unknown): file is File & { preview: string } {
  return (
    typeof file === 'object' &&
    file !== null &&
    'preview' in file &&
    typeof (file as any).preview === 'string'
  );
}
