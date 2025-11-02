import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ImageSelector = ({ onImageSelect, isDarkMode }) => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchImages = async () => {
        try {
            const res = await axios.get('/backend-api/images', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                }
            });
            setImages(res.data);
            console.log("✅ Images loaded:", res.data.length);
        } catch (err) {
            console.error('❌ Error fetching images:', err);
            Swal.fire('Error', 'ไม่สามารถโหลดรูปภาพได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages(); // โหลดครั้งแรก

        const interval = setInterval(() => {
            fetchImages(); // โหลดใหม่ทุก 5 วินาที
        }, 5000); // 5000ms = 5 วินาที

        return () => clearInterval(interval); // cleanup timer เมื่อ unmount
    }, []);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        if (onImageSelect) {
            onImageSelect(image);
        }
    };

    if (loading) {
        return (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="animate-pulse space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex space-x-3">
                            <div className="bg-gray-300 h-20 w-20 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="bg-gray-300 h-4 rounded"></div>
                                <div className="bg-gray-300 h-3 rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-lg max-h-96 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">选择系统图片</h3>

            {images.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">系统中没有可用的图片</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            onClick={() => handleImageClick(image)}
                            className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${selectedImage?.id === image.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            <img
                                src={`/uploads/images/${image.filename}`}
                                alt={image.filename}
                                className="w-full h-auto object-cover rounded"
                            />
                            <p className="text-xs mt-1 truncate">{image.filename}</p>
                            {image.quantity && (
                                <p className="text-xs text-gray-600">次数: {image.quantity}</p>
                            )}
                            {image.days && (
                                <p className="text-xs text-gray-600">天数: {image.days}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                {new Date(image.upload_date).toLocaleDateString('th-TH')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageSelector;
