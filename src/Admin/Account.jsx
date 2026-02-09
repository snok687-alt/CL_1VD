import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Save, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-';
const formatCNY = (n) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

export default function Account() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(null);
    const [page, setPage] = useState(1);
    const perPage = 10;
    const nav = useNavigate();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await axios.get('/backend-api/account/users');
        if (data.success) setUsers(data.users);
        setLoading(false);
    };

    const saveEdit = async () => {
        await axios.put(`/backend-api/account/users/${edit.id}`, edit);
        setEdit(null);
        fetchUsers();
    };

    const del = async (id) => {
        if (!confirm('删除用户?')) return;
        await axios.delete(`/backend-api/account/users/${id}`);
        fetchUsers();
    };

    const start = (page - 1) * perPage;
    const data = users.slice(start, start + perPage);
    const total = Math.ceil(users.length / perPage);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <button onClick={() => nav('/Admin')} className="mb-4 px-3 py-2 bg-white border rounded">
                ← 返回
            </button>

            <h2 className="text-2xl font-bold mb-4">👤 用户列表 ({users.length})</h2>

            {/* ✅ Mobile Card View */}
            <div className="grid gap-4 md:hidden">
                {data.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between">
                            <b>{u.username}</b>
                            <span className="text-green-600 font-bold">{formatCNY(u.amount_gift)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            登录: {formatDate(u.last_login)}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button onClick={() => setEdit(u)} className="text-blue-600">编辑</button>
                            <button onClick={() => del(u.id)} className="text-red-600">删除</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ Desktop Table View */}
            <div className="hidden md:block bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">用户名</th>
                            <th className="p-2 text-right">金额</th>
                            <th className="p-2">最后登录</th>
                            <th className="p-2 text-center">操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map(u => (
                            <tr key={u.id} className="border-t hover:bg-gray-50">
                                <td className="p-2">{u.id}</td>

                                <td className="p-2">
                                    {edit?.id === u.id ? (
                                        <input
                                            className="border px-2 py-1 rounded w-full"
                                            value={edit.username}
                                            onChange={e => setEdit({ ...edit, username: e.target.value })}
                                        />
                                    ) : u.username}
                                </td>

                                <td className="p-2 text-right">
                                    {edit?.id === u.id ? (
                                        <input
                                            type="number"
                                            className="border px-2 py-1 rounded w-full text-right"
                                            value={edit.amount_gift}
                                            onChange={e => setEdit({ ...edit, amount_gift: e.target.value })}
                                        />
                                    ) : formatCNY(u.amount_gift)}
                                </td>

                                <td className="p-2">{formatDate(u.last_login)}</td>

                                {/* ✅ Action Buttons */}
                                <td className="p-2 text-center">
                                    {edit?.id === u.id ? (
                                        <>
                                            <button onClick={saveEdit} className="text-green-600 mr-2">保存</button>
                                            <button onClick={() => setEdit(null)} className="text-gray-500">取消</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setEdit(u)} className="text-blue-600 mr-2">编辑</button>
                                            <button onClick={() => del(u.id)} className="text-red-600">删除</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>◀</button>
                <span>{page}/{total}</span>
                <button disabled={page === total} onClick={() => setPage(p => p + 1)}>▶</button>
            </div>
        </div>
    );
}
