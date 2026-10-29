import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export type MascotMood = 'left' | 'center' | 'right';
export type MascotUrgency = 'normal' | 'warning' | 'angry';

interface MascotProps {
  size?: number;
  interactive?: boolean;
  forcedMood?: MascotMood;
  urgency?: MascotUrgency;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Widgnot Living Mascot from Figma nodes:
 * - 13:1817: state=1 (curious, looking left, right eyebrow slanted)
 * - 16:1921: state=2 (focused, looking right, eyebrows angled inward)
 * - 18:1927: state=3 (gentle, looking center, balanced eyebrows)
 * - Urgency 'warning': orange/yellow head with warning eyebrows
 * - Urgency 'angry': red head with angry eyebrows & agitation
 */
export function Mascot({
  size = 84,
  interactive = true,
  forcedMood,
  urgency = 'normal',
  onClick,
}: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<MascotMood>(forcedMood || 'center');
  const [blinking, setBlink] = useState(false);
  const [squishing, setSquishing] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Springs for eye and eyebrow transitions
  const eyeSpringX = useSpring(0, { stiffness: 260, damping: 22 });
  const eyeSpringY = useSpring(0, { stiffness: 260, damping: 22 });
  const browLeftRotate = useSpring(-7.8, { stiffness: 240, damping: 20 });
  const browRightRotate = useSpring(5.8, { stiffness: 240, damping: 20 });
  const browLeftX = useSpring(0, { stiffness: 240, damping: 20 });
  const browRightX = useSpring(0, { stiffness: 240, damping: 20 });
  const browLeftY = useSpring(0, { stiffness: 240, damping: 20 });
  const browRightY = useSpring(0, { stiffness: 240, damping: 20 });

  // Update springs to match Figma nodes & urgency
  useEffect(() => {
    if (urgency === 'angry') {
      eyeSpringX.set(0);
      eyeSpringY.set(1);
      browLeftRotate.set(-28);
      browRightRotate.set(28);
      browLeftX.set(2);
      browRightX.set(-2);
      browLeftY.set(2);
      browRightY.set(2);
      return;
    }

    if (urgency === 'warning') {
      eyeSpringX.set(0);
      eyeSpringY.set(0);
      browLeftRotate.set(-24);
      browRightRotate.set(24);
      browLeftX.set(1.5);
      browRightX.set(-1.5);
      browLeftY.set(1.5);
      browRightY.set(1.5);
      return;
    }

    const activeMood = forcedMood || mood;
    if (activeMood === 'left') {
      // Figma node 13:1817 (state 1: looking left)
      eyeSpringX.set(-11);
      eyeSpringY.set(0);
      browLeftRotate.set(-2.5);
      browRightRotate.set(-30.8);
      browLeftX.set(-4.7);
      browRightX.set(-4);
      browLeftY.set(0.6);
      browRightY.set(-2);
    } else if (activeMood === 'right') {
      // Figma node 16:1921 (state 2: looking right)
      eyeSpringX.set(10);
      eyeSpringY.set(0);
      browLeftRotate.set(7.4);
      browRightRotate.set(-7.8);
      browLeftX.set(8);
      browRightX.set(7);
      browLeftY.set(0);
      browRightY.set(0.3);
    } else {
      // Figma node 18:1927 (state 3: looking center)
      eyeSpringX.set(0);
      eyeSpringY.set(0);
      browLeftRotate.set(-7.8);
      browRightRotate.set(5.8);
      browLeftX.set(0);
      browRightX.set(0);
      browLeftY.set(0);
      browRightY.set(0);
    }
  }, [
    mood,
    forcedMood,
    urgency,
    eyeSpringX,
    eyeSpringY,
    browLeftRotate,
    browRightRotate,
    browLeftX,
    browRightX,
    browLeftY,
    browRightY,
  ]);

  // Natural lifelike blinking
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = (urgency === 'angry' ? 1400 : 2500) + Math.random() * 3000;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setBlink(true);
              setTimeout(() => {
                setBlink(false);
                scheduleBlink();
              }, 100);
            }, 120);
          } else {
            scheduleBlink();
          }
        }, 120);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timer);
  }, [urgency]);

  // Autonomous idle glances
  useEffect(() => {
    if (forcedMood || urgency !== 'normal') return;
    let glanceTimer: ReturnType<typeof setTimeout>;

    const scheduleGlance = () => {
      const wait = 3800 + Math.random() * 4200;
      glanceTimer = setTimeout(() => {
        const moods: MascotMood[] = ['left', 'center', 'right', 'center'];
        const chosen = moods[Math.floor(Math.random() * moods.length)];
        setMood(chosen);
        scheduleGlance();
      }, wait);
    };

    scheduleGlance();
    return () => clearTimeout(glanceTimer);
  }, [forcedMood, urgency]);

  // Interactive mouse tracking
  useEffect(() => {
    if (!interactive || forcedMood || urgency !== 'normal') return;

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < 600) {
        if (dx < -40) {
          setMood('left');
        } else if (dx > 40) {
          setMood('right');
        } else {
          setMood('center');
        }

        const microX = Math.max(-4, Math.min(4, dx / 40));
        const microY = Math.max(-2, Math.min(3, dy / 60));
        eyeSpringY.set(microY);
        if (Math.abs(dx) <= 40) {
          eyeSpringX.set(microX);
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [interactive, forcedMood, urgency, eyeSpringX, eyeSpringY]);

  // Poke reaction
  const handlePoke = (e: React.MouseEvent) => {
    setSquishing(true);
    setBlink(true);
    setTimeout(() => {
      setBlink(false);
      setSquishing(false);
    }, 280);
    onClick?.(e);
  };

  const scale = size / 84;

  const bodyGradient =
    urgency === 'angry'
      ? 'linear-gradient(180deg, #FF334B 0%, #FF6B81 55%, #FFFFFF 100%)'
      : urgency === 'warning'
      ? 'linear-gradient(180deg, #FFA000 0%, #FFD54F 55%, #FFFFFF 100%)'
      : 'linear-gradient(180deg, #0088ff 0%, #ffffff 100%)';

  const bodyShadow =
    urgency === 'angry'
      ? '0 6px 20px rgba(255, 51, 75, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.15)'
      : urgency === 'warning'
      ? '0 6px 20px rgba(255, 160, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.15)'
      : '0 6px 20px rgba(0, 136, 255, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.15)';

  return (
    <div
      ref={containerRef}
      onClick={handlePoke}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Widgnot Mascot"
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      <motion.div
        animate={{
          y: squishing ? 4 : hovered ? -3 : [0, -2.5, 0],
          x: urgency === 'angry' ? [-0.6, 0.6, -0.6] : 0,
          scaleY: squishing ? 0.76 : hovered ? 1.04 : 1,
          scaleX: squishing ? 1.22 : hovered ? 1.02 : 1,
        }}
        transition={{
          y: squishing ? { duration: 0.12 } : { repeat: hovered ? 0 : Infinity, duration: 3.2, ease: 'easeInOut' },
          x: urgency === 'angry' ? { repeat: Infinity, duration: 0.18, ease: 'linear' } : undefined,
          scaleY: { type: 'spring', stiffness: 420, damping: 16 },
          scaleX: { type: 'spring', stiffness: 420, damping: 16 },
        }}
        style={{
          width: 84 * scale,
          height: 84 * scale,
          position: 'relative',
        }}
      >
        {/* Eyebrows Layer */}
        {/* Left Eyebrow (Figma default anchor at x: 25, y: 10) */}
        <motion.div
          style={{
            position: 'absolute',
            left: 25 * scale,
            top: 10 * scale,
            width: 14 * scale,
            height: 4 * scale,
            borderRadius: 11 * scale,
            backgroundColor: '#d9d9d9',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
            rotate: browLeftRotate,
            x: browLeftX,
            y: browLeftY,
            transformOrigin: 'center center',
          }}
        />

        {/* Right Eyebrow (Figma default anchor at x: 45, y: 10) */}
        <motion.div
          style={{
            position: 'absolute',
            left: 45 * scale,
            top: 10 * scale,
            width: 14 * scale,
            height: 4 * scale,
            borderRadius: 11 * scale,
            backgroundColor: '#d9d9d9',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
            rotate: browRightRotate,
            x: browRightX,
            y: browRightY,
            transformOrigin: 'center center',
          }}
        />

        {/* Mascot Dome Body (w: 60, h: 50, r: 22, left: 12, top: 22) */}
        <motion.div
          animate={{
            background: bodyGradient,
            boxShadow: bodyShadow,
          }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            left: 12 * scale,
            top: 22 * scale,
            width: 60 * scale,
            height: 50 * scale,
            borderRadius: 22 * scale,
            overflow: 'hidden',
          }}
        >
          {/* Subtle interior gloss */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '8%',
              width: '84%',
              height: '38%',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Eyes Container (Anchored at top: 13 inside body, height: 14) */}
          <motion.div
            style={{
              position: 'absolute',
              top: 13 * scale,
              left: 0,
              right: 0,
              height: 14 * scale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10 * scale,
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
                width: 6 * scale,
                height: 14 * scale,
                borderRadius: 11 * scale,
                backgroundColor: '#d9d9d9',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
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
                width: 6 * scale,
                height: 14 * scale,
                borderRadius: 11 * scale,
                backgroundColor: '#d9d9d9',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                transformOrigin: 'center center',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
