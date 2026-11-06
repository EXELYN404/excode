import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';

import onboarding1 from '../../assets/onboarding-1.png';
import onboarding2 from '../../assets/onboarding-2.png';
import onboarding3 from '../../assets/onboarding-3.png';

import wordmarkWhite from '../../assets/excode/wordmark-dark.png';
import wordmarkBlack from '../../assets/excode/wordmark-light.png';

import { useTheme } from '../../themes/ThemeContext';

interface Props {
  onStart: () => void;
  onSkip: () => void;
}

const SLIDES = [
  {
    image: onboarding1,
    title: 'A Modern Workspace',
    description: 'Organize your work with an elegant and minimal interface.',
  },
  {
    image: onboarding2,
    title: 'Powerful Features',
    description: 'Boost your productivity with intelligent features and seamless tools.',
  },
  {
    image: onboarding3,
    title: 'Build Without Limits',
    description: 'Customize, extend, and create with a flexible platform.',
  },
];

export default function WelcomePage({ onStart, onSkip }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(
    () => localStorage.getItem('excode-onboarding') === 'true'
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { theme } = useTheme();
  const isDark = theme.type === 'dark';

  const colors = {
    background: isDark ? '#080808' : '#F7F7F7',
    foreground: isDark ? '#F4F4F4' : '#171717',
    muted: isDark ? '#A0A0A0' : '#707070',
    surface: isDark ? '#171717' : '#FFFFFF',
    border: isDark ? '#454545' : '#D7D7D7',
    inactive: isDark ? '#686868' : '#B8B8B8',
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startInterval = () => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % SLIDES.length);
    }, 3500);
  };

  const goTo = (index: number) => {
    setSlideIdx((index + SLIDES.length) % SLIDES.length);
    startInterval();
  };

  useEffect(() => {
    startInterval();
    return stopInterval;
  }, []);

  const previous = (slideIdx + SLIDES.length - 1) % SLIDES.length;
  const next = (slideIdx + 1) % SLIDES.length;

  function toggleDontShow(checked: boolean) {
    setDontShowAgain(checked);
    if (checked) {
      localStorage.setItem('excode-onboarding', 'true');
    } else {
      localStorage.removeItem('excode-onboarding');
    }
  }

  return (
    <div
      className="excode-welcome-page"
      style={{
        background: colors.background,
        color: colors.foreground,
      }}
    >
      <div className="excode-welcome-ambient" aria-hidden="true">
        <div className="excode-welcome-orbit excode-welcome-orbit-top" />
        <div className="excode-welcome-orbit excode-welcome-orbit-bottom" />
        <div className="excode-welcome-glow" />
      </div>

      <header className="excode-welcome-header">
        <img
          src={isDark ? wordmarkWhite : wordmarkBlack}
          alt="EXCODE"
          draggable={false}
          className="excode-welcome-logo"
        />

        <h1>
          Welcome to <span>ExCode!</span>
        </h1>

        <p>
          A modern, powerful, and extensible code editor.
          <br />
          Let's get started with a quick tour.
        </p>
      </header>

      <main className="excode-welcome-main">
        <div className="excode-welcome-carousel">
          <button
            type="button"
            aria-label="Previous preview"
            onClick={() => goTo(previous)}
            className="excode-welcome-arrow excode-welcome-arrow-left"
            style={{ color: colors.foreground }}
          >
            <ChevronLeft size={23} />
          </button>

          <div className="excode-welcome-cards">
            {[previous, slideIdx, next].map((slide, position) => {
              const active = position === 1;
              const item = SLIDES[slide];

              return (
                <button
                  key={`${position}-${slide}`}
                  type="button"
                  aria-label={`Show preview ${slide + 1}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => goTo(slide)}
                  className={`excode-welcome-card${active ? ' is-active' : ' is-side'}`}
                  style={{
                    background: colors.surface,
                    color: colors.foreground,
                    borderColor: active ? '#AFAFAF' : colors.border,
                  }}
                >
                  <div className="excode-welcome-card-copy">
                    <span className="excode-welcome-card-number">
                      {String(slide + 1).padStart(2, '0')} / 03
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>

                  <div className="excode-welcome-card-image">
                    <img
                      src={item.image}
                      alt={`EXCODE preview ${slide + 1}`}
                      draggable={false}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Next preview"
            onClick={() => goTo(next)}
            className="excode-welcome-arrow excode-welcome-arrow-right"
            style={{ color: colors.foreground }}
          >
            <ChevronRight size={23} />
          </button>
        </div>

        <div
          role="group"
          aria-label="Preview pagination"
          className="excode-welcome-pagination"
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to preview ${i + 1}`}
              aria-current={i === slideIdx ? 'true' : undefined}
              onClick={() => goTo(i)}
              className={`excode-welcome-dot${i === slideIdx ? ' is-active' : ''}`}
            />
          ))}
        </div>
      </main>

      <footer className="excode-welcome-footer">
        <button
          type="button"
          role="checkbox"
          aria-checked={dontShowAgain}
          onClick={() => toggleDontShow(!dontShowAgain)}
          className="excode-welcome-checkbox"
          style={{ color: colors.muted }}
        >
          <span
            className="excode-welcome-checkbox-box"
            style={{
              borderColor: dontShowAgain ? '#BEBEBE' : colors.inactive,
              background: dontShowAgain ? '#777777' : 'transparent',
            }}
          >
            {dontShowAgain && <Check size={12} strokeWidth={3} />}
          </span>
          Don't show this again
        </button>

        <div className="excode-welcome-actions">
          <button
            type="button"
            onClick={onSkip}
            className="excode-welcome-skip"
            style={{
              color: colors.foreground,
              borderColor: colors.border,
            }}
          >
            Skip
          </button>

          <button
            type="button"
            onClick={onStart}
            className="excode-welcome-start"
          >
            Get Started <ArrowRight size={17} />
          </button>
        </div>
      </footer>
    </div>
  );
}
