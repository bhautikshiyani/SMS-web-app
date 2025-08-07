import { AddUser } from '@/components/user/add-user'
import { UserDataTable } from '@/components/user/user-table'
import React from 'react'

const user = () => {
  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">User</h2>
          <AddUser />
        </div>
      </div>
      <UserDataTable />
    </div>
  )
}

export default user