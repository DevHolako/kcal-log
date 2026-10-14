import { AlertCircle, Camera, Check, Loader2, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FoodItem } from '@/pages/foods';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFoodFound: (food: FoodItem) => void;
}

export default function BarcodeScannerModal({ open, onOpenChange, onFoodFound }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [hasCamera, setHasCamera] = useState<boolean>(true);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualBarcode, setManualBarcode] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [hasBarcodeDetector, setHasBarcodeDetector] = useState<boolean>(false);

    // Stop camera stream cleanly
    const stopCamera = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    // Start camera stream and barcode detection loop
    const startCamera = async () => {
        setCameraError(null);
        setSearchError(null);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setHasCamera(false);
                setCameraError('Camera API is not supported on this browser or environment.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraActive(true);
            }

            // Check if native BarcodeDetector is available
            const BarcodeDetectorClass = (window as any).BarcodeDetector;
            if (typeof BarcodeDetectorClass !== 'undefined') {
                setHasBarcodeDetector(true);
                const detector = new BarcodeDetectorClass({
                    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
                });

                const scanFrame = async () => {
                    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                        try {
                            const barcodes = await detector.detect(videoRef.current);
                            if (barcodes.length > 0) {
                                const rawValue = barcodes[0].rawValue;
                                if (rawValue && rawValue !== scannedCode) {
                                    handleBarcodeDetected(rawValue);
                                    return; // stop scanning while looking up
                                }
                            }
                        } catch {
                            // frame skip
                        }
                    }
                    animationFrameRef.current = requestAnimationFrame(scanFrame);
                };

                animationFrameRef.current = requestAnimationFrame(scanFrame);
            } else {
                setHasBarcodeDetector(false);
            }
        } catch (err: any) {
            setCameraError(err.message || 'Unable to access camera. Please allow camera permissions.');
            setCameraActive(false);
        }
    };

    const handleBarcodeDetected = async (code: string) => {
        setScannedCode(code);
        setSearchError(null);
        setIsSearching(true);

        try {
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        } catch {
            // vibration error
        }

        try {
            const res = await fetch(`/api/v1/foods/barcode/${encodeURIComponent(code)}`);
            const data = await res.json();

            if (res.ok && data.data) {
                stopCamera();
                onOpenChange(false);
                onFoodFound(data.data);
            } else {
                setSearchError(data.message || `No food found matching barcode ${code}.`);
                // Resume camera scanning after short delay
                setTimeout(() => {
                    setScannedCode(null);
                    if (cameraActive) {
                        startCamera();
                    }
                }, 3000);
            }
        } catch {
            setSearchError(`Failed to lookup barcode ${code}. Check network connection.`);
            setScannedCode(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualBarcode.trim()) return;
        handleBarcodeDetected(manualBarcode.trim());
    };

    useEffect(() => {
        if (open) {
            setScannedCode(null);
            setSearchError(null);
            setManualBarcode('');
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-emerald-600" />
                        Scan Food Barcode
                    </DialogTitle>
                    <DialogDescription>
                        Scan any food package barcode to look it up in Open Food Facts and your saved food catalog.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Viewfinder Window */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-inner flex items-center justify-center">
                        <video
                            ref={videoRef}
                            className="h-full w-full object-cover"
                            playsInline
                            muted
                            autoPlay
                        />

                        {/* Scanner overlay line & target box */}
                        {cameraActive && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-44 w-64 rounded-xl border-2 border-emerald-500/80 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.3)] relative">
                                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    <span className="absolute bottom-2 inset-x-0 text-center text-[10px] text-emerald-300 font-medium tracking-wider uppercase">
                                        Align barcode inside frame
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Camera Error or Inactive State */}
                        {!cameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-300 bg-slate-900/90 gap-2">
                                <Camera className="h-8 w-8 text-slate-500" />
                                <p className="text-xs max-w-xs text-slate-400">
                                    {cameraError || 'Camera inactive. You can enter the barcode manually below.'}
                                </p>
                                {cameraError && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={startCamera}
                                        className="gap-1.5 text-xs text-white border-slate-700 hover:bg-slate-800"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Retry Camera
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Loading / Searching Overlay */}
                        {isSearching && (
                            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-white">
                                <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
                                <span className="text-sm font-medium">Looking up barcode {scannedCode}...</span>
                            </div>
                        )}
                    </div>

                    {/* Camera feedback notice */}
                    {cameraActive && !hasBarcodeDetector && (
                        <p className="text-[11px] text-muted-foreground text-center">
                            Camera stream active. If your browser does not support live barcode detection, enter the digits below.
                        </p>
                    )}

                    {/* Error Alert */}
                    {searchError && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{searchError}</span>
                        </div>
                    )}

                    {/* Manual Barcode Input Form */}
                    <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-border">
                        <Label htmlFor="manual-barcode" className="text-xs font-semibold text-muted-foreground">
                            Or enter barcode manually:
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="manual-barcode"
                                type="text"
                                placeholder="e.g. 5449000000996"
                                value={manualBarcode}
                                onChange={(e) => setManualBarcode(e.target.value)}
                                className="font-mono text-sm"
                            />
                            <Button
                                type="submit"
                                disabled={isSearching || !manualBarcode.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                            >
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
                            </Button>
                        </div>
                    </form>
                </div>

                <DialogFooter className="sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
