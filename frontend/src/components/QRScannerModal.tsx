import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Camera, AlertCircle, RefreshCw } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { t, isKhmer } = useLanguage();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'qr-camera-stream-reader';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setErrorMessage(null);
    setIsScanning(true);

    try {
      // Check if camera is available
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setErrorMessage(
          isKhmer
            ? 'រកមិនឃើញកាមេរ៉ានៅលើឧបករណ៍នេះឡើយ។'
            : 'No camera hardware found on this device.'
        );
        setIsScanning(false);
        return;
      }

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      // Prefer back camera on mobile phones
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          stopScanner();
          onScanSuccess(decodedText);
        },
        () => {
          // Frame parse error (ignored during scan)
        }
      );
    } catch (err: any) {
      console.error('Camera QR scan error:', err);
      let msg = isKhmer
        ? 'មិនអាចបើកកាមេរ៉ាបានទេ។ សូមពិនិត្យសិទ្ធិអនុញ្ញាត (Camera Permission) ក្នុងកម្មវិធីរុករករបស់អ្នក។'
        : 'Cannot access camera. Please check your browser camera permissions.';

      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        msg = isKhmer
          ? 'ការអនុញ្ញាតប្រើកាមេរ៉ាត្រូវបានបដិសេធ។ សូមបើកសិទ្ធិកាមេរ៉ាក្នុងការកំណត់ Browser។'
          : 'Camera access denied. Please allow camera permissions in your browser settings.';
      }
      setErrorMessage(msg);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base">{t.landing.scannerTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <p className="text-xs text-slate-500 text-center mb-4">
            {t.landing.scannerInstruction}
          </p>

          {/* Camera viewport */}
          <div className="w-full max-w-[280px] h-[280px] bg-slate-950 rounded-2xl overflow-hidden relative border-4 border-brand-500/30 flex items-center justify-center shadow-inner">
            <div id={readerElementId} className="w-full h-full" />

            {isScanning && !errorMessage && (
              <div className="absolute inset-0 pointer-events-none border-2 border-brand-400 rounded-xl m-6 animate-pulse" />
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{isKhmer ? 'កំហុសកាមេរ៉ា' : 'Camera Error'}</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
                <button
                  type="button"
                  onClick={startScanner}
                  className="mt-2 inline-flex items-center space-x-1 font-semibold text-rose-900 underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isKhmer ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
