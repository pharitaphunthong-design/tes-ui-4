'use client';

import { useState, useEffect } from 'react';
import { userApi, User, bookApi, Book } from '@/lib/api';
import { Users, BookOpen, Search, Plus, Edit, Trash2, X, ChevronRight, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success' | ''; text: string }>({ type: '', text: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    avatar: 'https://avatars.githubusercontent.com/u/48077644',
  });
  
  const [bookFormData, setBookFormData] = useState({
    book_name: '',
    book_price: '',
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'users' | 'books' } | null>(null);

  const notify = (type: 'error' | 'success', text: string) => {
    setStatusMsg({ type, text });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, bookRes] = await Promise.all([userApi.getAll(), bookApi.getAll()]);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setBooks(Array.isArray(bookRes.data) ? bookRes.data : []);
    } catch (err: any) {
      notify('error', `โหลดข้อมูลล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    if (activeTab === 'users') {
      setUserFormData({
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      });
    } else {
      setBookFormData({
        book_name: '',
        book_price: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: User | Book) => {
    setEditingId(item.id);
    if (activeTab === 'users') {
      const u = item as User;
      setUserFormData({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        username: u.username || '',
        password: u.password || '',
        avatar: u.avatar || '',
      });
    } else {
      const b = item as Book;
      setBookFormData({
        book_name: b.book_name || '',
        book_price: String(b.book_price || ''),
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'users') {
        if (editingId) {
          await userApi.update(editingId, userFormData);
          notify('success', `อัปเดต User ID #${editingId} สำเร็จ`);
        } else {
          await userApi.create(userFormData);
          notify('success', 'เพิ่ม User ใหม่สำเร็จ');
        }
      } else {
        if (editingId) {
          await bookApi.update(editingId, bookFormData);
          notify('success', `อัปเดตหนังสือ ID #${editingId} สำเร็จ`);
        } else {
          await bookApi.create(bookFormData);
          notify('success', 'เพิ่มหนังสือใหม่สำเร็จ');
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      notify('error', `บันทึกข้อมูลล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (id: string, name: string, type: 'users' | 'books') => {
    setItemToDelete({ id, name, type });
    setDeleteModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      if (itemToDelete.type === 'users') {
        await userApi.delete(itemToDelete.id);
        notify('success', `ลบ User ID #${itemToDelete.id} สำเร็จ`);
      } else {
        await bookApi.delete(itemToDelete.id);
        notify('success', `ลบหนังสือ ID #${itemToDelete.id} สำเร็จ`);
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      notify('error', `ลบข้อมูลล้มเหลว: ${err.message}`);
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

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const username = (user.username || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || username.includes(query) || user.id === query;
  });

  const filteredBooks = books.filter((book) => {
    const name = (book.book_name || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || book.id === query;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto py-6 items-stretch">
      <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between h-full space-y-3">
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">เมนูระบบหลัก</h2>
          
          <button 
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            className={`w-full text-left group p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
              activeTab === 'users' 
                ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs' 
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${activeTab === 'users' ? 'text-indigo-900' : 'text-slate-800'}`}>
                  USERS Module
                </h3>
                <p className="text-[11px] text-slate-500">จัดการข้อมูลผู้ใช้งาน</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'users' ? 'text-indigo-500 translate-x-0.5' : 'text-slate-400'}`} />
          </button>

          <button 
            onClick={() => { setActiveTab('books'); setSearchTerm(''); }}
            className={`w-full text-left group p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
              activeTab === 'books' 
                ? 'bg-teal-50/80 border-teal-200 shadow-2xs' 
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                activeTab === 'books' ? 'bg-teal-600 text-white shadow-xs' : 'bg-teal-50 text-teal-600'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${activeTab === 'books' ? 'text-teal-900' : 'text-slate-800'}`}>
                  BOOK Module
                </h3>
                <p className="text-[11px] text-slate-500">จัดการคลังหนังสือ</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'books' ? 'text-teal-500 translate-x-0.5' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
        {statusMsg.text && (
          <div className={`p-3 rounded-xl flex items-center justify-between text-xs border ${statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg({ type: '', text: '' })}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'users' ? 'ระบบจัดการผู้ใช้งาน (USERS)' : 'ระบบจัดการคลังหนังสือ (BOOK)'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeTab === 'users' ? `แสดงข้อมูลทั้งหมด (${users.length} รายการ)` : `แสดงรายการหนังสือทั้งหมด (${books.length} รายการ)`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50 px-3 py-2 flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? 'ค้นหาชื่อ, นามสกุล...' : 'ค้นหาชื่อหนังสือ...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs bg-transparent focus:outline-none w-full"
              />
            </div>

            <button 
              onClick={handleOpenAddModal}
              className={`px-4 py-2.5 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition shrink-0 ${
                activeTab === 'users' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <Plus className="w-4 h-4" /> เพิ่มข้อมูล
            </button>
          </div>
        </div>

        {activeTab === 'users' ? (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500 font-semibold">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-3">USERNAME</th>
                  <th className="py-3 px-3">PASSWORD</th>
                  <th className="py-3 px-3">วันที่สร้าง</th>
                  <th className="py-3 px-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">ไม่พบข้อมูลผู้ใช้งาน</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono text-slate-500">{user.id}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className="w-8 h-8 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0" />
                          <div className="font-semibold text-slate-800">{user.first_name} {user.last_name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700">@{user.username}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{user.password || '-'}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(user.created_at)}</td>
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <button onClick={() => handleOpenEditModal(user)} title="แก้ไข" className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenDeleteModal(user.id, `${user.first_name} ${user.last_name}`, 'users')} title="ลบ" className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500 font-semibold">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">ชื่อหนังสือ</th>
                  <th className="py-3 px-3">ราคา</th>
                  <th className="py-3 px-3">วันที่สร้าง</th>
                  <th className="py-3 px-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">ไม่พบข้อมูลหนังสือ</td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono text-slate-500">{book.id}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{book.book_name || 'ไม่มีชื่อ'}</td>
                      <td className="py-3 px-3 font-semibold text-teal-600">฿{book.book_price || '0'}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(book.created_at)}</td>
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <button onClick={() => handleOpenEditModal(book)} title="แก้ไข" className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenDeleteModal(book.id, book.book_name || 'ไม่มีชื่อ', 'books')} title="ลบ" className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {activeTab === 'users' 
                  ? (editingId ? `แก้ไข User ID #${editingId}` : 'เพิ่ม User ใหม่') 
                  : (editingId ? `แก้ไขหนังสือ ID #${editingId}` : 'เพิ่มหนังสือใหม่')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'users' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อจริง</label>
                      <input type="text" required value={userFormData.first_name} onChange={(e) => setUserFormData({ ...userFormData, first_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">นามสกุล</label>
                      <input type="text" required value={userFormData.last_name} onChange={(e) => setUserFormData({ ...userFormData, last_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
                    <input type="text" required value={userFormData.username} onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">รหัสผ่าน</label>
                    <input type="text" required value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ลิงก์รูปภาพ</label>
                    <input type="text" value={userFormData.avatar} onChange={(e) => setUserFormData({ ...userFormData, avatar: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อหนังสือ</label>
                    <input type="text" required value={bookFormData.book_name} onChange={(e) => setBookFormData({ ...bookFormData, book_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ราคาหนังสือ</label>
                    <input type="text" required value={bookFormData.book_price} onChange={(e) => setBookFormData({ ...bookFormData, book_price: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">ยกเลิก</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 text-sm text-white rounded-xl font-medium ${activeTab === 'users' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบข้อมูล</h3>
              <p className="text-sm text-slate-500 mt-1">
                คุณต้องการลบ <span className="font-semibold text-slate-800">"{itemToDelete.name}"</span> (ID: {itemToDelete.id}) ใช่หรือไม่?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }} className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition">
                ยกเลิก
              </button>
              <button type="button" disabled={loading} onClick={handleDeleteExecute} className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-md transition">
                {loading ? 'กำลังลบ...' : 'ลบข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}