"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: number;
  fullName: string;
  username: string;
  mobile: string;
  createdAt: string;
  isActive: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-extrabold">کاربران</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3">نام</th>
              <th className="px-4 py-3">نام کاربری</th>
              <th className="px-4 py-3">موبایل</th>
              <th className="px-4 py-3">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{user.fullName}</td>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.mobile}</td>
                <td className="px-4 py-3">{user.isActive ? "فعال" : "غیرفعال"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
