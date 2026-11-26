import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertTriangle, CheckCircle, VideoOff, Upload } from 'lucide-react';

interface CameraFeedProps {
  onCapture: (imageBlob: Blob) => void;
  isProcessing: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Real-time metrics
  const [brightness, setBrightness] = useState<number>(120);
  const [contrast, setContrast] = useState<number>(50);
  const [isPositioned, setIsPositioned] = useState<boolean>(true); // Guide indicator

  // Find camera devices on mount
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request camera permission first to guarantee labels are populated by the browser
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const list = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = list.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        } else {
          setPermissionError("No camera hardware detected. You can upload a scalp image file instead.");
        }
      } catch (err) {
        console.error("Error listing video devices:", err);
        // Fallback: list devices even if permission request was rejected/failed
        try {
          const list = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = list.filter(device => device.kind === 'videoinput');
          setDevices(videoDevices);
          if (videoDevices.length > 0) {
            setSelectedDeviceId(videoDevices[0].deviceId);
          } else {
            setPermissionError("Camera permission denied or no webcam hardware detected. You can upload a scalp image file instead.");
          }
        } catch (e) {
          console.error("Fallback listing failed:", e);
          setPermissionError("No camera hardware detected. You can upload a scalp image file instead.");
        }
      }
    };
    getDevices();
  }, []);

  // Initialize selected camera stream
  useEffect(() => {
    if (!selectedDeviceId) return;
    
    const startCamera = async () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setPermissionError(null);
      
      try {
        const constraints = {
          video: { 
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("Webcam access error:", err);
        setPermissionError("Webcam permission denied or camera in use. Please check browser settings or upload an image file directly.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  // Canvas loop for real-time video processing (brightness, contrast check)
  useEffect(() => {
    let animationFrameId: number;
    
    const analyzeFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.paused || video.ended) {
        animationFrameId = requestAnimationFrame(analyzeFrame);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video frame to small virtual canvas to extract pixels
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        let r, g, b, brightnessSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          r = data[i];
          g = data[i+1];
          b = data[i+2];
          // Brightness formula
          brightnessSum += (0.299 * r + 0.587 * g + 0.114 * b);
        }
        
        const avgBrightness = brightnessSum / (data.length / 4);
        setBrightness(Math.round(avgBrightness));
        
        // Simple contrast metric (std dev of brightness)
        let sqDiffSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          r = data[i];
          g = data[i+1];
          b = data[i+2];
          const val = (0.299 * r + 0.587 * g + 0.114 * b);
          sqDiffSum += Math.pow(val - avgBrightness, 2);
        }
        const avgContrast = Math.sqrt(sqDiffSum / (data.length / 4));
        setContrast(Math.round(avgContrast));
      }
      
      animationFrameId = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stream]);

  // Countdown capture helper
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      captureImage();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    if (isProcessing) return;
    setCountdown(3);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    // Use requestAnimationFrame to synchronize with the camera refresh rate
    requestAnimationFrame(() => {
      // Determine the actual camera track resolution dynamically
      const track = stream?.getVideoTracks()[0];
      const settings = track?.getSettings();
      const targetWidth = settings?.width || video.videoWidth || 1280;
      const targetHeight = settings?.height || video.videoHeight || 720;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        let captured = false;
        
        // 1. Try ImageCapture API first (direct track access)
        if (stream && 'ImageCapture' in window) {
          try {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack && videoTrack.readyState === 'live') {
              // @ts-ignore
              const imageCapture = new ImageCapture(videoTrack);
              // @ts-ignore
              imageCapture.grabFrame().then((imageBitmap) => {
                ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
                canvas.toBlob((blob) => {
                  if (blob) {
                    onCapture(blob);
                  }
                }, 'image/jpeg', 0.95);
              }).catch((err) => {
                console.warn("grabFrame promise failed, falling back to drawImage:", err);
                fallbackDraw(video, canvas, ctx, targetWidth, targetHeight);
              });
              captured = true;
            }
          } catch (err) {
            console.warn("ImageCapture grabFrame failed, falling back to drawImage:", err);
          }
        }

        // 2. Fallback: draw video element directly
        if (!captured) {
          fallbackDraw(video, canvas, ctx, targetWidth, targetHeight);
        }
      }
    });
  };

  const fallbackDraw = (
    video: HTMLVideoElement, 
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    targetWidth: number, 
    targetHeight: number
  ) => {
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  // Brightness and contrast checks
  const isLightingOptimal = brightness >= 50 && brightness <= 215;
  const isContrastOptimal = contrast >= 20;
  const qualityPassed = isLightingOptimal && isContrastOptimal;

  return (
    <div className="flex flex-col items-center">
      {/* Hidden file upload input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Real-time Quality checking canvas */}
      <canvas 
        ref={canvasRef} 
        width="160" 
        height="90" 
        className="absolute opacity-0 pointer-events-none -z-10" 
        style={{ left: '-9999px' }} 
      />

      {/* Dedicated high-resolution Capture canvas */}
      <canvas 
        ref={captureCanvasRef} 
        className="absolute opacity-0 pointer-events-none -z-10" 
        style={{ left: '-9999px' }} 
      />

      {/* Main Camera Frame Viewport */}
      <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-2xl overflow-hidden border-4 transition-all duration-300 shadow-lg pulse-border"
           style={{ borderColor: countdown !== null ? '#10B981' : (qualityPassed ? '#0e8ce2' : '#EF4444') }}>
        
        {permissionError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950">
            <VideoOff className="h-12 w-12 text-rose-500 mb-4" />
            <h4 className="text-lg font-bold">Camera Feed Unavailable</h4>
            <p className="text-sm text-slate-400 max-w-sm mt-2">{permissionError}</p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 bg-clinical-600 hover:bg-clinical-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" /> Upload Scalp Image File instead
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1]" 
            />

            {/* SVG Clinical Oval Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 640 360">
                <ellipse 
                  cx="320" 
                  cy="180" 
                  rx="110" 
                  ry="140" 
                  fill="none" 
                  stroke={countdown !== null ? '#10B981' : (qualityPassed ? '#0e8ce2' : '#EF4444')} 
                  strokeWidth="3" 
                  strokeDasharray="8 6" 
                  className="opacity-80"
                />
                <text x="320" y="30" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600" className="drop-shadow bg-black bg-opacity-40 px-2 py-1 rounded">
                  ALIGN SCALP WITHIN OVAL
                </text>
              </svg>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
                <span className="text-white text-8xl font-black animate-ping">{countdown}</span>
              </div>
            )}

            {/* Quality Metrics HUD */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-3 pointer-events-none select-none">
              {/* Lighting Status indicator */}
              <div className="glass-panel text-xs text-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5 font-semibold">
                {isLightingOptimal ? (
                  <>
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Lighting: Optimal ({brightness})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
                    <span>Lighting: {brightness < 50 ? 'Low Light' : 'Too Bright'} ({brightness})</span>
                  </>
                )}
              </div>

              {/* Contrast / Frame stability */}
              <div className="glass-panel text-xs text-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5 font-semibold">
                {isContrastOptimal ? (
                  <>
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Focus / Contrast: Pass</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                    <span>Focus / Contrast: Blurry / Flat</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Control Actions & Camera Selection Toolbar */}
      <div className="w-full max-w-2xl mt-6 flex justify-between items-center gap-4 flex-wrap">
        {/* Device selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Camera Source:</span>
          <select 
            disabled={devices.length <= 1}
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none font-medium hover:border-slate-300"
          >
            {devices.length === 0 ? (
              <option value="">None Detected</option>
            ) : (
              devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* File Upload Fallback Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Upload Image</span>
          </button>

          {/* Webcam Capture Button */}
          <button
            onClick={startCountdown}
            disabled={permissionError !== null || isProcessing || countdown !== null}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
              isProcessing || countdown !== null
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : (qualityPassed
                    ? 'bg-clinical-600 hover:bg-clinical-700 text-white hover:shadow-lg'
                    : 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-lg')
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Analyzing Image...</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                <span>{countdown !== null ? `Snapping in ${countdown}...` : 'Start Auto-Capture'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Poor quality clinical caution warning */}
      {!qualityPassed && !permissionError && (
        <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-lg max-w-2xl w-full">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <p className="font-medium">
            <b>Warning:</b> Diagnostic reliability is degraded. Please adjust lighting or position before shooting to ensure clinical accuracy.
          </p>
        </div>
      )}
    </div>
  );
};
