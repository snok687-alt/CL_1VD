import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Addlinks() {
  const [title, setTitle] = useState(''); // 标题（title）
  const [url, setUrl] = useState('');     // 链接地址（URL）
  const [links, setLinks] = useState([]); // 链接列表
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const API_BASE = 'http://47.238.3.148/backend-api';

  // 🔹 获取所有链接
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/links`);
      setLinks(res.data);
    } catch (err) {
      console.error('获取链接时出错:', err);
      alert('获取链接失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时执行
  useEffect(() => {
    fetchLinks();
  }, []);

  // 🔹 提交表单，添加新链接
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('请填写标题和链接地址');
      return;
    }

    try {
      await axios.post(`${API_BASE}/links`, { 
        title_links: title.trim(), 
        name_links: url.trim() 
      });
      setTitle('');
      setUrl('');
      fetchLinks();
      alert('链接添加成功！');
    } catch (err) {
      console.error('添加链接出错:', err);
      alert('添加链接失败，请重试');
    }
  };

  // 🔹 删除链接
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此链接吗？')) return;
    try {
      await axios.delete(`${API_BASE}/links/${id}`);
      fetchLinks();
      alert('链接删除成功！');
    } catch (err) {
      console.error(err);
      alert('无法删除链接');
    }
  };

  // 🔹 开始编辑
  const handleEdit = (link) => {
    setEditingId(link.id);
    setEditTitle(link.title_links);
    setEditUrl(link.name_links);
  };

  // 🔹 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditUrl('');
  };

  // 🔹 保存编辑
  const handleSaveEdit = async (id) => {
    if (!editTitle.trim() || !editUrl.trim()) {
      alert('请填写标题和链接地址');
      return;
    }

    try {
      await axios.put(`${API_BASE}/links/${id}`, {
        title_links: editTitle.trim(),
        name_links: editUrl.trim()
      });
      setEditingId(null);
      setEditTitle('');
      setEditUrl('');
      fetchLinks();
      alert('链接更新成功！');
    } catch (err) {
      console.error('更新链接出错:', err);
      alert('更新链接失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            📎 链接管理系统
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            管理您的网站链接，支持添加、编辑和删除操作
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 添加链接表单 - 左侧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 sticky top-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                添加新链接
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标题 *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
                    placeholder="输入链接标题..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    链接地址 *
                  </label>
                  <input
                    type="url"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加链接
                  </span>
                </button>
              </form>

              {/* 统计信息 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{links.length}</div>
                    <div className="text-sm text-blue-500">总链接数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {links.filter(link => link.name_links?.startsWith('https')).length}
                    </div>
                    <div className="text-sm text-green-500">HTTPS链接</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 链接列表 - 右侧 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-0 flex items-center">
                    <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
                    链接列表
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={fetchLinks}
                      disabled={loading}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <svg className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      刷新
                    </button>
                    <span className="text-sm text-gray-500">
                      {loading ? '加载中...' : `${links.length} 个链接`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="w-full hidden md:table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        标题
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        链接地址
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {links.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <p className="text-lg font-medium text-gray-400">暂无链接数据</p>
                            <p className="text-sm text-gray-500 mt-1">点击上方表单添加第一个链接</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      links.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingId === link.id ? (
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{link.title_links}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === link.id ? (
                              <input
                                type="url"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                              />
                            ) : (
                              <a
                                href={link.name_links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                              >
                                {link.name_links}
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {editingId === link.id ? (
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleSaveEdit(link.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(link)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleDelete(link.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                >
                                  删除
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden">
                  {links.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="text-lg font-medium text-gray-400">暂无链接数据</p>
                      <p className="text-sm text-gray-500 mt-1">点击上方表单添加第一个链接</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {links.map((link) => (
                        <div key={link.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          {editingId === link.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">链接地址</label>
                                <input
                                  type="url"
                                  value={editUrl}
                                  onChange={(e) => setEditUrl(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                              </div>
                              <div className="flex space-x-2 pt-2">
                                <button
                                  onClick={() => handleSaveEdit(link.id)}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm transition-colors"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-900 text-lg">{link.title_links}</h3>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(link)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(link.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <a
                                href={link.name_links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline text-sm break-all block"
                              >
                                {link.name_links}
                              </a>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">加载中...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Addlinks;