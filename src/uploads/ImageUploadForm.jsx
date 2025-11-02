import React, { useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ImageSelector from './ImageSelector'; // แก้ path ให้ถูกต้อง


const ImageUploadForm = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [days, setDays] = useState('');
    const fileInputRef = useRef(null);
    const [showImageSelector, setShowImageSelector] = useState(false);


    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

    const resetForm = () => {
        setFile(null);
        setPreviewUrl('');
        setQuantity('');
        setDays('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        if (!allowedTypes.includes(selected.type)) {
            Swal.fire('⚠️ ไฟล์ไม่รองรับ', 'กรุณาเลือกไฟล์ภาพ: PNG, JPG, JPEG, GIF, WebP', 'warning');
            return resetForm();
        }
        if (selected.size > 25 * 1024 * 1024) {
            Swal.fire('⚠️ ไฟล์ใหญ่เกินไป', 'ขนาดสูงสุดคือ 25MB', 'warning');
            return resetForm();
        }

        setFile(selected);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            Swal.fire('📁 กรุณาเลือกรูปภาพ', '', 'info');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('quantity', quantity || '');
            formData.append('days', days || '');
            const res = await axios.post('/backend-api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000,
            });

            Swal.fire({
                icon: 'success',
                title: '✅ อัปโหลดสำเร็จ',
                text: `ชื่อไฟล์: ${res.data.filename}`,
                timer: 2500,
                showConfirmButton: false,
            });

            resetForm();
        } catch (err) {
            console.error('Upload error:', err);
            let message = '❌ เกิดข้อผิดพลาดในการอัปโหลด';

            if (err.code === 'ECONNABORTED') message = '❌ ใช้เวลานานเกินไป';
            else if (err.response) message = `❌ ล้มเหลว: ${err.response.data.message || 'Server Error'}`;
            else if (err.request) message = '❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';

            Swal.fire('อัปโหลดล้มเหลว', message, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileChange({ target: { files: [dropped] } });
    };

    const inputStyle = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100";

    return (
        <div className='min-h-screen flex justify-center items-center px-4 -mt-10'>
            <div className="max-w-md bg-white rounded-xl shadow-2xl p-6 w-full">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">📁 上传图片</h2>
                <form onSubmit={handleSubmit}>
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-4 transition-colors
                            ${previewUrl ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                                <p className="text-green-600 mt-2 font-medium">📷 {file?.name}</p>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl">📁</div>
                                <p className="text-gray-700">拖放文件或点击选择</p>
                                <p className="text-xs text-gray-400 mt-2">PNG、JPG、GIF、WebP • 最大 25MB</p>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">次数</label>
                            <input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) => { setQuantity(e.target.value); if (e.target.value) setDays(''); }}
                                disabled={days !== ''}
                                className={inputStyle}
                                placeholder="数量"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">天数</label>
                            <input
                                type="number"
                                min="0"
                                value={days}
                                onChange={(e) => { setDays(e.target.value); if (e.target.value) setQuantity(''); }}
                                disabled={quantity !== ''}
                                className={inputStyle}
                                placeholder="天数"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors
                                ${isUploading || !file
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {isUploading ? (
                                <span className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    正在上传...
                                </span>
                            ) : '🚀 上传'}
                        </button>

                        {file && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isUploading}
                                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300"
                            >
                                重置
                            </button>
                        )}
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => setShowImageSelector((prev) => !prev)}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        {showImageSelector ? '🔽 隐藏系统图片' : '🖼️ 查看系统图片'}
                    </button>
                </div>

                {showImageSelector && (
                    <div className="mt-6">
                        <ImageSelector onImageSelect={(image) => {
                            Swal.fire({
                                title: '📸 选中的图片',
                                text: image.filename,
                                imageUrl: `/uploads/${image.filename}`,
                                imageAlt: image.filename,
                                confirmButtonText: '确定'
                            });
                        }} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default ImageUploadForm;
