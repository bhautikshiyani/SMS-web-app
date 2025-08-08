import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive'
import { DataTable } from '@/components/dashboard/data-table'
import { SectionCards } from '@/components/dashboard/section-cards'
import React from 'react'
import data from '@/lib/data.json';
const dashboard = () => {
  return (
       <div className="@container/main  flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6 ">
          <SectionCards />
          <div className="">
            <ChartAreaInteractive />
          </div>
          
          <DataTable data={data} />
        </div>
      </div>
  )
}

export default dashboard