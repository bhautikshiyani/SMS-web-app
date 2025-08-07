'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { MoreVerticalIcon, UserCircleIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { formatDate, getImageSrc } from '@/lib/utils';

import { DataTable } from '../common/DataTable';
import toast from 'react-hot-toast';



interface UserTableProps {
  initialData?: any | { users: any[] };
}

export function UserDataTable({ initialData }: UserTableProps) {
  const router = useRouter();
  // const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);
  const [userData, setUserData] = React.useState<any>(() => {
    if (!initialData) return { users: [], totalUsers: 0, page: 1, limit: 10, totalPages: 1 };
    return { users: [], totalUsers: 0, page: 1, limit: 10, totalPages: 1 };
  });

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = React.useState('');
  const [role, setRole] = React.useState<string>('all');
  const [pagination, setPagination] = React.useState({
    pageIndex: (userData.page || 1) - 1,
    pageSize: userData.limit || 10,
  });

  // Action functions
  const viewUserDetails = (user: any) => {
    if (!user) return;

  };

  const editUser = (user: any) => {
    if (!user) return;
    router.push(`/user/edit?id=${user._id}`);
  
  };

  // Fetch data when parameters change
  const fetchData = async (page: number, limit: number, search?: string, roleFilter?: string) => {
    setLoading(true);
    try {
      // const result = await dispatch(
      //   fetchEmployeeData({
      //     page: page + 1,
      //     limit: limit,
      //     search: search,
      //     role: roleFilter === 'all' ? undefined : roleFilter,
      //   })
      // ).unwrap();

      // // Set the data in state
      // setUserData(result);
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };
  const deleteUser = async (userId: string) => {
    if (!userId) return;
    // await dispatch(deleteEmployee(userId)).unwrap();
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: 'Deleting user...',
      success: 'User deleted successfully',
      error: 'Failed to delete user',
    });
    fetchData(pagination.pageIndex, pagination.pageSize, searchQuery, role);
  };
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchData(0, pagination.pageSize, query, role);
  };

  // Handle role filter change
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    fetchData(0, pagination.pageSize, searchQuery, newRole);
  };

  // Handle pagination changes
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
    fetchData(pageIndex, pageSize, searchQuery, role);
  };

  // Initial data load
  React.useEffect(() => {
    fetchData(pagination.pageIndex, pagination.pageSize, searchQuery, role);
  }, []);

  // Define columns
  const columns: ColumnDef<any>[] = [
    // Include the selection column
    // createSelectionColumn<User>(),

    {
      accessorKey: 'fullName',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        if (!user) return null;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {user.picture ? (
                <Image
                  src={getImageSrc(user.picture)}
                  alt='admin test'
                  width={100}
                  height={100}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">admin test</span>
              {/* <span className="text-xs text-muted-foreground">{user.email || 'No email'}</span> */}
            </div>
          </div>
        );
      },
      enableHiding: false,
    },

    // Other columns
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.original?.email || 'N/A'}</div>,
    },
    {
      accessorKey: 'lastlogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <div>{row.original?.joiningDate ? formatDate(row.original.lastlogin) : 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created at',
      cell: ({ row }) => (
        <div>{row.original?.joiningDate ? formatDate(row.original.createdAt) : 'N/A'}</div>
      ),
    },
    // {
    //   accessorKey: 'role',
    //   header: 'Role',
    //   cell: ({ row }) => {
    //     const role = row.original?.role || 'user';
    //     return <Badge variant={getRoleBadgeVariant(role)}>{getRoleDisplayName(role)}</Badge>;
    //   },
    // },

    // Actions column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <MoreVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => viewUserDetails(row.original)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editUser(row.original)}>Edit User</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => row.original?._id && deleteUser(row.original._id)}
            >
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Role filter options
  const status = {
    name: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Disable', value: 'disabled' },
    
    ],
    value: role,
    onChange: handleRoleChange,
  };

  return (
    <DataTable
      columns={columns}
      data={userData.users || []}
      loading={loading}
      pageCount={userData.totalPages || 1}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      totalItems={userData.totalUsers || 0}
      searchPlaceholder="Search user..."
      onSearch={handleSearch}
      filterOptions={status}
      enableSelection={false}
      enableColumnVisibility={true}
      enablePagination={true}
      onPaginationChange={handlePaginationChange}
      getRowId={(row) => row._id || String(Math.random())}
      emptyMessage="No users found."
      loadingMessage="Loading user..."
    />
  );
}
