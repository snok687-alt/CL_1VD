import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Save, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 辅助函数，用于格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return dateString;
    }
};

// 格式化วันที่สำหรับหน้าจอขนาดเล็ก
const formatShortDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
        });
    } catch (e) {
        return dateString;
    }
};

function Account() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editAmount, setEditAmount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        
        // ติดตามการเปลี่ยนแปลงขนาดหน้าจอ
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/backend-api/account/users');
            if (res.data.success) setUsers(res.data.users);
        } catch (err) {
            console.error("Error fetching users:", err);
            alert('获取用户列表失败，请检查网络或稍后重试。');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('🚨 确定要永久删除此用户吗？此操作不可撤销！')) return;
        try {
            await axios.delete(`/backend-api/account/users/${id}`);
            fetchUsers();
            alert('✅ 用户删除成功！');
        } catch (err) {
            console.error(err);
            alert('❌ 删除操作失败，请重试。');
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditUsername(user.username);
        setEditAmount(user.amount_gift);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditUsername('');
        setEditAmount(0);
    };

    const handleSaveEdit = async (id) => {
        if (!editUsername.trim() || isNaN(parseInt(editAmount))) {
            alert('用户名不能为空，且打赏金额必须为有效数字！');
            return;
        }
        try {
            await axios.put(`/backend-api/account/users/${id}`, {
                username: editUsername,
                amount_gift: parseInt(editAmount)
            });
            setEditingId(null);
            fetchUsers();
            alert('👍 用户信息更新成功！');
        } catch (err) {
            console.error(err);
            alert('❌ 更新用户信息失败，请重试。');
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // ตรวจสอบขนาดหน้าจอเพื่อแสดงข้อมูลที่เหมาะสม
    const isSmallScreen = windowWidth < 640;
    const isMediumScreen = windowWidth < 768;
    const isLargeScreen = windowWidth >= 1024;

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen text-blue-500">
            <Loader2 className="animate-spin mr-3 h-8 w-8" />
            <span className="text-xl font-medium">数据加载中...</span>
        </div>
    );

    if (users.length === 0 && !loading) return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="max-w-md w-full p-8 text-center bg-white rounded-xl shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">暂无用户数据 🙁</h3>
                <p className="text-gray-500 mb-6">请检查后端服务是否正常运行或是否有数据。</p>
                <button
                    onClick={fetchUsers}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    重新加载
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 min-h-screen bg-gray-100">
            <div className="max-w-full mx-auto">
                <div className="mb-6 md:mb-8">
                                <button 
              onClick={() => navigate('/CL_____________________________________________________________________________________******_/Admin')}
              className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-50`}
            >
              <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回
            </button>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
                        👤 用户账户列表
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        共有 <span className="font-bold text-indigo-600">{users.length}</span> 名用户
                    </p>
                </div>

                {/* สำหรับหน้าจอขนาดเล็ก: แสดงข้อมูลแบบการ์ด */}
                {isSmallScreen ? (
                    <div className="space-y-4">
                        {currentUsers.map(user => (
                            <div key={user.id} className="bg-white rounded-xl shadow-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center mb-1">
                                            <span className="text-xs text-gray-500 mr-2">ID:</span>
                                            <span className="font-bold text-gray-800">{user.id}</span>
                                        </div>
                                        {editingId === user.id ? (
                                            <input
                                                type="text"
                                                value={editUsername}
                                                onChange={(e) => setEditUsername(e.target.value)}
                                                className="border border-indigo-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full mb-2"
                                                placeholder="用户名"
                                            />
                                        ) : (
                                            <h3 className="text-lg font-bold text-gray-800 truncate">{user.username}</h3>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="border border-indigo-300 rounded-lg px-3 py-2 text-right focus:ring-2 focus:ring-indigo-500 outline-none w-24"
                                            />
                                        ) : (
                                            <div className="text-green-700 font-bold text-lg">
                                                ${user.amount_gift.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">打赏金额</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                    <div>
                                        <div className="text-gray-500 text-xs">最后领取</div>
                                        <div className="font-medium">{formatShortDate(user.last_claim_date)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">最后登录</div>
                                        <div className="font-medium">{formatShortDate(user.last_login)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-gray-500 text-xs">创建时间</div>
                                        <div className="font-medium">{formatShortDate(user.created_at)}</div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                                    {editingId === user.id ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveEdit(user.id)}
                                                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition"
                                            >
                                                <Save className="h-4 w-4 mr-1" /> 保存
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" /> 取消
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                                            >
                                                <Pencil className="h-4 w-4 mr-1" /> 编辑
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" /> 删除
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* สำหรับหน้าจอขนาดกลางขึ้นไป: แสดงตาราง */
                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-indigo-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">用户名</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">打赏金额</th>
                                        {!isMediumScreen && (
                                            <>
                                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">最后领取日期</th>
                                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">最后登录</th>
                                            </>
                                        )}
                                        {isLargeScreen && (
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">创建时间</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition duration-100">
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                            <td className="px-3 py-4 text-sm text-gray-700 max-w-[150px] md:max-w-xs lg:max-w-sm truncate">
                                                {editingId === user.id ? (
                                                    <input
                                                        type="text"
                                                        value={editUsername}
                                                        onChange={(e) => setEditUsername(e.target.value)}
                                                        className="border border-indigo-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                                    />
                                                ) : (
                                                    <span className="font-semibold truncate">{user.username}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                                {editingId === user.id ? (
                                                    <input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(e.target.value)}
                                                        className="border border-indigo-300 rounded-lg px-3 py-1.5 text-right focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[120px] ml-auto"
                                                    />
                                                ) : (
                                                    <span className="font-mono font-bold text-green-700">${user.amount_gift.toLocaleString()}</span>
                                                )}
                                            </td>
                                            {!isMediumScreen && (
                                                <>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(user.last_claim_date)}
                                                    </td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(user.last_login)}
                                                    </td>
                                                </>
                                            )}
                                            {isLargeScreen && (
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(user.created_at)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {users.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 p-4 bg-white rounded-xl shadow-lg">
                        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                            显示第 <span className="font-bold">{indexOfFirstItem + 1}</span> 到{" "}
                            <span className="font-bold">
                                {Math.min(indexOfLastItem, users.length)}
                            </span>{" "}
                            条，共 <span className="font-bold">{users.length}</span> 条
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 rounded-lg ${currentPage === 1 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                上一页
                            </button>
                            <div className="flex items-center">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 mx-1 rounded-lg ${currentPage === pageNum 
                                                ? 'bg-indigo-600 text-white' 
                                                : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 rounded-lg ${currentPage === totalPages 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                            >
                                下一页
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Account;