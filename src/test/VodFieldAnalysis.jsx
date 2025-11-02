// components/VodFieldAnalysis.jsx
import React, { useState, useEffect } from 'react';

const VodFieldAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldAnalysis, setFieldAnalysis] = useState(null);

  const API_URL = '/api';

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      analyzeFields(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeFields = (apiData) => {
    if (!apiData?.list || !Array.isArray(apiData.list)) return;

    const analysis = {
      vodId: { values: new Set(), sample: [], dataType: 'unknown', uniqueCount: 0 },
      vodName: { values: new Set(), sample: [], dataType: 'unknown', uniqueCount: 0 },
      typeId: { values: new Set(), sample: [], dataType: 'unknown', uniqueCount: 0 },
      typeName: { values: new Set(), sample: [], dataType: 'unknown', uniqueCount: 0 },
      relationships: [],
      summary: {}
    };

    // วิเคราะห์แต่ละรายการ
    apiData.list.forEach((item, index) => {
      // วิเคราะห์ vod_id
      if (item.vod_id !== undefined) {
        analysis.vodId.values.add(item.vod_id);
        if (analysis.vodId.sample.length < 5) {
          analysis.vodId.sample.push(item.vod_id);
        }
        analysis.vodId.dataType = typeof item.vod_id;
      }

      // วิเคราะห์ vod_name
      if (item.vod_name !== undefined) {
        analysis.vodName.values.add(item.vod_name);
        if (analysis.vodName.sample.length < 5) {
          analysis.vodName.sample.push(item.vod_name);
        }
        analysis.vodName.dataType = typeof item.vod_name;
      }

      // วิเคราะห์ type_id
      if (item.type_id !== undefined) {
        analysis.typeId.values.add(item.type_id);
        if (analysis.typeId.sample.length < 5) {
          analysis.typeId.sample.push(item.type_id);
        }
        analysis.typeId.dataType = typeof item.type_id;
      }

      // วิเคราะห์ type_name
      if (item.type_name !== undefined) {
        analysis.typeName.values.add(item.type_name);
        if (analysis.typeName.sample.length < 5) {
          analysis.typeName.sample.push(item.type_name);
        }
        analysis.typeName.dataType = typeof item.type_name;
      }

      // เก็บความสัมพันธ์
      if (item.type_id !== undefined && item.type_name !== undefined) {
        analysis.relationships.push({
          type_id: item.type_id,
          type_name: item.type_name,
          vod_id: item.vod_id,
          vod_name: item.vod_name
        });
      }
    });

    // คำนวณจำนวน unique values
    analysis.vodId.uniqueCount = analysis.vodId.values.size;
    analysis.vodName.uniqueCount = analysis.vodName.values.size;
    analysis.typeId.uniqueCount = analysis.typeId.values.size;
    analysis.typeName.uniqueCount = analysis.typeName.values.size;

    // สรุปความสัมพันธ์
    analysis.summary = {
      totalItems: apiData.list.length,
      uniqueVodIds: analysis.vodId.uniqueCount,
      uniqueVodNames: analysis.vodName.uniqueCount,
      uniqueTypeIds: analysis.typeId.uniqueCount,
      uniqueTypeNames: analysis.typeName.uniqueCount,
      hasOneToOneMapping: analysis.typeId.uniqueCount === analysis.typeName.uniqueCount
    };

    setFieldAnalysis(analysis);
  };

  const getRelationshipMap = () => {
    if (!fieldAnalysis) return [];
    
    const typeMap = new Map();
    fieldAnalysis.relationships.forEach(rel => {
      if (!typeMap.has(rel.type_id)) {
        typeMap.set(rel.type_id, {
          type_id: rel.type_id,
          type_name: rel.type_name,
          vod_count: 0,
          sample_vods: []
        });
      }
      const typeInfo = typeMap.get(rel.type_id);
      typeInfo.vod_count++;
      if (typeInfo.sample_vods.length < 3) {
        typeInfo.sample_vods.push({
          vod_id: rel.vod_id,
          vod_name: rel.vod_name
        });
      }
    });

    return Array.from(typeMap.values());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          VOD Field Analysis
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          วิเคราะห์ความแตกต่างระหว่าง <code className="bg-blue-100 px-2 py-1 rounded">vod_id</code>, 
          <code className="bg-green-100 px-2 py-1 rounded">vod_name</code>, 
          <code className="bg-yellow-100 px-2 py-1 rounded">type_id</code>, และ 
          <code className="bg-purple-100 px-2 py-1 rounded">type_name</code>
        </p>
        
        <button
          onClick={fetchData}
          disabled={loading}
          className={`
            inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white shadow-sm
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังโหลดข้อมูล...
            </>
          ) : (
            'เริ่มการวิเคราะห์'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {fieldAnalysis && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">vod_id</dt>
                <dd className="mt-1 text-2xl font-semibold text-blue-600">{fieldAnalysis.summary.uniqueVodIds}</dd>
                <dd className="text-sm text-gray-500">Unique values</dd>
                <dd className="text-xs text-gray-400 mt-1">Data type: {fieldAnalysis.vodId.dataType}</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">vod_name</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-600">{fieldAnalysis.summary.uniqueVodNames}</dd>
                <dd className="text-sm text-gray-500">Unique values</dd>
                <dd className="text-xs text-gray-400 mt-1">Data type: {fieldAnalysis.vodName.dataType}</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">type_id</dt>
                <dd className="mt-1 text-2xl font-semibold text-yellow-600">{fieldAnalysis.summary.uniqueTypeIds}</dd>
                <dd className="text-sm text-gray-500">Unique values</dd>
                <dd className="text-xs text-gray-400 mt-1">Data type: {fieldAnalysis.typeId.dataType}</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">type_name</dt>
                <dd className="mt-1 text-2xl font-semibold text-purple-600">{fieldAnalysis.summary.uniqueTypeNames}</dd>
                <dd className="text-sm text-gray-500">Unique values</dd>
                <dd className="text-xs text-gray-400 mt-1">Data type: {fieldAnalysis.typeName.dataType}</dd>
              </div>
            </div>
          </div>

          {/* Field Comparison */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">ความแตกต่างของฟิลด์หลัก</h3>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ฟิลด์</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน้าที่</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทข้อมูล</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตัวอย่างค่า</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน Unique</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">vod_id</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>รหัสประจำตัวของวิดีโอ</div>
                        <div className="text-gray-500 text-xs">Primary Key</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fieldAnalysis.vodId.dataType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {fieldAnalysis.vodId.sample.map((value, idx) => (
                            <code key={idx} className="block bg-gray-100 px-2 py-1 rounded text-xs">
                              {String(value)}
                            </code>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fieldAnalysis.vodId.uniqueCount}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-green-600 bg-green-50 px-2 py-1 rounded text-sm">vod_name</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>ชื่อเรื่องของวิดีโอ</div>
                        <div className="text-gray-500 text-xs">Display Name</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fieldAnalysis.vodName.dataType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {fieldAnalysis.vodName.sample.map((value, idx) => (
                            <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs truncate">
                              {String(value)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fieldAnalysis.vodName.uniqueCount}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm">type_id</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>รหัสประเภท/หมวดหมู่</div>
                        <div className="text-gray-500 text-xs">Foreign Key</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fieldAnalysis.typeId.dataType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {fieldAnalysis.typeId.sample.map((value, idx) => (
                            <code key={idx} className="block bg-gray-100 px-2 py-1 rounded text-xs">
                              {String(value)}
                            </code>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fieldAnalysis.typeId.uniqueCount}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-sm">type_name</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>ชื่อประเภท/หมวดหมู่</div>
                        <div className="text-gray-500 text-xs">Category Name</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fieldAnalysis.typeName.dataType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {fieldAnalysis.typeName.sample.map((value, idx) => (
                            <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {String(value)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fieldAnalysis.typeName.uniqueCount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Relationship Analysis */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">ความสัมพันธ์ระหว่าง Type และ VOD</h3>
              <p className="mt-1 text-sm text-gray-500">
                วิเคราะห์การจับคู่ระหว่าง type_id และ type_name
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">type_id</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">type_name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน VOD</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตัวอย่าง VOD</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getRelationshipMap().map((type, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <code className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                            {type.type_id}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <code className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                            {type.type_name}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {type.vod_count} วิดีโอ
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            {type.sample_vods.map((vod, idx) => (
                              <div key={idx} className="text-xs">
                                <code className="bg-gray-100 px-1 rounded">{vod.vod_id}</code>
                                <span className="ml-1 truncate">{vod.vod_name}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">สรุปผลการวิเคราะห์</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                    fieldAnalysis.summary.uniqueVodIds === fieldAnalysis.summary.totalItems 
                      ? 'bg-green-400' 
                      : 'bg-yellow-400'
                  }`}></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">vod_id เป็น Unique</p>
                    <p className="text-sm text-gray-500">
                      {fieldAnalysis.summary.uniqueVodIds === fieldAnalysis.summary.totalItems 
                        ? '✓ ทุก vod_id มีค่าไม่ซ้ำกัน (เป็น Primary Key ที่ดี)'
                        : `⚠ มี vod_id ซ้ำกัน ${fieldAnalysis.summary.totalItems - fieldAnalysis.summary.uniqueVodIds} รายการ`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                    fieldAnalysis.summary.uniqueTypeIds === fieldAnalysis.summary.uniqueTypeNames 
                      ? 'bg-green-400' 
                      : 'bg-red-400'
                  }`}></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">ความสัมพันธ์ type_id และ type_name</p>
                    <p className="text-sm text-gray-500">
                      {fieldAnalysis.summary.uniqueTypeIds === fieldAnalysis.summary.uniqueTypeNames 
                        ? '✓ type_id และ type_name มีการจับคู่ 1:1 สมบูรณ์'
                        : `⚠ type_id และ type_name ไม่มีการจับคู่ 1:1 (อาจมีข้อมูลไม่สมบูรณ์)`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-400"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">โครงสร้างข้อมูล</p>
                    <p className="text-sm text-gray-500">
                      ระบบใช้โครงสร้างแบบ Relational Database โดยมี vod_id เป็น Primary Key และ type_id เป็น Foreign Key
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VodFieldAnalysis;