import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState<number>(0);
  const [currentY, setCurrentY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCurrentY(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      setCurrentY(dy);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 120) {
      onClose();
    } else {
      setCurrentY(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:hidden animate-in fade-in-50"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="w-full bg-white rounded-t-3xl border-t border-brand-border/90 shadow-elevated max-h-[85vh] flex flex-col safe-bottom"
      >
        {/* Drag handle */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-3 flex items-center justify-center cursor-grab active:cursor-grabbing hit-slop"
        >
          <div className="w-10 h-1.5 rounded-full bg-brand-border" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-6 pb-3 border-b border-brand-border/60">
            <h3 className="font-bold text-sm text-brand-black font-display">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-md text-brand-mutedText hover:text-brand-black hit-slop">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto px-6 py-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
