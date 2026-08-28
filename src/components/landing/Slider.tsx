import React, { useRef, useState, useEffect } from 'react';

const images = [
  '/dev/p-1.jpeg',
  '/dev/p-2.jpeg',
  '/dev/p-3.jpeg',
  '/dev/p-4.jpeg',
  '/dev/p-5.jpeg',
  '/dev/p-1.jpeg',
  '/dev/p-2.jpeg',
];

export default function Slider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsPressed(true);
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = () => {
    isDragging.current = false;
    setIsPressed(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('mouseleave', stopDragging);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('mouseleave', stopDragging);
    };
  }, []);

  return (
    <div className="relative mt-8">
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => {
          setIsHover(false);
          setIsPressed(false);
        }}
        onMouseDown={onMouseDown}
        className="flex gap-4 pl-8 md:pl-24 pr-10 overflow-x-auto cursor-none select-none hide-scrollbar py-4"
      >
        {images.map((path, idx) => (
          <div
            key={idx}
            className="shrink-0 relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 group shadow-lg"
          >
            <img
              src={path}
              alt="Telemetry Visual"
              className="h-[300px] sm:h-[380px] md:h-[440px] w-[260px] sm:w-[320px] md:w-[380px] object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
              <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest block">
                TELEMETRY SCAN 0{idx + 1}
              </span>
              <p className="font-semibold text-sm text-slate-200">
                Pirelli Compound Thermal Matrix
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Cursor Overlay */}
      {isHover && (
        <img
          src={isPressed ? '/grab.svg' : '/hand.svg'}
          alt="custom cursor"
          style={{
            position: 'fixed',
            left: cursorPos.x,
            top: cursorPos.y,
            width: 44,
            height: 44,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.6))',
          }}
        />
      )}
    </div>
  );
}
