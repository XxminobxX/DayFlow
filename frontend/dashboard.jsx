import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Good Morning, {user.name.split(' ')[0]} 👋
      </h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Attendance Status" 
          value="Checked In" 
          sub="09:14 AM" 
          color="bg-green-100 text-green-700"
          icon={<CheckCircle />}
        />
        <StatCard 
          title="Leave Balance" 
          value="12 Days" 
          sub="Annual Quota" 
          color="bg-blue-100 text-blue-700"
          icon={<Clock />}
        />
        {user.role === 'Admin' ? (
           <StatCard 
           title="Pending Approvals" 
           value="4 Requests" 
           sub="Needs Attention" 
           color="bg-orange-100 text-orange-700"
           icon={<AlertCircle />}
         />
        ) : (
          <StatCard 
          title="Next Holiday" 
          value="Labor Day" 
          sub="Sep 04" 
          color="bg-purple-100 text-purple-700"
          icon={<Calendar />}
        />
        )}
      </div>

      {/* Role Based Views */}
      {user.role === 'Admin' ? <AdminView /> : <EmployeeView />}
    </div>
  );
}

const StatCard = ({ title, value, sub, color, icon }) => (
  <div className="card flex items-start justify-between">
    <div>
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
  </div>
);

const EmployeeView = () => (
  <div className="card">
    <h3 className="font-bold text-lg mb-4">My Recent Activity</h3>
    <div className="space-y-4">
      {/* Mock Activity List */}
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <p className="font-medium text-slate-800">Marked Attendance</p>
            <p className="text-xs text-slate-500">Today, 09:00 AM</p>
          </div>
          <span className="status-badge bg-green-100 text-green-700">On Time</span>
        </div>
      ))}
    </div>
  </div>
);

const AdminView = () => (
  <div className="card">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg">Employee Overview</h3>
      <button className="btn-primary text-sm">Add Employee</button>
    </div>
    <table className="w-full text-left">
      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
        <tr>
          <th className="px-4 py-3">Employee</th>
          <th className="px-4 py-3">Department</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {/* You would map real users here */}
        <tr>
          <td className="px-4 py-3 font-medium">Jane Smith</td>
          <td className="px-4 py-3 text-slate-500">Design</td>
          <td className="px-4 py-3"><span className="status-badge bg-green-100 text-green-700">Active</span></td>
          <td className="px-4 py-3 text-indigo-600 hover:underline cursor-pointer">Edit</td>
        </tr>
      </tbody>
    </table>
  </div>
);