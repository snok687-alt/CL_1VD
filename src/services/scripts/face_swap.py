import cv2
import numpy as np
import sys
import os
import logging
from time import time
import requests

# ตั้งค่า logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] [%(levelname)s] %(message)s', datefmt='%H:%M:%S')
logger = logging.getLogger(__name__)

# --- Configuration ---
FACE_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
FRAME_SKIP = 8  # เพิ่มจาก 2 เป็น 8 เพื่อความเร็ว
MAX_PROCESSING_TIME = 55  # วินาที - หยุดถ้าเกิน 55 วินาที

def download_dnn_model():
    """ดาวน์โหลด DNN model ถ้ายังไม่มี"""
    prototxt_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
    model_url = "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000_fp16.caffemodel"
    
    prototxt_path = "deploy.prototxt"
    model_path = "res10_300x300_ssd_iter_140000_fp16.caffemodel"
    
    if not os.path.exists(prototxt_path):
        logger.info("Downloading prototxt...")
        response = requests.get(prototxt_url)
        with open(prototxt_path, 'wb') as f:
            f.write(response.content)
    
    if not os.path.exists(model_path):
        logger.info("Downloading model...")
        response = requests.get(model_url)
        with open(model_path, 'wb') as f:
            f.write(response.content)
    
    return prototxt_path, model_path

def load_face_detector():
    """โหลด face detector ที่เร็วที่สุดที่ใช้ได้"""
    try:
        prototxt_path, model_path = download_dnn_model()
        net = cv2.dnn.readNetFromCaffe(prototxt_path, model_path)
        logger.info("Using DNN Face Detector (Fast)")
        return {'type': 'dnn', 'net': net}
    except Exception as e:
        logger.warning(f"DNN failed, using Haar Cascade: {e}")
        cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)
        return {'type': 'haar', 'cascade': cascade}

def detect_faces_fast(image, detector):
    """ตรวจจับใบหน้าแบบเร็ว"""
    try:
        if detector['type'] == 'dnn':
            # DNN Detection - เร็วและแม่นยำ
            (h, w) = image.shape[:2]
            blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, 
                                       (300, 300), (104.0, 177.0, 123.0))
            detector['net'].setInput(blob)
            detections = detector['net'].forward()
            
            faces = []
            for i in range(0, detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > 0.7:  # Confidence threshold สูงเพื่อความแม่นยำ
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")
                    faces.append((startX, startY, endX-startX, endY-startY))
            
            return faces
        else:
            # Haar Cascade Fallback
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = detector['cascade'].detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(50, 50)  # ขนาดขั้นต่ำใหญ่ขึ้นเพื่อความเร็ว
            )
            return faces
    except Exception as e:
        logger.error(f"Face detection failed: {e}")
        return []

def resize_for_processing(frame, scale=0.6):
    """ลดความละเอียดเฟรมชั่วคราวเพื่อเพิ่มความเร็ว"""
    if scale == 1.0:
        return frame
    
    height, width = frame.shape[:2]
    new_width = int(width * scale)
    new_height = int(height * scale)
    
    return cv2.resize(frame, (new_width, new_height))

def upscale_coordinates(x, y, w, h, original_shape, processed_shape):
    """ปรับพิกัดกลับไปขนาดเดิมหลังจากลดความละเอียด"""
    orig_h, orig_w = original_shape[:2]
    proc_h, proc_w = processed_shape[:2]
    
    scale_x = orig_w / proc_w
    scale_y = orig_h / proc_h
    
    return (
        int(x * scale_x),
        int(y * scale_y),
        int(w * scale_x),
        int(h * scale_y)
    )

def fast_face_swap(source_face, target_frame, detector):
    """แปลงหน้าแบบเร็ว"""
    try:
        # บันทึก shape เดิมสำหรับการ upscale
        original_shape = target_frame.shape
        
        # ลดความละเอียดชั่วคราว (60% ของขนาดเดิม)
        processed_frame = resize_for_processing(target_frame, 0.6)
        processed_shape = processed_frame.shape
        
        # ตรวจจับใบหน้าในเฟรมที่ลดความละเอียดแล้ว
        faces = detect_faces_fast(processed_frame, detector)
        if not faces:
            return target_frame
        
        # ใช้ใบหน้าแรกที่พบ
        x, y, w, h = faces[0]
        
        # ปรับขนาด source face ให้เท่ากับใบหน้าในเฟรมที่ลดความละเอียด
        resized_face = cv2.resize(source_face, (w, h))
        
        # สร้าง mask
        mask = 255 * np.ones(resized_face.shape, resized_face.dtype)
        
        # คำนวณจุดศูนย์กลาง
        center_x = int(x + w / 2)
        center_y = int(y + h / 2)
        center = (center_x, center_y)
        
        # ทำ face swap บนเฟรมที่ลดความละเอียด
        result_processed = cv2.seamlessClone(resized_face, processed_frame, mask, center, cv2.NORMAL_CLONE)
        
        # ปรับขนาดกลับเป็นขนาดเดิม
        result_frame = cv2.resize(result_processed, (original_shape[1], original_shape[0]))
        
        return result_frame
        
    except Exception as e:
        logger.warning(f"Fast swap failed: {e}")
        return target_frame

