import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import styles from './DevelopmentPuppet.module.css';

interface DevelopmentPuppetProps {
  onInteraction?: () => void;
}

interface Point {
  x: number;
  y: number;
}

const NEUTRAL_POINT: Point = { x: 0, y: 0 };

export function DevelopmentPuppet({ onInteraction }: DevelopmentPuppetProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [pointer, setPointer] = useState<Point>(NEUTRAL_POINT);
  const [isReacting, setIsReacting] = useState(false);

  const resetPointer = useCallback(() => {
    setPointer(NEUTRAL_POINT);
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    setPointer({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const react = useCallback(() => {
    setIsReacting(true);
    onInteraction?.();
  }, [onInteraction]);

  useEffect(() => {
    if (!isReacting) {
      return;
    }

    const timeout = window.setTimeout(() => setIsReacting(false), 720);
    return () => window.clearTimeout(timeout);
  }, [isReacting]);

  return (
    <button
      ref={rootRef}
      type="button"
      className={styles.puppet}
      data-reacting={isReacting || undefined}
      style={
        {
          '--look-x': pointer.x,
          '--look-y': pointer.y,
        } as React.CSSProperties
      }
      aria-label="与开发中的花谱 2D 角色互动"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
      onClick={react}
    >
      <svg
        className={styles.artwork}
        viewBox="0 0 680 900"
        role="img"
        aria-labelledby="kaf-puppet-title kaf-puppet-description"
      >
        <title id="kaf-puppet-title">花谱主题开发用 2D puppet</title>
        <desc id="kaf-puppet-description">
          项目自制的黑发粉色眼睛二维角色原型，会眨眼、呼吸并跟随指针转动视线。
        </desc>

        <defs>
          <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a2530" />
            <stop offset="0.62" stopColor="#17171b" />
            <stop offset="1" stopColor="#3c2c42" />
          </linearGradient>
          <linearGradient id="hair" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#312c36" />
            <stop offset="0.48" stopColor="#17161b" />
            <stop offset="1" stopColor="#09090c" />
          </linearGradient>
          <radialGradient id="cheek" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#d97891" stopOpacity="0.2" />
            <stop offset="1" stopColor="#d97891" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className={styles.breatheGroup}>
          <path
            className={styles.backHair}
            d="M160 302C173 129 269 62 347 70c118 11 188 108 178 265-7 113-4 217 48 348-72 33-141 51-216 48-93-3-180-30-248-80 53-112 58-245 51-349Z"
            fill="url(#hair)"
          />

          <path
            className={styles.body}
            d="M216 598c36-39 75-58 126-58 52 0 97 19 135 57 42 42 72 131 91 251H119c21-122 54-207 97-250Z"
            fill="url(#dress)"
          />
          <path d="M303 531h81l16 80-57 46-58-45 18-81Z" fill="#f0d6ce" />
          <path
            d="M277 590c22 28 43 45 66 50 24-6 46-23 67-51l27 19-39 79-54-22-55 23-38-80 26-18Z"
            fill="#ece8e5"
          />
          <path d="M343 640 378 687 345 798 310 688l33-48Z" fill="#a92e55" />
          <path
            d="M259 601c-45 60-69 142-82 247h-58c18-120 51-208 97-250 21-18 35-25 43-27v30Zm169 0c43 59 68 142 83 247h57c-19-120-50-206-91-251-21-18-36-26-46-27l-3 31Z"
            fill="#232128"
          />

          <g className={styles.headGroup}>
            <ellipse cx="340" cy="358" rx="142" ry="180" fill="#f1d9d0" />
            <ellipse cx="255" cy="401" rx="55" ry="38" fill="url(#cheek)" />
            <ellipse cx="429" cy="401" rx="55" ry="38" fill="url(#cheek)" />

            <g className={styles.eyes}>
              <g transform="translate(0 0)">
                <path
                  d="M238 354c25-21 61-22 87 0-28 30-61 32-87 0Z"
                  fill="#fffdfb"
                />
                <ellipse
                  className={styles.iris}
                  cx="282"
                  cy="356"
                  rx="16"
                  ry="22"
                  fill="#aa365d"
                />
                <ellipse
                  className={styles.pupil}
                  cx="282"
                  cy="358"
                  rx="7"
                  ry="12"
                  fill="#21161f"
                />
                <circle
                  className={styles.eyeHighlight}
                  cx="276"
                  cy="348"
                  r="5"
                  fill="#fff"
                />
                <path
                  className={styles.eyelid}
                  d="M237 354c24-19 62-20 89 0-26 3-63 4-89 0Z"
                  fill="#2d2730"
                />
              </g>
              <g>
                <path
                  d="M355 354c27-22 64-20 89 1-26 31-61 30-89-1Z"
                  fill="#fffdfb"
                />
                <ellipse
                  className={styles.iris}
                  cx="399"
                  cy="356"
                  rx="16"
                  ry="22"
                  fill="#aa365d"
                />
                <ellipse
                  className={styles.pupil}
                  cx="399"
                  cy="358"
                  rx="7"
                  ry="12"
                  fill="#21161f"
                />
                <circle
                  className={styles.eyeHighlight}
                  cx="393"
                  cy="348"
                  r="5"
                  fill="#fff"
                />
                <path
                  className={styles.eyelid}
                  d="M354 354c26-19 64-19 91 1-28 2-64 3-91-1Z"
                  fill="#2d2730"
                />
              </g>
            </g>

            <path
              d="M331 399c4 4 10 5 17 1"
              fill="none"
              stroke="#c58a80"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              className={styles.mouth}
              d="M319 438c16 9 34 9 49 0"
              fill="none"
              stroke="#9c4b59"
              strokeLinecap="round"
              strokeWidth="5"
            />

            <path
              d="M196 302c4-107 65-193 164-202 85-8 163 43 183 137-37-45-72-59-105-63-7 80-79 105-168 111-20 40-36 89-44 146-26-44-37-84-30-129Z"
              fill="url(#hair)"
            />
            <path
              d="M295 126c-28 47-45 98-49 151 36-6 69-15 95-32 24-16 42-39 53-71-15-30-53-49-99-48Z"
              fill="#28232d"
            />
            <path
              d="M436 171c18 84 28 178 14 277 35-64 50-128 43-193-4-38-20-66-57-84Z"
              fill="#131216"
            />

            <g className={styles.hairAccent}>
              <path
                d="M216 222c-28 28-46 57-54 88"
                fill="none"
                stroke="#c3486c"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <path
                d="M467 228c25 24 43 52 54 84"
                fill="none"
                stroke="#745c8f"
                strokeLinecap="round"
                strokeWidth="7"
              />
            </g>

            <g className={styles.flower} transform="translate(470 188)">
              <ellipse cx="0" cy="-25" rx="13" ry="29" fill="#d97798" />
              <ellipse
                cx="24"
                cy="-6"
                rx="13"
                ry="29"
                fill="#d95d85"
                transform="rotate(68 24 -6)"
              />
              <ellipse
                cx="15"
                cy="22"
                rx="13"
                ry="29"
                fill="#b84d75"
                transform="rotate(142 15 22)"
              />
              <ellipse
                cx="-16"
                cy="22"
                rx="13"
                ry="29"
                fill="#78608f"
                transform="rotate(-142 -16 22)"
              />
              <ellipse
                cx="-25"
                cy="-7"
                rx="13"
                ry="29"
                fill="#9c5c91"
                transform="rotate(-69 -25 -7)"
              />
              <circle r="12" fill="#f0d3b7" />
            </g>
          </g>
        </g>
      </svg>

      <span className={styles.interactionHint} aria-hidden="true">
        TOUCH / LOOK
      </span>
    </button>
  );
}
