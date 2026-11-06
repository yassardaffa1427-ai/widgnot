import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export type MascotMood = 'left' | 'center' | 'right' | 'up' | 'happy';

interface AIMascotAvatarProps {
  size?: number;
  isGenerating?: boolean;
  hasError?: boolean;
  onClick?: () => void;
}

/**
 * AIMascotAvatar: Pure Widgnot mascot (no outer rounded square container).
 * Matches user's exact specification: only the living, floating mascot with
 * animated eyebrows, expressive capsule eyes, lifelike glances & blinks,
 * cursor-following, and thinking animation during AI generation.
 */
export function AIMascotAvatar({
  size = 38,
  isGenerating = false,
  hasError = false,
  onClick,
}: AIMascotAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<MascotMood>('center');
  const [blinking, setBlink] = useState(false);
  const [squishing, setSquishing] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Springs for eye motion & eyebrow rotation/offset
  const eyeSpringX = useSpring(0, { stiffness: 280, damping: 22 });
  const eyeSpringY = useSpring(0, { stiffness: 280, damping: 22 });
  const browLeftRotate = useSpring(-6, { stiffness: 240, damping: 20 });
  const browRightRotate = useSpring(6, { stiffness: 240, damping: 20 });
  const browLeftY = useSpring(0, { stiffness: 240, damping: 20 });
  const browRightY = useSpring(0, { stiffness: 240, damping: 20 });

  // Mood & generating reactive animation
  useEffect(() => {
    if (hasError) {
      eyeSpringX.set(0);
      eyeSpringY.set(1);
      browLeftRotate.set(-22);
      browRightRotate.set(22);
      browLeftY.set(1);
      browRightY.set(1);
      return;
    }

    if (isGenerating) {
      // Thinking mood: eyes look slightly up and side-to-side
      browLeftRotate.set(-14);
      browRightRotate.set(10);
      browLeftY.set(-1.2);
      browRightY.set(-0.8);
      return;
    }

    if (mood === 'left') {
      eyeSpringX.set(-4);
      eyeSpringY.set(0);
      browLeftRotate.set(-2);
      browRightRotate.set(-18);
      browLeftY.set(0);
      browRightY.set(-0.8);
    } else if (mood === 'right') {
      eyeSpringX.set(4);
      eyeSpringY.set(0);
      browLeftRotate.set(18);
      browRightRotate.set(2);
      browLeftY.set(-0.8);
      browRightY.set(0);
    } else if (mood === 'up') {
      eyeSpringX.set(0);
      eyeSpringY.set(-2);
      browLeftRotate.set(-10);
      browRightRotate.set(10);
      browLeftY.set(-1.2);
      browRightY.set(-1.2);
    } else {
      // Center
      eyeSpringX.set(0);
      eyeSpringY.set(0);
      browLeftRotate.set(-6);
      browRightRotate.set(6);
      browLeftY.set(0);
      browRightY.set(0);
    }
  }, [mood, isGenerating, hasError, eyeSpringX, eyeSpringY, browLeftRotate, browRightRotate, browLeftY, browRightY]);

  // Thinking animation cycle when AI is generating
  useEffect(() => {
    if (!isGenerating) return;

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 4;
      if (step === 0) {
        eyeSpringX.set(-3);
        eyeSpringY.set(-1.8);
      } else if (step === 1) {
        eyeSpringX.set(0);
        eyeSpringY.set(-2.5);
      } else if (step === 2) {
        eyeSpringX.set(3);
        eyeSpringY.set(-1.8);
      } else {
        eyeSpringX.set(0);
        eyeSpringY.set(-0.8);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isGenerating, eyeSpringX, eyeSpringY]);

  // Natural lifelike blinking
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = (isGenerating ? 1800 : 3000) + Math.random() * 2600;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          if (Math.random() < 0.24) {
            setTimeout(() => {
              setBlink(true);
              setTimeout(() => {
                setBlink(false);
                scheduleBlink();
              }, 90);
            }, 100);
          } else {
            scheduleBlink();
          }
        }, 110);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timer);
  }, [isGenerating]);

  // Autonomous glance while idle
  useEffect(() => {
    if (isGenerating || hasError) return;

    let timer: ReturnType<typeof setTimeout>;
    const scheduleGlance = () => {
      const wait = 3000 + Math.random() * 4000;
      timer = setTimeout(() => {
        const moods: MascotMood[] = ['left', 'center', 'right', 'center', 'center'];
        const next = moods[Math.floor(Math.random() * moods.length)];
        setMood(next);
        scheduleGlance();
      }, wait);
    };

    scheduleGlance();
    return () => clearTimeout(timer);
  }, [isGenerating, hasError]);

  // Micro pointer tracking on hover
  useEffect(() => {
    if (isGenerating || hasError) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < 320) {
        if (dx < -25) {
          setMood('left');
        } else if (dx > 25) {
          setMood('right');
        } else {
          setMood('center');
        }
        const microX = Math.max(-2.8, Math.min(2.8, dx / 35));
        const microY = Math.max(-1.8, Math.min(2.2, dy / 45));
        eyeSpringY.set(microY);
        if (Math.abs(dx) <= 25) {
          eyeSpringX.set(microX);
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [isGenerating, hasError, eyeSpringX, eyeSpringY]);

  // Click bounce / poke
  const handlePoke = () => {
    setSquishing(true);
    setBlink(true);
    setTimeout(() => {
      setBlink(false);
      setSquishing(false);
    }, 240);
    onClick?.();
  };

  // Base scale calculation: design width 36px, height 32px
  const scale = size / 36;

  return (
    <div
      ref={containerRef}
      onClick={handlePoke}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Widgnot AI Mascot"
      style={{
        width: 36 * scale,
        height: 32 * scale,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        userSelect: 'none',
        cursor: 'pointer',
        background: 'transparent',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{
          y: squishing ? 2 * scale : hovered ? -1 * scale : 0,
          scaleY: squishing ? 0.82 : hovered ? 1.04 : 1,
          scaleX: squishing ? 1.14 : hovered ? 1.02 : 1,
        }}
        transition={{
          y: squishing ? { duration: 0.1 } : { duration: 0.2 },
          scaleY: { type: 'spring', stiffness: 450, damping: 18 },
          scaleX: { type: 'spring', stiffness: 450, damping: 18 },
        }}
        style={{
          width: 36 * scale,
          height: 32 * scale,
          position: 'relative',
        }}
      >
        {/* Eyebrows */}
        {/* Left Eyebrow */}
        <motion.div
          style={{
            position: 'absolute',
            left: 7 * scale,
            top: 0,
            width: 9 * scale,
            height: 2.6 * scale,
            borderRadius: 3 * scale,
            backgroundColor: '#d6dde7',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
            rotate: browLeftRotate,
            y: browLeftY,
            transformOrigin: 'center center',
          }}
        />

        {/* Right Eyebrow */}
        <motion.div
          style={{
            position: 'absolute',
            left: 20 * scale,
            top: 0,
            width: 9 * scale,
            height: 2.6 * scale,
            borderRadius: 3 * scale,
            backgroundColor: '#d6dde7',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
            rotate: browRightRotate,
            y: browRightY,
            transformOrigin: 'center center',
          }}
        />

        {/* Mascot Dome Head */}
        <div
          style={{
            position: 'absolute',
            left: 1.5 * scale,
            top: 6.5 * scale,
            width: 33 * scale,
            height: 25.5 * scale,
            borderRadius: `${14 * scale}px ${14 * scale}px ${11 * scale}px ${11 * scale}px`,
            background: hasError
              ? 'linear-gradient(180deg, #ff4d6d 0%, #ff758f 50%, #ffe5ec 100%)'
              : 'linear-gradient(180deg, #0084ff 0%, #38bdf8 35%, #e0f2fe 90%, #ffffff 100%)',
            boxShadow: hasError
              ? '0 3px 12px rgba(255, 77, 109, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.7)'
              : '0 3px 10px rgba(0, 132, 255, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
            overflow: 'hidden',
          }}
        >
          {/* Subtle interior glossy highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '12%',
              width: '76%',
              height: '42%',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Eyes Container */}
          <motion.div
            style={{
              position: 'absolute',
              top: 7 * scale,
              left: 0,
              right: 0,
              height: 10 * scale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5.5 * scale,
              x: eyeSpringX,
              y: eyeSpringY,
            }}
          >
            {/* Left Eye */}
            <motion.div
              animate={{
                scaleY: blinking ? 0.08 : 1,
              }}
              transition={{ duration: 0.08 }}
              style={{
                width: 3.4 * scale,
                height: 9 * scale,
                borderRadius: 4 * scale,
                backgroundColor: '#ffffff',
                boxShadow: '0 0.5px 1.5px rgba(0, 0, 0, 0.2)',
                transformOrigin: 'center center',
              }}
            />

            {/* Right Eye */}
            <motion.div
              animate={{
                scaleY: blinking ? 0.08 : 1,
              }}
              transition={{ duration: 0.08 }}
              style={{
                width: 3.4 * scale,
                height: 9 * scale,
                borderRadius: 4 * scale,
                backgroundColor: '#ffffff',
                boxShadow: '0 0.5px 1.5px rgba(0, 0, 0, 0.2)',
                transformOrigin: 'center center',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
