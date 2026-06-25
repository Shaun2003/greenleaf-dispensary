import { useState } from 'react';
import { Shield, ShieldAlert, User, Check, Ban } from 'lucide-react';
import { User as UserType } from '../types';

interface AdminUsersProps {
  users: UserType[];
  onToggleUserStatus: (id: string, status: 'active' | 'blocked') => void;
}

export default function AdminUsers({ users, onToggleUserStatus }: AdminUsersProps) {
  return (
    <div className="space-y-6 font-sans selection:bg-brand-green selection:text-white">
      <div>
        <h3 className="font-serif font-bold text-brand-dark text-base">Client Accounts Console</h3>
        <p className="text-xs text-brand-muted-green font-mono">Audit account registrations, monitor security logs, and control access states</p>
      </div>

      {/* Users list - Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {users.map((u) => (
          <div key={u.id} className="glass-light p-4 space-y-3.5 shadow-xs text-brand-dark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-tag border border-brand-border flex items-center justify-center font-mono font-bold text-brand-green shrink-0 text-sm">
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif font-bold text-brand-dark text-sm leading-tight truncate">{u.name}</h4>
                <p className="text-[10px] text-brand-muted-green font-mono truncate">{u.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                u.role === 'admin'
                  ? 'bg-amber-50 text-amber-600 border border-amber-100'
                  : 'bg-brand-tag text-brand-green border border-brand-border'
              }`}>
                {u.role === 'admin' ? '🛡️ Admin' : '👤 Customer'}
              </span>
            </div>

            <div className="space-y-2 py-2.5 border-y border-brand-bg text-xs">
              <div className="flex justify-between">
                <span className="text-[10px] text-brand-muted-green font-mono uppercase">Delivery Address:</span>
                <span className="font-sans text-brand-dark truncate max-w-[200px] text-right">
                  {u.addresses && u.addresses.length > 0 ? u.addresses[0] : 'None registered'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-brand-muted-green font-mono uppercase">Joined Date:</span>
                <span className="font-mono text-brand-dark">
                  {new Date(u.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-brand-muted-green font-mono uppercase">Account Status:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  u.status === 'active'
                    ? 'bg-emerald-50 text-brand-green border border-brand-border'
                    : 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                }`}>
                  {u.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              {u.id === 'user-admin' ? (
                <span className="text-[10px] text-brand-muted-green font-mono italic">Primary Admin Lock</span>
              ) : u.status === 'active' ? (
                <button
                  onClick={() => onToggleUserStatus(u.id, 'blocked')}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold font-sans cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" /> BLOCK USER ACCOUNT
                </button>
              ) : (
                <button
                  onClick={() => onToggleUserStatus(u.id, 'active')}
                  className="w-full py-2 bg-brand-tag hover:bg-brand-green hover:text-white border border-brand-border hover:border-transparent text-brand-green rounded-xl text-xs font-semibold font-sans cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> UNBLOCK USER ACCOUNT
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Users list - Desktop Spreadsheet Table */}
      <div className="hidden md:block glass-light rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-bg border-b border-brand-border text-brand-dark font-mono uppercase">
                <th className="p-4">User Details</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Fulfillment Address</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-brand-bg/45 transition-colors">
                  {/* Avatar + Info */}
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-tag border border-brand-border flex items-center justify-center font-mono font-bold text-brand-green shrink-0 text-xs">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-dark">{u.name}</p>
                      <p className="text-[10px] text-brand-muted-green font-mono">{u.email}</p>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-brand-tag text-brand-green border border-brand-border'
                    }`}>
                      {u.role === 'admin' ? '🛡️ Admin' : '👤 Customer'}
                    </span>
                  </td>

                  {/* Primary address */}
                  <td className="p-4 font-sans text-brand-dark max-w-[200px] truncate">
                    {u.addresses && u.addresses.length > 0 ? u.addresses[0] : 'None registered'}
                  </td>

                  {/* Registered Date */}
                  <td className="p-4 font-mono text-brand-muted-green whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>

                  {/* Account status */}
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      u.status === 'active'
                        ? 'bg-emerald-50 text-brand-green border border-brand-border'
                        : 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  {/* Lock actions */}
                  <td className="p-4 text-right whitespace-nowrap">
                    {u.id === 'user-admin' ? (
                      <span className="text-[10px] text-brand-muted-green font-mono italic">Primary Admin Lock</span>
                    ) : u.status === 'active' ? (
                      <button
                        onClick={() => onToggleUserStatus(u.id, 'blocked')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-mono cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <Ban className="w-3 h-3" /> BLOCK USER
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleUserStatus(u.id, 'active')}
                        className="px-2.5 py-1 bg-brand-tag hover:bg-brand-green hover:text-white border border-brand-border hover:border-transparent text-brand-green rounded-lg text-[10px] font-mono cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> UNBLOCK USER
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
