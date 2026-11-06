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
 * AIMascotAvatar: Widgnot mascot inside a rounded avatar container (42×42).
 * Supports lifelike blinking, directional glancing, cursor following,
 * thinking animation during AI generation, and interactive squish on click.
 */
export function AIMascotAvatar({
  size = 42,
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
  const browLeftRotate = useSpring(-5, { stiffness: 240, damping: 20 });
  const browRightRotate = useSpring(5, { stiffness: 240, damping: 20 });
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
      browLeftY.set(-1.5);
      browRightY.set(-1);
      return;
    }

    if (mood === 'left') {
      eyeSpringX.set(-4.5);
      eyeSpringY.set(0);
      browLeftRotate.set(-2);
      browRightRotate.set(-18);
      browLeftY.set(0);
      browRightY.set(-0.8);
    } else if (mood === 'right') {
      eyeSpringX.set(4.5);
      eyeSpringY.set(0);
      browLeftRotate.set(18);
      browRightRotate.set(2);
      browLeftY.set(-0.8);
      browRightY.set(0);
    } else if (mood === 'up') {
      eyeSpringX.set(0);
      eyeSpringY.set(-2.5);
      browLeftRotate.set(-10);
      browRightRotate.set(10);
      browLeftY.set(-1.5);
      browRightY.set(-1.5);
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
        eyeSpringX.set(-3.5);
        eyeSpringY.set(-2);
      } else if (step === 1) {
        eyeSpringX.set(0);
        eyeSpringY.set(-2.8);
      } else if (step === 2) {
        eyeSpringX.set(3.5);
        eyeSpringY.set(-2);
      } else {
        eyeSpringX.set(0);
        eyeSpringY.set(-1);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isGenerating, eyeSpringX, eyeSpringY]);

  // Natural lifelike blinking
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = (isGenerating ? 1800 : 3200) + Math.random() * 2800;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          // Occasional double blink
          if (Math.random() < 0.22) {
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
        const microX = Math.max(-3, Math.min(3, dx / 35));
        const microY = Math.max(-2, Math.min(2.5, dy / 45));
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

  const scale = size / 42;

  return (
    <div
      ref={containerRef}
      onClick={handlePoke}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Widgnot AI Mascot"
      style={{
        width: size,
        height: size,
        borderRadius: 14 * scale,
        // Gradient dark navy with subtle top glow
        background: 'radial-gradient(circle at 50% 25%, #1e3a8a 0%, #0a0f1d 85%)',
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        userSelect: 'none',
        cursor: 'pointer',
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Background radial ambient glow behind mascot dome */}
      <div
        style={{
          position: 'absolute',
          top: 3 * scale,
          left: 5 * scale,
          right: 5 * scale,
          height: 28 * scale,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        animate={{
          y: squishing ? 2 * scale : hovered ? -1 * scale : 0,
          scaleY: squishing ? 0.8 : hovered ? 1.03 : 1,
          scaleX: squishing ? 1.15 : hovered ? 1.02 : 1,
        }}
        transition={{
          y: squishing ? { duration: 0.1 } : { duration: 0.2 },
          scaleY: { type: 'spring', stiffness: 450, damping: 18 },
          scaleX: { type: 'spring', stiffness: 450, damping: 18 },
        }}
        style={{
          width: 42 * scale,
          height: 42 * scale,
          position: 'relative',
        }}
      >
        {/* Eyebrows Container */}
        {/* Left Eyebrow */}
        <motion.div
          style={{
            position: 'absolute',
            left: 12.5 * scale,
            top: 7.5 * scale,
            width: 7.5 * scale,
            height: 2.2 * scale,
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
            left: 22 * scale,
            top: 7.5 * scale,
            width: 7.5 * scale,
            height: 2.2 * scale,
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
            left: 6.5 * scale,
            top: 13.5 * scale,
            width: 29 * scale,
            height: 23 * scale,
            borderRadius: `${12 * scale}px ${12 * scale}px ${10 * scale}px ${10 * scale}px`,
            background: hasError
              ? 'linear-gradient(180deg, #ff4d6d 0%, #ff758f 50%, #ffe5ec 100%)'
              : 'linear-gradient(180deg, #38bdf8 0%, #60a5fa 50%, #dbeafe 100%)',
            boxShadow: hasError
              ? '0 4px 12px rgba(255, 77, 109, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.7)'
              : '0 4px 12px rgba(56, 189, 248, 0.45), inset 0 1.2px 2px rgba(255, 255, 255, 0.75)',
            overflow: 'hidden',
          }}
        >
          {/* Subtle interior glossy sheen */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              width: '80%',
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
              top: 6 * scale,
              left: 0,
              right: 0,
              height: 9 * scale,
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
                width: 3.2 * scale,
                height: 8 * scale,
                borderRadius: 4 * scale,
                backgroundColor: '#ffffff',
                boxShadow: '0 0.5px 1.5px rgba(0, 0, 0, 0.25)',
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
                width: 3.2 * scale,
                height: 8 * scale,
                borderRadius: 4 * scale,
                backgroundColor: '#ffffff',
                boxShadow: '0 0.5px 1.5px rgba(0, 0, 0, 0.25)',
                transformOrigin: 'center center',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