def optimize_video_settings(input_path):
    """ปรับแต่งการตั้งค่าตามลักษณะวิดีโอ"""
    cap = cv2.VideoCapture(input_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    cap.release()
    
    # ปรับ FRAME_SKIP ตามความยาววิดีโอ
    global FRAME_SKIP
    if duration > 120:  # มากกว่า 2 นาที
        FRAME_SKIP = 15
    elif duration > 60:  # มากกว่า 1 นาที
        FRAME_SKIP = 10
    else:
        FRAME_SKIP = 8
    
    logger.info(f"Video duration: {duration:.1f}s, Using FRAME_SKIP: {FRAME_SKIP}")

def main_swap(image_path, video_path, output_path):
    """ฟังก์ชันหลักแบบเร็ว"""
    start_time = time()
    logger.info("====================================")
    logger.info("=== FAST Face Swap Started ===")
    logger.info(f"Source: {image_path}")
    logger.info(f"Target: {video_path}")
    logger.info(f"Output: {output_path}")
    logger.info("====================================")
    
    # ตรวจสอบไฟล์
    for file_path in [image_path, video_path]:
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return False
    
    # ปรับแต่งการตั้งค่าตามวิดีโอ
    optimize_video_settings(video_path)
    
    # โหลด detector
    detector = load_face_detector()
    
    # โหลดและเตรียม source face
    source_img = cv2.imread(image_path)
    if source_img is None:
        logger.error("Failed to load source image")
        return False
    
    # หาใบหน้าใน source image
    source_faces = detect_faces_fast(source_img, detector)
    if source_faces:
        x, y, w, h = source_faces[0]
        source_face = source_img[y:y+h, x:x+w]
        logger.info(f"Source face: {w}x{h}")
    else:
        # Fallback: ใช้ส่วนกลางของภาพ
        h_img, w_img = source_img.shape[:2]
        size = min(h_img, w_img) // 2
        y_c = (h_img - size) // 2
        x_c = (w_img - size) // 2
        source_face = source_img[y_c:y_c+size, x_c:x_c+size]
        logger.info("Using center crop as source face")
    
    # เปิดวิดีโอ
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error("Failed to open video")
        return False
    
    # ตั้งค่า output
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # ลด FPS ถ้าสูงเกินไปเพื่อความเร็ว
    target_fps = min(fps, 30)
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, target_fps, (width, height))
    
    if not out.isOpened():
        logger.error("Failed to initialize VideoWriter")
        cap.release()
        return False
    
    logger.info(f"Video: {width}x{height}, FPS: {fps:.1f} -> {target_fps:.1f}")
    logger.info(f"Frame skip: {FRAME_SKIP}")
    
    # ประมวลผลเฟรม
    frame_count = 0
    swap_count = 0
    last_log_time = start_time
    
    logger.info("Processing frames...")
    
    while True:
        # ตรวจสอบเวลาไม่ให้เกิน 55 วินาที
        if time() - start_time > MAX_PROCESSING_TIME:
            logger.warning(f"Time limit reached ({MAX_PROCESSING_TIME}s), stopping early")
            break
            
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # ประมวลผลเฉพาะเฟรมที่กำหนด
        if frame_count % FRAME_SKIP == 0:
            result_frame = fast_face_swap(source_face, frame, detector)
            out.write(result_frame)
            swap_count += 1
        else:
            out.write(frame)
        
        # แสดง progress ทุก 5 วินาที
        current_time = time()
        if current_time - last_log_time >= 5:
            progress = (frame_count / int(cap.get(cv2.CAP_PROP_FRAME_COUNT))) * 100 if cap.get(cv2.CAP_PROP_FRAME_COUNT) > 0 else 0
            logger.info(f"Progress: {frame_count} frames, {progress:.1f}%")
            last_log_time = current_time
    
    # ทำความสะอาด
    cap.release()
    out.release()
    
    end_time = time()
    duration = end_time - start_time
    
    logger.info("====================================")
    logger.info("=== FAST Face Swap Completed ===")
    logger.info(f"Total Frames: {frame_count}")
    logger.info(f"Swapped Frames: {swap_count}")
    logger.info(f"Processing Time: {duration:.2f} seconds")
    logger.info(f"Output: {output_path}")
    logger.info("====================================")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--test":
        if load_face_detector():
            print("✅ Face detector ready")
            sys.exit(0)
        else:
            sys.exit(1)
    elif len(sys.argv) == 4:
        success = main_swap(sys.argv[1], sys.argv[2], sys.argv[3])
        if success:
            print(sys.argv[3])
            sys.exit(0)
        else:
            sys.exit(1)
    else:
        print("Usage:")
        print(" Test: python face_swap.py --test")
        print(" Swap: python face_swap.py <image> <video> <output>")
        sys.exit(1)