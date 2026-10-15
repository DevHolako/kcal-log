import { AlertCircle, Camera, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { useTranslation } from '@/lib/i18n';
import type { FoodItem } from '@/pages/foods';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFoodFound: (food: FoodItem) => void;
}

export default function BarcodeScannerModal({
    open,
    onOpenChange,
    onFoodFound,
}: Props) {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualBarcode, setManualBarcode] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [hasBarcodeDetector, setHasBarcodeDetector] =
        useState<boolean>(false);

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
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                setCameraError(t('scanner.unsupported'));
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
                    formats: [
                        'ean_13',
                        'ean_8',
                        'upc_a',
                        'upc_e',
                        'code_128',
                        'qr_code',
                    ],
                });

                const scanFrame = async () => {
                    if (
                        videoRef.current &&
                        videoRef.current.readyState ===
                            videoRef.current.HAVE_ENOUGH_DATA
                    ) {
                        try {
                            const barcodes = await detector.detect(
                                videoRef.current,
                            );
                            if (barcodes.length > 0) {
                                const rawValue = barcodes[0].rawValue;
                                if (rawValue && rawValue !== scannedCode) {
                                    void handleBarcodeDetected(rawValue);
                                    return; // stop scanning while looking up
                                }
                            }
                        } catch {
                            // frame skip
                        }
                    }
                    animationFrameRef.current =
                        requestAnimationFrame(scanFrame);
                };

                animationFrameRef.current = requestAnimationFrame(scanFrame);
            } else {
                setHasBarcodeDetector(false);
            }
        } catch (err: any) {
            setCameraError(err.message || t('scanner.permission_denied'));
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
            const res = await fetch(
                `/api/v1/foods/barcode/${encodeURIComponent(code)}`,
            );
            const data = await res.json();

            if (res.ok && data.data) {
                stopCamera();
                onOpenChange(false);
                onFoodFound(data.data);
            } else {
                setSearchError(
                    data.message || t('scanner.not_found', { code }),
                );
                // Resume camera scanning after short delay
                setTimeout(() => {
                    setScannedCode(null);
                    if (cameraActive) {
                        void startCamera();
                    }
                }, 3000);
            }
        } catch {
            setSearchError(t('scanner.failed', { code }));
            setScannedCode(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualBarcode.trim()) return;
        void handleBarcodeDetected(manualBarcode.trim());
    };

    useEffect(() => {
        if (open) {
            setScannedCode(null);
            setSearchError(null);
            setManualBarcode('');
            void startCamera();
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
                        {t('scanner.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('scanner.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Viewfinder Window */}
                    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-inner">
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
                                <div className="relative h-44 w-64 rounded-xl border-2 border-emerald-500/80 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <div className="absolute inset-x-0 top-1/2 h-0.5 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    <span className="absolute inset-x-0 bottom-2 text-center text-[10px] font-medium tracking-wider text-emerald-300 uppercase">
                                        {t('scanner.align')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Camera Error or Inactive State */}
                        {!cameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/90 p-4 text-center text-slate-300">
                                <Camera className="h-8 w-8 text-slate-500" />
                                <p className="max-w-xs text-xs text-slate-400">
                                    {cameraError ||
                                        'Camera inactive. You can enter the barcode manually below.'}
                                </p>
                                {cameraError && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            void startCamera();
                                        }}
                                        className="gap-1.5 border-slate-700 text-xs text-white hover:bg-slate-800"
                                    >
                                        <RefreshCw className="h-3 w-3" />{' '}
                                        {t('scanner.retry')}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Loading / Searching Overlay */}
                        {isSearching && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 text-white">
                                <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
                                <span className="text-sm font-medium">
                                    {t('scanner.looking_up', {
                                        code: scannedCode ?? '',
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Camera feedback notice */}
                    {cameraActive && !hasBarcodeDetector && (
                        <p className="text-center text-[11px] text-muted-foreground">
                            {t('scanner.notice')}
                        </p>
                    )}

                    {/* Error Alert */}
                    {searchError && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{searchError}</span>
                        </div>
                    )}

                    {/* Manual Barcode Input Form */}
                    <form
                        onSubmit={handleManualSubmit}
                        className="space-y-2 border-t border-border pt-2"
                    >
                        <Label
                            htmlFor="manual-barcode"
                            className="text-xs font-semibold text-muted-foreground"
                        >
                            {t('scanner.manual_prompt')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="manual-barcode"
                                type="text"
                                placeholder="e.g. 5449000000996"
                                value={manualBarcode}
                                onChange={(e) =>
                                    setManualBarcode(e.target.value)
                                }
                                className="font-mono text-sm"
                            />
                            <Button
                                type="submit"
                                disabled={isSearching || !manualBarcode.trim()}
                                className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {isSearching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    t('action.lookup')
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                <DialogFooter className="sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('action.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
