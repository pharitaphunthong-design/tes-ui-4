'use client';

import { useState, useEffect } from 'react';
import { userApi, User } from '@/lib/api';
import { Search, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle2, X, RefreshCw, KeyRound, Calendar } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success' | ''; text: string }>({ type: '', text: '' });

  const [searchId, setSearchId] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    avatar: 'https://avatars.githubusercontent.com/u/48077644',
  });

  const notify = (type: 'error' | 'success', text: string) => {
    setStatusMsg({ type, text });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      setUsers(Array.isArray(res.data) ? res.data : []);
      notify('success', 'GET /users สำเร็จ: โหลดข้อมูลผู้ใช้งานเรียบร้อย');
    } catch (err: any) {
      notify('error', `GET /users ล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGetById = async (targetId?: string) => {
    const id = targetId || searchId.trim();
    if (!id) return;
    setLoading(true);
    try {
      const res = await userApi.getById(id);
      setSelectedUser(res.data);
      notify('success', `GET /users/${id} สำเร็จ`);
    } catch (err: any) {
      setSelectedUser(null);
      notify('error', `GET /users/${id} ล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        password: user.password || '',
        avatar: user.avatar || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await userApi.update(editingId, formData);
        notify('success', `PUT /users/${editingId} สำเร็จ`);
      } else {
        await userApi.create(formData);
        notify('success', 'POST /users สำเร็จ');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      notify('error', `บันทึกข้อมูลล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`ยืนยันการลบ User ID: ${id} ?`)) return;
    setLoading(true);
    try {
      await userApi.delete(id);
      notify('success', `DELETE /users/${id} สำเร็จ`);
      if (selectedUser?.id === id) setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      notify('error', `DELETE ล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {statusMsg.text && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 border ${statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg({ type: '', text: '' })}><X className="w-4 h-4 opacity-60 hover:opacity-100" /></button>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ระบบจัดการผู้ใช้งาน (USERS)</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">Endpoint: /users (ทั้งหมด {users.length} รายการ)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button onClick={fetchUsers} title="รีเฟรชข้อมูล" className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
            <input
              type="text"
              placeholder="User ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="px-3 py-2 text-sm bg-transparent focus:outline-none w-28"
            />
          </div>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 shadow-2xs transition">
            <Plus className="w-4 h-4" /> เพิ่ม User (POST)
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="bg-indigo-50/80 border border-indigo-200 p-5 rounded-2xl relative">
          <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">ผลลัพธ์ GET /users/{selectedUser.id}</span>
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={selectedUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={selectedUser.username}
              className="w-16 h-16 rounded-full object-cover bg-white border-2 border-white shadow-xs"
            />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedUser.first_name} {selectedUser.last_name} <span className="text-sm font-mono text-indigo-600">(@{selectedUser.username})</span>
              </h3>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border">ID: {selectedUser.id}</span>
                <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border"><KeyRound className="w-3 h-3" /> {selectedUser.password || '-'}</span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border"><Calendar className="w-3 h-3" /> {formatDate(selectedUser.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">วันที่สร้าง</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{user.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="font-semibold text-slate-800">
                        {user.first_name} {user.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-50 text-indigo-700">
                      @{user.username}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                    {user.password || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button onClick={() => handleGetById(user.id)} title="ดูรายบุคคล" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openModal(user)} title="แก้ไข" className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(user.id)} title="ลบ" className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? `แก้ไข User ${editingId}` : 'เพิ่ม User ใหม่'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อจริง (first_name)</label>
                  <input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">นามสกุล (last_name)</label>
                  <input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (username)</label>
                <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">รหัสผ่าน (password)</label>
                <input type="text" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">ลิงก์รูปภาพ / Base64 (avatar)</label>
                <input type="text" value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">ยกเลิก</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}