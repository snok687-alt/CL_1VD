// components/ApiTester.jsx
import React, { useState } from 'react';

const ApiTester = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // ใช้ local proxy ผ่าน Vite
  const API_URL = '/api';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setAnalysis(null);

    try {
      console.log('Fetching from:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      setData(result);
      analyzeData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = (apiData) => {
    if (!apiData) return;

    const analysisResult = {
      totalFields: 0,
      fieldsWithData: 0,
      fieldsWithoutData: 0,
      fieldDetails: [],
      sampleItem: null,
      dataStructure: {},
      apiInfo: {}
    };

    // เก็บข้อมูล API structure
    analysisResult.apiInfo = {
      hasList: !!apiData.list,
      hasClass: !!apiData.class,
      hasPage: !!apiData.page,
      hasTotal: !!apiData.total,
      hasLimit: !!apiData.limit,
      hasPageCount: !!apiData.pagecount
    };

    // ตรวจสอบโครงสร้างข้อมูลหลัก
    if (apiData.list && Array.isArray(apiData.list) && apiData.list.length > 0) {
      analysisResult.sampleItem = apiData.list[0];
      
      // วิเคราะห์ฟิลด์ในรายการแรก
      const sample = apiData.list[0];
      const fields = Object.keys(sample);
      
      analysisResult.totalFields = fields.length;
      
      fields.forEach(field => {
        const value = sample[field];
        const hasData = value !== null && value !== undefined && value !== '';
        const dataType = typeof value;
        const isEmptyArray = Array.isArray(value) && value.length === 0;
        const isEmptyObject = typeof value === 'object' && value !== null && Object.keys(value).length === 0;
        
        const actualHasData = hasData && !isEmptyArray && !isEmptyObject;
        
        analysisResult.fieldDetails.push({
          fieldName: field,
          hasData: actualHasData,
          dataType: dataType,
          value: value,
          isEmptyArray,
          isEmptyObject,
          valuePreview: String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '')
        });

        if (actualHasData) {
          analysisResult.fieldsWithData++;
        } else {
          analysisResult.fieldsWithoutData++;
        }
      });

      // วิเคราะห์โครงสร้างโดยรวม
      analysisResult.dataStructure = {
        totalItems: apiData.list.length,
        hasClass: !!apiData.class,
        classCount: apiData.class ? apiData.class.length : 0,
        classSample: apiData.class ? apiData.class.slice(0, 3) : null, // แสดงตัวอย่าง 3 รายการ
        hasPage: !!apiData.page,
        page: apiData.page || 'N/A',
        hasPageCount: !!apiData.pagecount,
        pagecount: apiData.pagecount || 'N/A',
        hasTotal: !!apiData.total,
        total: apiData.total || 'N/A',
        hasLimit: !!apiData.limit,
        limit: apiData.limit || 'N/A'
      };
    }

    setAnalysis(analysisResult);
  };

  const getValuePreview = (value) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (value === '') return '"" (empty string)';
    if (Array.isArray(value)) return `Array[${value.length}]`;
    if (typeof value === 'object') return `Object{${Object.keys(value).length} keys}`;
    return String(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          API Data Structure Tester
        </h1>
        <div className="space-y-2">
          <p className="text-gray-600">
            Testing: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://api.bwzyz.com/api.php/provide/vod/at/json/</code>
          </p>
          <p className="text-sm text-green-600">
            Using Vite Proxy: <code className="bg-green-100 px-2 py-1 rounded">/api</code>
          </p>
        </div>
      </div>

      {/* Fetch Button */}
      <div className="text-center mb-8">
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
              Loading API Data...
            </>
          ) : (
            'Fetch & Analyze Data'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Structure Info */}
      {analysis?.apiInfo && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">API Structure</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {Object.entries(analysis.apiInfo).map(([key, value]) => (
                <div key={key} className={`px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                  key.includes('has') ? (value ? 'bg-green-50' : 'bg-yellow-50') : 'bg-gray-50'
                }`}>
                  <dt className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {typeof value === 'boolean' ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {value ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      String(value)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Fields</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{analysis.totalFields}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Fields with Data</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{analysis.fieldsWithData}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Empty Fields</dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-600">{analysis.fieldsWithoutData}</dd>
              </div>
            </div>
          </div>

          {/* Data Structure Overview */}
          {analysis.dataStructure && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Data Structure Overview</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  {Object.entries(analysis.dataStructure).map(([key, value]) => (
                    <div key={key} className={`px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                      key.includes('has') ? (value ? 'bg-green-50' : 'bg-yellow-50') : 
                      key.includes('Count') || key.includes('total') ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {typeof value === 'boolean' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {value ? 'Yes' : 'No'}
                          </span>
                        ) : Array.isArray(value) ? (
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500">Sample items:</span>
                            <div className="flex flex-wrap gap-1">
                              {value.map((item, idx) => (
                                <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs">
                                  {JSON.stringify(item)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          String(value)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Field Analysis */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Field Analysis ({analysis.fieldDetails.length} fields)
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Detailed analysis of each field in the data structure
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {analysis.fieldDetails.map((field, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      field.hasData 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 text-sm font-mono">{field.fieldName}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        field.hasData 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {field.hasData ? 'Has Data' : 'No Data'}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Type:</span>
                        <code className="text-gray-700 bg-gray-100 px-2 py-1 rounded font-mono">
                          {field.dataType}
                          {field.isEmptyArray && ' (empty array)'}
                          {field.isEmptyObject && ' (empty object)'}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Value Preview:</span>
                        <code className="text-gray-700 bg-gray-100 p-2 rounded font-mono text-xs block break-all">
                          {getValuePreview(field.value)}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sample Data */}
          {analysis.sampleItem && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Sample Data (First Item)</h3>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {JSON.stringify(analysis.sampleItem, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Raw Response */}
      {data && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Complete API Response</h3>
            <button
              onClick={() => setData(null)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hide Raw Data
            </button>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
       
      )}
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Debug Info</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>API URL: {API_URL}</div>
            <div>Full URL: http://localhost:3000{API_URL}</div>
            <div>Proxy Target: https://api.bwzyz.com/api.php/provide/vod/at/json</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTester;