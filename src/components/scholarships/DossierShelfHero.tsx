import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scholarship } from '@/types';
import { useTranslation } from '@/locales/LanguageContext';
import { useToast } from '@/components/ui/ToastProvider';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  Bookmark, 
  CheckCircle2, 
  Calendar, 
  X, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';

interface Props {
  scholarships: Scholarship[];
}

export const DossierShelfHero: React.FC<Props> = ({ scholarships }) => {
  const { language } = useTranslation();
  const { success } = useToast();
  const navigate = useNavigate();

  // If no scholarships passed, fallback to repository
  const items = scholarships && scholarships.length > 0 ? scholarships : [];

  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const playRingRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const inkMaskBlobsRef = useRef<(SVGCircleElement | null)[]>([]);

  // Physics & Animation State Refs
  const sRef = useRef<number>(17); // Initial scroll position (middle copy, Noon in Ashes or index 5)
  const targetRef = useRef<number>(17);
  const activeIndexRef = useRef<number>(5);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartTRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const hoverIndexRef = useRef<number>(-1);
  const liftMapRef = useRef<Map<number, number>>(new Map());

  // Cursor & Tilt state
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothCursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const tiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const onCoverRef = useRef<boolean>(false);
  const isDetailOpenRef = useRef<boolean>(false);

  // React State for Masked Caption & Tabs
  const [activeFilm, setActiveFilm] = useState<Scholarship | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [tapeDimensions, setTapeDimensions] = useState<{ H: number; ws: number; d: number; gap: number }>({
    H: 340,
    ws: 57,
    d: 179,
    gap: 10,
  });

  // Category filter tabs
  const categories = [
    { id: 'all', label: language === 'te' ? 'అన్నీ / ALL' : language === 'hi' ? 'सभी / ALL' : 'ALL SCHEMES' },
    { id: 'central', label: 'CENTRAL (NSP)' },
    { id: 'state', label: 'STATE SCHEMES' },
    { id: 'girl', label: 'GIRLS / STEM' },
    { id: 'merit', label: 'MERIT / MEANS' },
  ];

  // Measure dimensions
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const isMobile = vw <= 768;
    const H = isMobile ? Math.min(vw * 0.62, vh * 0.42) : Math.min(vh * 0.46, vw * 0.31);
    const ws = (H * 142) / 840;
    const d = (H * 474) / 900;
    const gap = H * 0.032;

    setTapeDimensions({ H, ws, d, gap });

    if (stageRef.current) {
      stageRef.current.style.setProperty('--ws', `${ws}px`);
      stageRef.current.style.setProperty('--d', `${d}px`);
      stageRef.current.style.setProperty('--H', `${H}px`);
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Set initial active item
  useEffect(() => {
    if (items.length > 0) {
      const initialIdx = Math.min(5, items.length - 1);
      setActiveFilm(items[initialIdx]);
      activeIndexRef.current = initialIdx;
      sRef.current = initialIdx + items.length;
      targetRef.current = initialIdx + items.length;
      setIsSaved(ScholarshipRepository.isScholarshipSaved(items[initialIdx].id));
    }
  }, [items]);

  // Smoothstep function
  const smoothstep = (x: number) => {
    const c = Math.max(0, Math.min(1, x));
    return c * c * (3 - 2 * c);
  };

  // Horizontal push step function B(r)
  const B = (r: number) => {
    if (Math.abs(r) < 1) {
      return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
    }
    return r > 0 ? 0.5 : -0.5;
  };

  // Main 60 FPS requestAnimationFrame physics loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!items || items.length === 0) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const totalItems = items.length;
      const { H, ws, d, gap } = tapeDimensions;
      const W = window.innerWidth;
      const shelfCenterY = window.innerHeight * 0.5;

      // 1. Spring physics for scroll s towards target T
      const springK = isDraggingRef.current ? 18.0 : 5.4;
      const diff = targetRef.current - sRef.current;
      sRef.current += diff * (1 - Math.exp(-springK * dt));

      if (Math.abs(diff) < 0.0001) {
        sRef.current = targetRef.current;
      }

      // Normalise wrap if s drifts beyond full 3x bounds
      if (sRef.current < 0) {
        sRef.current += totalItems;
        targetRef.current += totalItems;
      } else if (sRef.current >= totalItems * 3) {
        sRef.current -= totalItems;
        targetRef.current -= totalItems;
      }

      // Detect active film change
      const currentActiveIndex = ((Math.round(sRef.current) % totalItems) + totalItems) % totalItems;
      if (currentActiveIndex !== activeIndexRef.current) {
        activeIndexRef.current = currentActiveIndex;
        const newFilm = items[currentActiveIndex];
        setActiveFilm(newFilm);
        setIsSaved(ScholarshipRepository.isScholarshipSaved(newFilm.id));
      }

      // 2. Cursor smoothing & tilt tracking
      const mouse = mouseRef.current;
      const smoothCursor = smoothCursorRef.current;
      smoothCursor.x += (mouse.x - smoothCursor.x) * (1 - Math.exp(-16 * dt));
      smoothCursor.y += (mouse.y - smoothCursor.y) * (1 - Math.exp(-16 * dt));

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${smoothCursor.x}px, ${smoothCursor.y}px, 0)`;
      }

      // Check if cursor is hovering over the active cover face
      const dxFromCenter = Math.abs(mouse.x - W / 2);
      const dyFromCenter = Math.abs(mouse.y - shelfCenterY);
      const isSettled = Math.abs(targetRef.current - sRef.current) < 0.35;
      const isOverCover = !isDetailOpenRef.current && isSettled && dxFromCenter < d * 0.56 && dyFromCenter < H * 0.56;
      onCoverRef.current = isOverCover;

      // Adjust cursor style
      if (cursorRef.current) {
        if (isOverCover) {
          cursorRef.current.className = 'custom-shelf-cursor open-mode';
        } else if (hoverIndexRef.current !== -1) {
          cursorRef.current.className = 'custom-shelf-cursor spine-mode';
        } else {
          cursorRef.current.className = 'custom-shelf-cursor default-mode';
        }
      }

      // Tilt ease
      const targetTiltY = isOverCover ? ((mouse.x - W / 2) / (0.55 * d)) * 9.5 : ((mouse.x - W / 2) / W) * 4.5;
      const targetTiltX = isOverCover ? (-(mouse.y - shelfCenterY) / (H / 2)) * 6.5 : 0;
      tiltRef.current.x += (targetTiltX - tiltRef.current.x) * (1 - Math.exp(-7 * dt));
      tiltRef.current.y += (targetTiltY - tiltRef.current.y) * (1 - Math.exp(-7 * dt));

      // 3. Render 36 tapes (3 full copies) in 3D
      const stage = stageRef.current;
      if (stage) {
        const tapeElements = stage.querySelectorAll<HTMLDivElement>('.shelf-tape');
        tapeElements.forEach((tapeEl) => {
          const virtualIndex = Number(tapeEl.dataset.vindex);
          // Relative index r to current s
          let r = (virtualIndex - sRef.current) % 36;
          if (r > 18) r -= 36;
          if (r < -18) r += 36;

          // Horizontal placement x = F(r)
          const x = r * (ws + gap) + (d - ws + 1.6 * gap) * B(r);

          // Culling check
          if (Math.abs(x) > W / 2 + 1.6 * d) {
            tapeEl.style.visibility = 'hidden';
            return;
          }
          tapeEl.style.visibility = 'visible';

          // Turning openness o
          const o = smoothstep(Math.max(0, 1 - Math.abs(r)));

          // Hover lift
          let currentLift = liftMapRef.current.get(virtualIndex) || 0;
          const targetLift = hoverIndexRef.current === virtualIndex && Math.abs(r) > 0.5 ? 1 : 0;
          currentLift += (targetLift - currentLift) * (1 - Math.exp(-12 * dt));
          liftMapRef.current.set(virtualIndex, currentLift);

          // 3D rotations & translations
          const rotY = -90 * o + tiltRef.current.y * o;
          const rotX = tiltRef.current.x * o;
          const rotZ = -4.5 * o;
          const transZ = o * 0.2 * H;
          const transY = -o * 0.025 * H - currentLift * 0.045 * H;

          tapeEl.style.transform = `translate3d(${x}px, ${transY}px, ${transZ}px) rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          tapeEl.style.zIndex = `${Math.round(100 - Math.abs(r) * 4)}`;

          // Shade overlays on spine and cover
          const spineShade = (o * 0.55).toFixed(3);
          const coverShade = ((1 - o) * 0.5).toFixed(3);
          tapeEl.style.setProperty('--spine-shade', spineShade);
          tapeEl.style.setProperty('--cover-shade', coverShade);
        });
      }

      // 4. Play ring button scale & position
      if (playRingRef.current) {
        const ringScale = isDetailOpenRef.current ? 0 : smoothstep(Math.max(0, 1 - Math.abs(targetRef.current - sRef.current) * 3));
        playRingRef.current.style.transform = `translate3d(0, 0, 0) scale(${ringScale})`;
        playRingRef.current.style.left = `calc(50% - ${d * 0.5 + 8}px)`;
        playRingRef.current.style.top = `calc(50% + ${H * 0.36}px)`;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [items, tapeDimensions]);

  // Global mousemove tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDetailOpenRef.current) {
        if (e.key === 'Escape') {
          closeDetail();
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        targetRef.current = Math.round(targetRef.current) + 1;
      } else if (e.key === 'ArrowLeft') {
        targetRef.current = Math.round(targetRef.current) - 1;
      } else if (e.key === 'Enter') {
        openDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pointer drag on shelf stage
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDetailOpenRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartTRef.current = targetRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 5) {
      hasDraggedRef.current = true;
      const { ws, gap } = tapeDimensions;
      targetRef.current = dragStartTRef.current - dx / (ws + gap);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      targetRef.current = Math.round(targetRef.current);
    }
  };

  // Wheel scroll with snap timeout
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (isDetailOpenRef.current) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const { ws, gap } = tapeDimensions;
    targetRef.current += (delta / (ws + gap)) * 0.45;

    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      targetRef.current = Math.round(targetRef.current);
    }, 160);
  };

  // Tap or click on a specific tape
  const handleTapeClick = (vIndex: number) => {
    if (hasDraggedRef.current || isDetailOpenRef.current) return;
    let r = (vIndex - sRef.current) % 36;
    if (r > 18) r -= 36;
    if (r < -18) r += 36;

    if (Math.abs(r) < 0.5) {
      // Clicked active tape cover -> open full-screen paper detail
      openDetail();
    } else {
      // Glides that tape to center
      targetRef.current = Math.round(targetRef.current + r);
    }
  };

  // Category filter click
  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    if (!items || items.length === 0) return;

    if (catId === 'all') {
      targetRef.current = Math.round(targetRef.current) + 1;
      return;
    }

    // Find first scheme matching category
    const foundIdx = items.findIndex((s) => {
      if (catId === 'central') return s.scheme_type === 'central';
      if (catId === 'state') return s.scheme_type === 'state';
      if (catId === 'girl') return s.applicable_genders.includes('female');
      if (catId === 'merit') return s.slug.includes('merit') || s.slug.includes('pragati');
      return true;
    });

    if (foundIdx !== -1) {
      const currentActive = ((Math.round(targetRef.current) % items.length) + items.length) % items.length;
      let diff = foundIdx - currentActive;
      if (diff > items.length / 2) diff -= items.length;
      if (diff < -items.length / 2) diff += items.length;
      targetRef.current = Math.round(targetRef.current + diff);
    }
  };

  // Open Full-Screen Paper Sheet Detail (WAAPI + Ink Bleed Animation)
  const openDetail = () => {
    if (!activeFilm || !detailRef.current || isDetailOpenRef.current) return;
    isDetailOpenRef.current = true;

    const dialog = detailRef.current;
    dialog.style.visibility = 'visible';

    // Get projected screen rect of active cover
    const activeCover = document.querySelector('.shelf-tape[data-active="true"] .cover-face');
    let startRect = { top: window.innerHeight * 0.25, left: window.innerWidth * 0.35, width: tapeDimensions.d, height: tapeDimensions.H };
    if (activeCover) {
      const r = activeCover.getBoundingClientRect();
      startRect = { top: r.top, left: r.left, width: r.width, height: r.height };
    }

    // 1. Web Animations API paper growth animation from cover rect with -4.5deg rotation
    const topInset = startRect.top;
    const rightInset = window.innerWidth - (startRect.left + startRect.width);
    const bottomInset = window.innerHeight - (startRect.top + startRect.height);
    const leftInset = startRect.left;

    dialog.animate(
      [
        {
          clipPath: `inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px round 3px)`,
          transform: 'rotate(-4.5deg)',
          opacity: 1,
        },
        {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          transform: 'rotate(0deg)',
          opacity: 1,
        },
      ],
      {
        duration: 1050,
        easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
        fill: 'both',
      }
    );

    // 2. Ink bleed circle expansion
    inkMaskBlobsRef.current.forEach((circle, i) => {
      if (!circle) return;
      circle.setAttribute('r', '0');
      const delay = [0, 120, 220, 300, 360, 420, 180][i] || 0;

      setTimeout(() => {
        let startTime: number | null = null;
        const animateBlob = (now: number) => {
          if (!startTime) startTime = now;
          const p = Math.min((now - startTime) / 1250, 1);
          const easeOut = 1 - Math.pow(1 - p, 3);
          circle.setAttribute('r', `${easeOut * 740}`);
          if (p < 1) requestAnimationFrame(animateBlob);
        };
        requestAnimationFrame(animateBlob);
      }, 520 + delay);
    });
  };

  // Close Detail Sheet
  const closeDetail = () => {
    if (!detailRef.current || !isDetailOpenRef.current) return;
    const dialog = detailRef.current;

    const activeCover = document.querySelector('.shelf-tape[data-active="true"] .cover-face');
    let startRect = { top: window.innerHeight * 0.25, left: window.innerWidth * 0.35, width: tapeDimensions.d, height: tapeDimensions.H };
    if (activeCover) {
      const r = activeCover.getBoundingClientRect();
      startRect = { top: r.top, left: r.left, width: r.width, height: r.height };
    }

    const topInset = startRect.top;
    const rightInset = window.innerWidth - (startRect.left + startRect.width);
    const bottomInset = window.innerHeight - (startRect.top + startRect.height);
    const leftInset = startRect.left;

    const anim = dialog.animate(
      [
        {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          transform: 'rotate(0deg)',
        },
        {
          clipPath: `inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px round 3px)`,
          transform: 'rotate(-4.5deg)',
        },
      ],
      {
        duration: 850,
        easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
        fill: 'both',
      }
    );

    anim.onfinish = () => {
      dialog.style.visibility = 'hidden';
      isDetailOpenRef.current = false;
    };
  };

  // Toggle bookmark with optimistic toast & undo
  const handleToggleBookmark = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeFilm) return;
    const nowSaved = ScholarshipRepository.toggleSaveScholarship(activeFilm.id);
    setIsSaved(nowSaved);

    if (nowSaved) {
      success('Dossier Saved to Bookmarks', `${activeFilm.title[language] || activeFilm.title.en} is bookmarked.`, {
        label: 'UNDO',
        onClick: () => {
          ScholarshipRepository.toggleSaveScholarship(activeFilm.id);
          setIsSaved(false);
        },
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[620px] md:h-[680px] select-none overflow-hidden bg-brand-warmWhite border-b border-brand-border/80 flex flex-col items-center justify-center"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Off-screen probe to resolve real --H */}
      <div ref={probeRef} className="absolute opacity-0 pointer-events-none" style={{ height: 'var(--H)' }} />

      {/* SVG Ink Filter Definition for Ragged Ink Blots */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="inkBleedFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Ambient Paper Grain Layer */}
      <div className="paper-grain-overlay" />

      {/* Top Banner Tag */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
          <span className="text-[10.5px] font-mono font-bold tracking-widest text-brand-black uppercase">
            PHYSICAL ARCHIVE • VERIFIED 2026 IST
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-mono text-brand-mutedText">
          <span>DRAG SHELF OR USE ARROW KEYS</span>
        </div>
      </div>

      {/* Category / Scheme Type Selector Tabs */}
      <div className="absolute top-12 z-20 flex items-center justify-center w-full px-4 pointer-events-auto">
        <nav 
          aria-label="Scheme Type Tabs"
          className="relative flex items-center p-0.5 rounded-xl border border-brand-border/80 bg-white/90 backdrop-blur-md shadow-subtle"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`hit-slop px-3 py-1.5 text-[10.5px] font-mono font-bold uppercase rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-black text-white shadow-subtle'
                    : 'text-brand-mutedText hover:text-brand-black'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3D SHELF STAGE */}
      <div 
        className="relative w-full h-[380px] md:h-[420px] perspective-3d-stage flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <div 
          ref={stageRef}
          className="relative preserve-3d"
          style={{ width: 0, height: 0 }}
        >
          {/* Render 36 Virtual Tapes (3 Copies of 12 Schemes) */}
          {Array.from({ length: 36 }).map((_, vIndex) => {
            const originalIndex = vIndex % items.length;
            const s = items[originalIndex];
            const isActive = vIndex === Math.round(sRef.current);

            return (
              <div
                key={`dossier-tape-${vIndex}`}
                data-vindex={vIndex}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => handleTapeClick(vIndex)}
                onPointerEnter={() => {
                  hoverIndexRef.current = vIndex;
                }}
                onPointerLeave={() => {
                  if (hoverIndexRef.current === vIndex) hoverIndexRef.current = -1;
                }}
                className="shelf-tape absolute preserve-3d will-change-transform cursor-pointer"
                style={{ width: 0, height: 0 }}
              >
                {/* 1. SPINE FACE (.sp) */}
                <div
                  className="spine-face absolute backface-hidden rounded-[2px] overflow-hidden border border-brand-border/80 flex flex-col justify-between p-2 shadow-subtle"
                  style={{
                    width: `${tapeDimensions.ws}px`,
                    height: `${tapeDimensions.H}px`,
                    top: `${-tapeDimensions.H / 2}px`,
                    left: `${-tapeDimensions.ws / 2}px`,
                    transform: `translateZ(${tapeDimensions.d / 2}px)`,
                    backgroundColor: originalIndex % 2 === 0 ? '#1E232A' : '#2A201A',
                  }}
                >
                  {/* Spine Header with Ashoka Emblem / Crest */}
                  <div className="flex flex-col items-center pt-1 border-b border-white/10 pb-2">
                    <div className="w-5 h-5 rounded-full border border-amber-400/40 flex items-center justify-center text-[8px] text-amber-400 font-mono font-bold">
                      🇮🇳
                    </div>
                    <span className="text-[7.5px] font-mono text-white/50 tracking-wider uppercase mt-1">
                      {s.scheme_type}
                    </span>
                  </div>

                  {/* Vertical Spine Title */}
                  <div className="flex-1 flex items-center justify-center overflow-hidden py-3">
                    <span 
                      className="text-[10.5px] font-bold text-brand-warmWhite font-display tracking-wider uppercase whitespace-nowrap transform -rotate-90 select-none max-w-[220px] truncate"
                    >
                      {s.title.en}
                    </span>
                  </div>

                  {/* Spine Footer with Seal and Code */}
                  <div className="flex flex-col items-center pt-2 border-t border-white/10 text-center">
                    <span className="text-[7.5px] font-mono font-bold text-brand-orange px-1 py-0.5 rounded bg-black/40">
                      ₹{(s.award_amount || 25000).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[7px] font-mono text-white/40 mt-1">
                      VIDYAPATH
                    </span>
                  </div>

                  {/* Dynamic Shading Layer */}
                  <div 
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-100"
                    style={{ opacity: 'var(--spine-shade, 0)' }}
                  />
                </div>

                {/* 2. COVER FACE (.cv) */}
                <div
                  className="cover-face absolute backface-hidden rounded-[4px] overflow-hidden border border-brand-border flex flex-col justify-between p-4 shadow-elevated bg-white"
                  style={{
                    width: `${tapeDimensions.d}px`,
                    height: `${tapeDimensions.H}px`,
                    top: `${-tapeDimensions.H / 2}px`,
                    left: `${-tapeDimensions.d / 2}px`,
                    transform: `rotateY(90deg) translateZ(${tapeDimensions.ws / 2}px)`,
                    boxShadow: '0 30px 60px -28px rgba(20,16,10,0.55)',
                    background: 'linear-gradient(135deg, #FCFBF9 0%, #F5F2EB 100%)',
                  }}
                >
                  {/* Top Bar with Ministry Header & Verification Stamp */}
                  <div className="flex items-start justify-between pb-2 border-b border-brand-border/70">
                    <div className="flex flex-col max-w-[75%]">
                      <span className="text-[8px] font-mono tracking-widest text-brand-storm-dark uppercase font-bold truncate">
                        {s.provider.en}
                      </span>
                      <span className="text-[7px] font-mono text-brand-mutedText">
                        SCHEME CODE: {s.id.toUpperCase().slice(0, 12)}
                      </span>
                    </div>

                    <div className="h-6 w-6 rounded-full border border-emerald-600/50 bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Screen-Print Archival Graphic Emblem */}
                  <div className="flex-1 my-2 rounded-lg border border-brand-border/60 bg-white/60 p-3 flex flex-col justify-between shadow-subtle relative overflow-hidden">
                    <div className="absolute right-2 top-2 opacity-10 pointer-events-none">
                      <Award className="w-24 h-24 text-brand-black" />
                    </div>

                    <div>
                      <span className="text-[8px] font-mono font-bold uppercase text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded">
                        {s.scheme_type === 'central' ? 'NATIONAL SCHOLARSHIP PORTAL' : 'STATE SPONSORED SCHEME'}
                      </span>
                      <h3 className="mt-2 text-sm md:text-base font-extrabold text-brand-black font-display leading-tight line-clamp-2">
                        {s.title[language] || s.title.en}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-brand-border/50 flex items-end justify-between">
                      <div>
                        <span className="text-[7.5px] font-mono uppercase text-brand-mutedText block">MAX FINANCIAL GRANT</span>
                        <span className="text-base font-bold text-brand-black font-display tabular-nums">
                          ₹{s.award_amount ? s.award_amount.toLocaleString('en-IN') : 'Fee Reimbursement'}
                        </span>
                      </div>
                      <span className="text-[8.5px] font-mono text-brand-mutedText">
                        {s.closing_date ? `Due: ${s.closing_date}` : 'Open 2026'}
                      </span>
                    </div>
                  </div>

                  {/* Cover Footer & Watermark */}
                  <div className="flex items-center justify-between pt-1 border-t border-brand-border/70 text-[8px] font-mono">
                    <span className="text-brand-mutedText">VIDYAPATH DOSSIER</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      OFFICIAL 2026
                    </span>
                  </div>

                  {/* Dynamic Shading Layer on Cover */}
                  <div 
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-100"
                    style={{ opacity: 'var(--cover-shade, 0)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Play / Open Ring Button */}
      <button
        ref={playRingRef}
        onClick={openDetail}
        aria-label="Inspect Scholarship Dossier"
        className="absolute z-30 h-11 w-11 rounded-full border border-brand-orange bg-brand-warmWhite/90 text-brand-orange flex items-center justify-center shadow-elevated tap-60fps hit-slop hover:scale-110 active:scale-95 transition-transform"
      >
        <ArrowUpRight className="h-5 w-5 ml-0.5" />
      </button>

      {/* Navigation Arrow Controls */}
      <button
        onClick={() => {
          targetRef.current = Math.round(targetRef.current) - 1;
        }}
        aria-label="Previous Scholarship"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-brand-border/80 bg-white/80 backdrop-blur-md text-brand-black flex items-center justify-center shadow-subtle tap-60fps hit-slop hover:bg-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => {
          targetRef.current = Math.round(targetRef.current) + 1;
        }}
        aria-label="Next Scholarship"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-brand-border/80 bg-white/80 backdrop-blur-md text-brand-black flex items-center justify-center shadow-subtle tap-60fps hit-slop hover:bg-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* DIRECTIONAL MASKED CAPTION */}
      <div 
        aria-live="polite"
        className="absolute bottom-6 z-20 flex flex-col items-center text-center max-w-2xl px-4 pointer-events-none"
      >
        {activeFilm && (
          <div key={activeFilm.id} className="space-y-1 animate-in fade-in-50 duration-200">
            {/* Title with Masked Slide */}
            <div className="overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-black font-display tracking-tight text-balance">
                {activeFilm.title[language] || activeFilm.title.en}
              </h2>
            </div>

            {/* Subtitle / Provider in Cobalt/Orange */}
            <div className="overflow-hidden">
              <p className="text-xs font-mono font-bold text-brand-orange tracking-wider uppercase">
                {activeFilm.provider[language] || activeFilm.provider.en}
              </p>
            </div>

            {/* Grant & Deadline Meta */}
            <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-mono text-brand-mutedText">
              <span className="font-semibold text-brand-black tabular-nums">
                Grant: ₹{activeFilm.award_amount ? activeFilm.award_amount.toLocaleString('en-IN') : 'Full Fees'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-brand-storm" />
                <span>Deadline: {activeFilm.closing_date || 'Open confirmed IST'}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM MAGNETIC RING CURSOR */}
      <div 
        ref={cursorRef}
        className="custom-shelf-cursor default-mode hidden md:block"
      >
        <div className="cursor-ring" />
        <div className="cursor-dot" />
        <span ref={cursorLabelRef} className="cursor-label font-mono">
          {language === 'te' ? 'పరిశీలించండి' : language === 'hi' ? 'खोलें' : 'OPEN'}
        </span>
      </div>

      {/* FULL SCREEN PAPER SHEET DETAIL DIALOG (WAAPI Paper Growth & Ink Bleed) */}
      <div
        ref={detailRef}
        role="dialog"
        aria-modal="true"
        aria-label="Scholarship Dossier Full Record"
        className="fixed inset-0 z-50 bg-[#F4F2ED] overflow-y-auto"
        style={{ visibility: 'hidden' }}
      >
        {/* Detail Paper Grain Overlay */}
        <div className="paper-grain-overlay" />

        {/* Top Control Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 sm:px-12 py-6 bg-[#F4F2ED]/90 backdrop-blur-md border-b border-brand-border/60">
          <button
            onClick={closeDetail}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-brand-border bg-white text-xs font-mono font-bold text-brand-black shadow-subtle hover:bg-brand-black hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
            <span>CLOSE / 閉じる</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-brand-mutedText uppercase">OFFICIAL DOSSIER RECORD</span>
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${
                isSaved
                  ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                  : 'border-brand-border bg-white text-brand-black hover:bg-brand-storm-subtle'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-brand-orange text-brand-orange' : ''}`} />
              <span>{isSaved ? 'SAVED' : 'SAVE DOSSIER'}</span>
            </button>
          </div>
        </div>

        {/* Detail Content Grid */}
        {activeFilm && (
          <div className="max-w-6xl mx-auto px-6 sm:px-12 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 items-center min-h-[calc(100vh-100px)]">
            {/* Left Column: Masked Typography Rising Line by Line */}
            <div className="space-y-6">
              <div className="overflow-hidden">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-black text-brand-orange text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  {activeFilm.scheme_type.toUpperCase()} SCHOLARSHIP
                </span>
              </div>

              <div className="overflow-hidden">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-black font-display leading-tight tracking-tight">
                  {activeFilm.title[language] || activeFilm.title.en}
                </h1>
              </div>

              <div className="overflow-hidden">
                <p className="text-sm font-mono font-semibold text-brand-orange">
                  {activeFilm.provider[language] || activeFilm.provider.en}
                </p>
              </div>

              <div className="overflow-hidden">
                <p className="text-sm sm:text-base text-brand-mutedText leading-relaxed">
                  {activeFilm.description[language] || activeFilm.description.en}
                </p>
              </div>

              {/* Financial Grant & Eligibility Callout */}
              <div className="p-4 rounded-xl border border-brand-border bg-white/80 shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-brand-border/60">
                  <span className="text-xs font-mono text-brand-mutedText uppercase font-bold">ANNUAL ASSISTANCE</span>
                  <span className="text-lg font-bold text-brand-black font-display tabular-nums">
                    ₹{activeFilm.award_amount ? activeFilm.award_amount.toLocaleString('en-IN') : '100% Tuition Fee'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-mutedText">INCOME CEILING</span>
                  <span className="font-semibold text-brand-black">
                    {activeFilm.income_limit ? `Max ₹${activeFilm.income_limit.toLocaleString('en-IN')} / year` : 'No Income Cap'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <a
                  href={activeFilm.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-brand-black text-white text-xs font-bold font-mono tracking-wider uppercase shadow-subtle hover:bg-brand-orange transition-colors"
                >
                  <span>APPLY ON OFFICIAL PORTAL</span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <button
                  onClick={() => {
                    closeDetail();
                    navigate('/eligibility');
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-brand-border bg-white text-brand-black text-xs font-bold font-mono tracking-wider uppercase hover:bg-brand-storm-subtle transition-colors"
                >
                  CHECK MY ELIGIBILITY
                </button>
              </div>
            </div>

            {/* Right Column: Ragged Ink Bleed Official Poster */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[420px] aspect-[474/760] rounded-2xl overflow-hidden border border-brand-border shadow-elevated bg-white">
                <svg className="w-full h-full" viewBox="0 0 474 760">
                  <defs>
                    <mask id="inkRevealMask">
                      <rect width="100%" height="100%" fill="black" />
                      <g filter="url(#inkBleedFilter)">
                        {[
                          { cx: 150, cy: 300 },
                          { cx: 340, cy: 500 },
                          { cx: 250, cy: 120 },
                          { cx: 90, cy: 620 },
                          { cx: 390, cy: 220 },
                          { cx: 260, cy: 680 },
                          { cx: 230, cy: 400 },
                        ].map((pos, idx) => (
                          <circle
                            key={`blob-${idx}`}
                            ref={(el) => {
                              inkMaskBlobsRef.current[idx] = el;
                            }}
                            cx={pos.cx}
                            cy={pos.cy}
                            r="0"
                            fill="white"
                          />
                        ))}
                      </g>
                    </mask>
                  </defs>

                  {/* Masked Government Archival Graphics */}
                  <g mask="url(#inkRevealMask)">
                    <rect width="474" height="760" fill="#17191C" />
                    <circle cx="237" cy="280" r="140" fill="#F47B20" opacity="0.15" />
                    <text x="237" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="bold" fontFamily="Geist Sans, Inter">
                      GOVERNMENT OF INDIA
                    </text>
                    <text x="237" y="200" textAnchor="middle" fill="#747D87" fontSize="12" fontFamily="monospace">
                      OFFICIAL SCHOLARSHIP ARCHIVE
                    </text>
                    <text x="237" y="320" textAnchor="middle" fill="#F5F4F0" fontSize="18" fontWeight="bold" fontFamily="Newsreader, serif">
                      {activeFilm.title.en}
                    </text>
                    <text x="237" y="440" textAnchor="middle" fill="#F47B20" fontSize="28" fontWeight="bold" fontFamily="monospace">
                      ₹{activeFilm.award_amount ? activeFilm.award_amount.toLocaleString('en-IN') : 'GRANT'}
                    </text>
                    <text x="237" y="480" textAnchor="middle" fill="#DCE0E3" fontSize="12" fontFamily="monospace">
                      APPLICATION PORTAL VERIFIED
                    </text>
                    <line x1="80" y1="520" x2="394" y2="520" stroke="#747D87" strokeDasharray="4 4" />
                    <text x="237" y="580" textAnchor="middle" fill="#747D87" fontSize="10" fontFamily="monospace">
                      AUTHENTICATED RECORD • VIDYAPATH AI
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Cursor CSS */}
      <style>{`
        .custom-shelf-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 58px;
          height: 58px;
          margin-top: -29px;
          margin-left: -29px;
          pointer-events: none;
          z-index: 100;
          transition: transform 0.1s linear;
        }
        .cursor-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid #17191C;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s, background-color 0.3s;
        }
        .cursor-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          margin-top: -3px;
          margin-left: -3px;
          border-radius: 50%;
          background: #17191C;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .cursor-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9.5px;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.08em;
          opacity: 0;
          transform: scale(0);
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s;
        }
        .custom-shelf-cursor.spine-mode .cursor-ring {
          transform: scale(0.72);
        }
        .custom-shelf-cursor.open-mode .cursor-ring {
          transform: scale(1.6);
          background-color: #F47B20;
          border-color: #F47B20;
        }
        .custom-shelf-cursor.open-mode .cursor-dot {
          transform: scale(0);
        }
        .custom-shelf-cursor.open-mode .cursor-label {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
    </div>
  );
};
