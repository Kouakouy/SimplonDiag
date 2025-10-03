"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { UserManagement } from "@/components/admin/UserManagement"

export default function UsersPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
          <UserManagement />
        </main>
      </div>
    </div>
  )
}