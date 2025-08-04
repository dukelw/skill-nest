"use client";

import { useEffect, useState } from "react";
import { userService } from "~/services/userService";
import UserList from "./_components/UserList";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import User from "~/models/User";
import { LewisPagination } from "~/components/Partial/LewisPagination";
import { useAuthStore } from "~/store/authStore";

function UserManagement() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);

  const fetchData = async (page: number = 1) => {
    const res = await userService.getUsers("", page, limit);
    const { total, items: resUser } = res;

    setUsers(resUser);
    setPage(page);
    setTotal(total);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="p-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Admin</BreadcrumbItem>
        <BreadcrumbItem href="/admin/user">User</BreadcrumbItem>
      </Breadcrumb>
      <UserList
        users={users ?? []}
        userId={user?.id ?? 0}
        onUpdate={fetchData}
      />
      <LewisPagination
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        limit={limit}
        total={total}
        onPageChange={fetchData}
      />
    </div>
  );
}

export default UserManagement;
