import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Addlinks() {
  const [title, setTitle] = useState(''); // 标题（title）
  const [url, setUrl] = useState('');     // 链接地址（URL）
  const [links, setLinks] = useState([]); // 链接列表

  const API_BASE = 'http://47.238.3.148/backend-api';

  // 🔹 获取所有链接
  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/links`);
      setLinks(res.data);
    } catch (err) {
      console.error('获取链接时出错:', err);
    }
  };

  // 页面加载时执行
  useEffect(() => {
    fetchLinks();
  }, []);

  // 🔹 提交表单，添加新链接
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/links`, { 
        title_links: title, 
        name_links: url 
      });
      setTitle('');
      setUrl('');
      fetchLinks();
    } catch (err) {
      console.error('添加链接出错:', err);
    }
  };

  // 🔹 删除链接
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此链接吗？')) return;
    try {
      await axios.delete(`${API_BASE}/links/${id}`);
      fetchLinks();
    } catch (err) {
      console.error(err);
      alert('无法删除链接');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">📎 链接管理</h1>

        {/* 添加链接表单 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="标题 (title)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="链接地址 (URL)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
          >
            ➕ 保存链接
          </button>
        </form>

        {/* 链接列表 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">所有链接列表</h2>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2">标题</th>
                <th className="text-left px-4 py-2">链接</th>
                <th className="text-center px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    暂无链接数据
                  </td>
                </tr>
              ) : (
                links.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{l.title_links}</td>
                    <td className="px-4 py-2 text-blue-600 underline">
                      <a href={l.name_links} target="_blank" rel="noreferrer">
                        {l.name_links}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Addlinks;
