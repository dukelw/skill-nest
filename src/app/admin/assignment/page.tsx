"use client";

import { useEffect, useState } from "react";
import { userService } from "~/services/userService";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import User from "~/models/User";
import { LewisPagination } from "~/components/Partial/LewisPagination";
import { useAuthStore } from "~/store/authStore";
import AssignmentList from "./_components/AssignmentList";
import { assignmentService } from "~/services/assignmentService";

function AssignmentManagement() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [assignments, setAssignments] = useState([]);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);

  const fetchData = async (page: number = 1) => {
    const res = await assignmentService.getAllAssignments({ limit, page });
    const { total, items } = res;

    setAssignments(items);
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
        <BreadcrumbItem href="/admin/assignment">Assignment</BreadcrumbItem>
      </Breadcrumb>
      <AssignmentList assignments={assignments} onUpdate={fetchData} />
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

export default AssignmentManagement;
