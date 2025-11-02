const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');

async function downloadVideo(videoUrl, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`[DOWNLOAD] Starting download: ${videoUrl}`);
        
        const cmd = `/root/miniconda3/bin/ffmpeg -i "${videoUrl}" -c copy -y "${outputPath}" -loglevel error`;
        console.log(`[FFMPEG] Command: ${cmd}`);
        
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`[DOWNLOAD ERROR] ${stderr}`);
                return reject(new Error(`Download failed: ${stderr}`));
            }
            console.log(`[DOWNLOAD] Completed: ${outputPath}`);
            resolve(outputPath);
        });
    });
}

async function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        const cmd = `/root/miniconda3/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
        
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`[DURATION ERROR] ${stderr}`);
                return resolve(0); // Return 0 if cannot get duration
            }
            const duration = parseFloat(stdout);
            console.log(`[DURATION] Video duration: ${duration} seconds`);
            resolve(duration);
        });
    });
}

router.post('/swap-face', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { videoId, faceImageFilename, videoUrl } = req.body;
        console.log(`[API] Request received:`, { videoId, faceImageFilename, videoUrl });

        if ((!videoId && !videoUrl) || !faceImageFilename) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing parameters' 
            });
        }

        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const imagePath = path.join(uploadsDir, 'images', faceImageFilename);
        const outputDir = path.join(uploadsDir, 'outputs');
        const tempDir = path.join(uploadsDir, 'temp');
        
        // สร้างโฟลเดอร์ถ้ายังไม่มี
        [outputDir, tempDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        const outputFilename = `fast_${videoId || 'temp'}_${Date.now()}.mp4`;
        const outputPath = path.join(outputDir, outputFilename);

        let videoPath;

        if (videoUrl) {
            // ทำความสะอาด URL
            const cleanedVideoUrl = videoUrl.includes('$') ? 
                videoUrl.split('$').slice(-1)[0] : videoUrl;
            console.log(`[API] Cleaned video URL: ${cleanedVideoUrl}`);

            // ดาวน์โหลดวิดีโอ
            const tempVideoPath = path.join(tempDir, `temp_${Date.now()}.mp4`);
            
            try {
                await downloadVideo(cleanedVideoUrl, tempVideoPath);
                
                // ตรวจสอบความยาววิดีโอ
                const duration = await getVideoDuration(tempVideoPath);
                if (duration > 180) { // มากกว่า 3 นาที
                    console.log(`[WARNING] Video too long (${duration}s), may take more time`);
                }
                
                videoPath = tempVideoPath;
            } catch (downloadError) {
                console.error(`[DOWNLOAD FAILED] ${downloadError.message}`);
                return res.status(500).json({
                    success: false,
                    message: `Failed to download video: ${downloadError.message}`
                });
            }
        } else {
            videoPath = path.join(uploadsDir, 'videos', `${videoId}.mp4`);
        }

        console.log(`[API] Video path: ${videoPath}`);
        console.log(`[API] Image path: ${imagePath}`);
        console.log(`[API] Output path: ${outputPath}`);

        // ตรวจสอบไฟล์
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Face image not found' 
            });
        }
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Video file not found' 
            });
        }

        console.log(`[API] Starting FAST face swap process...`);

        const pythonProcess = spawn('python3', [
            path.join(__dirname, '..', 'scripts', 'face_swap.py'),
            imagePath,
            videoPath,
            outputPath
        ], {
            timeout: 120000 // 2 นาที
        });

        let stderr = '';
        let stdout = '';

        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            console.log(`[PYTHON] ${output.trim()}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            const error = data.toString();
            stderr += error;
            console.error(`[PYTHON ERROR] ${error.trim()}`);
        });

        pythonProcess.on('close', (code) => {
            const processingTime = (Date.now() - startTime) / 1000;
            
            console.log(`[API] Python process exited with code: ${code}`);
            console.log(`[API] Total processing time: ${processingTime.toFixed(1)}s`);

            // ลบไฟล์ชั่วคราว
            if (videoUrl && videoPath && fs.existsSync(videoPath)) {
                try {
                    fs.unlinkSync(videoPath);
                    console.log(`[CLEANUP] Removed temp video: ${videoPath}`);
                } catch (cleanupError) {
                    console.warn(`[CLEANUP WARNING] Failed to remove temp file: ${cleanupError.message}`);
                }
            }

            if (code === 0 && fs.existsSync(outputPath)) {
                const outputUrl = `/uploads/outputs/${path.basename(outputPath)}`;
                console.log(`[SUCCESS] Face swap completed in ${processingTime.toFixed(1)}s: ${outputUrl}`);
                
                res.json({ 
                    success: true, 
                    outputUrl: outputUrl, 
                    processingTime: processingTime,
                    message: `Face swap completed in ${processingTime.toFixed(1)} seconds`
                });
            } else {
                console.error(`[ERROR] Face swap failed with code ${code}`);
                
                let errorMessage = 'Face swap processing failed';
                if (stderr.includes('NO_FACES_FOUND')) {
                    errorMessage = 'No faces detected in the video';
                } else if (stderr.includes('Cannot load source face image')) {
                    errorMessage = 'Cannot process the face image';
                } else if (processingTime > 55) {
                    errorMessage = 'Processing time exceeded limit, video might be too long';
                }
                
                res.status(500).json({ 
                    success: false, 
                    message: errorMessage, 
                    processingTime: processingTime,
                    error: stderr || 'Unknown error occurred' 
                });
            }
        });

        pythonProcess.on('error', (error) => {
            const processingTime = (Date.now() - startTime) / 1000;
            console.error('[ERROR] Failed to start Python process:', error);
            
            res.status(500).json({ 
                success: false, 
                message: 'Failed to start face swap process', 
                processingTime: processingTime,
                error: error.message 
            });
        });

    } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        console.error('[ERROR] Unexpected error in swap-face:', error);
        
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error', 
            processingTime: processingTime,
            error: error.message 
        });
    }
});

module.exports = router;