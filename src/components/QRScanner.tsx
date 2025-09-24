import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw } from "lucide-react";

interface QRScannerProps {
  onScan: (data: any) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);

  // Request camera permission and enumerate devices
  useEffect(() => {
    const getCameras = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsPermissionGranted(true);
        stream.getTracks().forEach(track => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        setCameras(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        } else {
          setError("No camera found on this device");
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setIsPermissionGranted(false);
        setError("Camera access denied. Please allow camera access to scan QR codes.");
      }
    };
    getCameras();
  }, []);

  // Scan QR code from webcam
  const scanQRCode = useCallback(() => {
    if (!isScanning) return;

    const getQRCode = () => {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        if (isScanning) requestAnimationFrame(getQRCode);
        return;
      }

      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          try {
            const data = JSON.parse(code.data);

            const scannedTickets = JSON.parse(localStorage.getItem("scannedTickets") || "[]");
            const isUsed = scannedTickets.some(
              (t: any) => t.ticketId === data.ticketId && t.eventId === data.eventId
            );

            if (isUsed) data.alreadyUsed = true;

            onScan(data);
            setIsScanning(false);
          } catch (e) {
            console.log("Invalid QR code data format:", code.data);
          }
        }
      };

      if (isScanning) requestAnimationFrame(getQRCode);
    };

    requestAnimationFrame(getQRCode);
  }, [isScanning, onScan]);

  // Trigger scanning when camera is selected
  useEffect(() => {
    if (selectedCamera && isScanning) {
      const timeoutId = setTimeout(() => scanQRCode(), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [scanQRCode, selectedCamera, isScanning]);

  const resetScanner = () => setIsScanning(true);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Camera Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isPermissionGranted === false ? (
          <div className="text-center py-4">
            <p className="mb-4">Camera permission is required to scan QR codes.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative overflow-hidden rounded-lg bg-black mb-4 w-full aspect-square">
              {selectedCamera && (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ deviceId: selectedCamera, aspectRatio: 1, facingMode: "environment" }}
                  className="w-full h-full object-cover"
                  onUserMediaError={(err) => {
                    const errorMessage =
                      err instanceof DOMException ? err.message : typeof err === "string" ? err : "Unknown error";
                    setError("Failed to access camera: " + errorMessage);
                  }}
                />
              )}

              {isScanning && (
                <div className="absolute inset-0 border-2 border-primary z-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-scanner-line"></div>
                </div>
              )}
            </div>

            {cameras.length > 1 && (
              <select
                className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedCamera || ""}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                  </option>
                ))}
              </select>
            )}

            <div className="flex gap-2 justify-center">
              {isScanning ? (
                <Button variant="outline" size="sm" onClick={() => setIsScanning(false)}>
                  Pause Scanner
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={resetScanner}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Scanner
                  </Button>
                  <Button size="sm" onClick={() => setIsScanning(true)}>
                    <Camera className="mr-2 h-4 w-4" />
                    Resume Scanning
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
