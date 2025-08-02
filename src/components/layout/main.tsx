'use client';
import { cn } from '@/lib/utils';
import React from 'react';

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
        className={cn(
          '@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto',
         
          fixed && 'fixed-main flex flex-grow flex-col overflow-auto'
        )}
      {...props}
    />
  );
};

Main.displayName = 'Main';
