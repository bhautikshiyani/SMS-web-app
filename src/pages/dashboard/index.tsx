import { ChartAreaInteractive } from '@/components/admin/dashboard/chart-area-interactive'
import { DataTable } from '@/components/admin/dashboard/data-table'
import { SectionCards } from '@/components/admin/dashboard/section-cards'
import React from 'react'
import data from '@/lib/data.json';
const Dashboard = () => {
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

export default Dashboard