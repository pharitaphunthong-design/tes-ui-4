'use client';
import { useState, useEffect } from 'react';
import { bookApi, Book } from '@/lib/api';
import { Search, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle2, X, BookOpen, RefreshCw, Calendar, Tag, AlertTriangle } from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success' | ''; text: string }>({ type: '', text: '' });

  const [searchId, setSearchId] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    book_name: '',
    book_price: '',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);


  const notify = (type: 'error' | 'success', text: string) => {
    setStatusMsg({ type, text });
  };
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await bookApi.getAll();
      setBooks(Array.isArray(res.data) ? res.data : []);
      notify('success', 'GET /book สำเร็จ: โหลดข้อมูลหนังสือเรียบร้อย');
    } catch (err: any) {
      notify('error', `GET /book ล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBooks();
  }, []);


  const handleGetById = async (targetId?: string) => {
    const id = targetId || searchId.trim();
    if (!id) return;
    setLoading(true);
    try {
      const res = await bookApi.getById(id);
      setSelectedBook(res.data);
      notify('success', `GET /book/${id} สำเร็จ`);
    } catch (err: any) {
      setSelectedBook(null);
      notify('error', `GET /book/${id} ล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  const openModal = (book?: Book) => {
    if (book) {
      setEditingId(book.id);
      setFormData({
        book_name: book.book_name || '',
        book_price: String(book.book_price || ''),
      });
    } else {
      setEditingId(null);
      setFormData({
        book_name: '',
        book_price: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await bookApi.update(editingId, formData);
        notify('success', `PUT /book/${editingId} สำเร็จ`);
      } else {
        await bookApi.create(formData);
        notify('success', 'POST /book สำเร็จ');
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      notify('error', `บันทึกข้อมูลหนังสือล้มเหลว: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  const confirmDelete = (book: Book) => {
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };
  const handleDeleteExecute = async () => {
    if (!bookToDelete) return;
    setLoading(true);
    try {
      await bookApi.delete(bookToDelete.id);
      notify('success', `DELETE /book/${bookToDelete.id} สำเร็จ`);
      if (selectedBook?.id === bookToDelete.id) setSelectedBook(null);
      setDeleteModalOpen(false);
      setBookToDelete(null);
      fetchBooks();
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
          <h1 className="text-xl font-bold text-slate-900">ระบบจัดการคลังหนังสือ (BOOK)</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">Endpoint: /book (ทั้งหมด {books.length} รายการ)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-au to">
          <button onClick={fetchBooks} title="รีเฟรชข้อมูล" className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
            <input
              type="text"
              placeholder="Book ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="px-3 py-2 text-sm bg-transparent focus:outline-none w-28"
            />
            <button onClick={() => handleGetById()} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition">
              <Search className="w-3.5 h-3.5" /> GET/:id
            </button>
          </div>
          <button onClick={() => openModal()} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 shadow-2xs transition">
            <Plus className="w-4 h-4" /> เพิ่มหนังสือ (POST)
          </button>
        </div>
      </div>
    

      {selectedBook && (
        <div className="bg-teal-50/80 border border-teal-200 p-5 rounded-2xl relative">
          <button onClick={() => setSelectedBook(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-1 rounded-md">ผลลัพธ์ GET /book/{selectedBook.id}</span>
          <div className="mt-3 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedBook.book_name || 'ไม่มีชื่อหนังสือ'}
              </h3>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border">ID: {selectedBook.id}</span>
                <span className="flex items-center gap-1 font-semibold text-teal-700 bg-white px-2 py-0.5 rounded border"><Tag className="w-3 h-3" /> ฿{selectedBook.book_price || '0'}</span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border"><Calendar className="w-3 h-3" /> {formatDate(selectedBook.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition">
            <div className="p-5">
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">ID: {book.id}</span>
                <span className="text-xs text-slate-400">{formatDate(book.created_at)}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-base line-clamp-2 min-h-[3rem]">
                {book.book_name || 'ไม่มีชื่อหนังสือ'}
              </h3>
              <p className="mt-4 text-teal-600 font-bold text-lg flex items-center gap-1">
                <span className="text-xs font-normal text-slate-400">ราคา</span> ฿{book.book_price || '0'}
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button onClick={() => handleGetById(book.id)} className="text-xs text-slate-600 hover:text-teal-600 flex items-center gap-1 font-medium">
                <Eye className="w-3.5 h-3.5" /> รายละเอียด
              </button>
              <div className="space-x-1">
                <button onClick={() => openModal(book)} title="แก้ไข" className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                <button onClick={() => confirmDelete(book)} title="ลบ" className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteModalOpen && bookToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบหนังสือ</h3>
              <p className="text-sm text-slate-500 mt-1">
                คุณต้องการลบหนังสือ <span className="font-semibold text-slate-800">"{bookToDelete.book_name || 'ไม่มีชื่อ'}"</span> (ID: {bookToDelete.id}) ใช่หรือไม่?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setDeleteModalOpen(false); setBookToDelete(null); }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteExecute}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
              >
                {loading ? 'กำลังลบ...' : 'ลบข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? `แก้ไขหนังสือ ${editingId}` : 'เพิ่มหนังสือใหม่'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อหนังสือ (book_name)</label>
                <input type="text" required value={formData.book_name} onChange={(e) => setFormData({ ...formData, book_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">ราคาหนังสือ (book_price)</label>
                <input type="text" required value={formData.book_price} onChange={(e) => setFormData({ ...formData, book_price: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">ยกเลิก</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium">
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