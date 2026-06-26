import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import Eyebrow from '../ui/Eyebrow';
import Button from '../ui/Button';
import { venue, storyCaptions } from '../../data/content';

export default function Hero({ ready }) {
  const root = useRef(null);
  const videoRef = useRef(null);
  const introRef = useRef(null); // wrapper faded out as the tour scrubs
  const introTlRef = useRef(null); // reveal timeline (plays when preloader lifts)
  const captionRefs = useRef([]);
  const progressRef = useRef(null);

  // Resolve motion preference synchronously so markup/behaviour agree on the
  // first render (a lazy effect-set state would desync the section height).
  const [reduce] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const section = root.current;
    const video = videoRef.current;
    const introBox = introRef.current;
    if (!section || !video) return undefined;

    const caps = captionRefs.current;
    const clamp = gsap.utils.clamp;

    // ---- Intro reveal (built paused, played once `ready`) ----
    const lines = section.querySelectorAll('.hero-line > span');
    gsap.set(lines, { yPercent: reduce ? 0 : 110 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.to(lines, { yPercent: 0, duration: 1.2, stagger: 0.12 })
      .from(section.querySelector('.hero-eyebrow'), { y: 20, opacity: 0, duration: 0.8 }, '-=0.9')
      .from(section.querySelector('.hero-sub'), { y: 20, opacity: 0, duration: 0.8 }, '-=0.7')
      .from(section.querySelector('.hero-cta'), { y: 20, opacity: 0, duration: 0.8 }, '-=0.7')
      .from(section.querySelector('.hero-scroll'), { opacity: 0, duration: 0.8 }, '-=0.5');
    introTlRef.current = tl;
    if (reduce) tl.progress(1);

    const setActiveCaption = (p) => {
      // Intro owns the first ~20%; the three captions share the rest.
      const idx = p < 0.2 ? -1 : p < 0.46 ? 0 : p < 0.73 ? 1 : 2;
      caps.forEach((cap, i) => {
        if (!cap) return;
        const on = i === idx;
        cap.style.opacity = on ? '1' : '0';
        cap.style.transform = `translate(-50%, -50%) translateY(${on ? 0 : 20}px)`;
      });
    };
    setActiveCaption(0);

    // ---- Reduced motion: gentle looping background, no scrub ----
    if (reduce) {
      video.loop = true;
      const pr = video.play();
      if (pr && pr.then) pr.catch(() => {});
      return () => {
        tl.kill();
        gsap.killTweensOf(lines);
      };
    }

    // ---- Scroll-scrubbed video + choreographed content ----
    let scrubTween;
    const setup = () => {
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) return;
      scrubTween = gsap.to(video, {
        currentTime: duration - 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            if (introBox) {
              const ip = clamp(0, 1, p / 0.16); // fade intro across first 16%
              introBox.style.opacity = String(1 - ip);
              introBox.style.transform = `translateY(${ip * -48}px)`;
              introBox.style.pointerEvents = ip > 0.6 ? 'none' : 'auto';
            }
            setActiveCaption(p);
            if (progressRef.current) progressRef.current.style.width = `${(p * 100).toFixed(1)}%`;
          },
        },
      });
      ScrollTrigger.refresh();
    };

    video.pause();
    const prime = () => {
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      setup();
    };
    if (video.readyState >= 1) prime();
    else video.addEventListener('loadedmetadata', prime, { once: true });

    // Some browsers won't seek until the media has been played once.
    const unlock = () => {
      const pr = video.play();
      if (pr && pr.then) pr.then(() => video.pause()).catch(() => {});
    };
    video.addEventListener('canplay', unlock, { once: true });

    return () => {
      video.removeEventListener('loadedmetadata', prime);
      video.removeEventListener('canplay', unlock);
      scrubTween?.scrollTrigger?.kill();
      scrubTween?.kill();
      tl.kill();
      gsap.killTweensOf(lines);
    };
  }, [reduce]);

  // Play the intro once the preloader has lifted.
  useEffect(() => {
    if (ready) introTlRef.current?.play();
  }, [ready]);

  return (
    <section
      id="home"
      ref={root}
      className={`relative bg-forest ${reduce ? 'min-h-[100svh]' : 'h-[320vh]'}`}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {/* Scrubbing video background */}
        <video
          ref={videoRef}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          src={venue.video}
          poster={venue.poster}
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(35,46,22,0.6),rgba(35,46,22,0.2)_38%,rgba(35,46,22,0.72)),linear-gradient(90deg,rgba(35,46,22,0.5),transparent_62%)]" />

        {/* Intro (first screen) */}
        <div ref={introRef} className="px-6 sm:px-10 lg:px-24">
          <div className="max-w-3xl text-white">
            <Eyebrow light className="hero-eyebrow mb-5">
              A Premier Celebration Venue
            </Eyebrow>

            <h1 className="mb-6 font-serif text-[clamp(3rem,9vw,7rem)] font-medium leading-[0.98] tracking-tight">
              {['Where', 'Forever', 'Begins'].map((word, i) => (
                <span key={word} className="hero-line block overflow-hidden">
                  <span className={`block ${i === 1 ? 'italic text-gold-glow' : ''}`}>{word}</span>
                </span>
              ))}
            </h1>

            <p className="hero-sub mb-9 max-w-lg text-[clamp(1rem,1.6vw,1.2rem)] font-light opacity-90">
              Grand weddings, joyful receptions and unforgettable celebrations — hosted in timeless
              elegance at the heart of Yeola.
            </p>

            <div className="hero-cta flex flex-wrap gap-4">
              <Button href="#contact">Book Your Date</Button>
              <Button href="#about" variant="ghost">
                Take the Tour
              </Button>
            </div>
          </div>

          <div className="hero-scroll absolute bottom-8 left-6 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.25em] text-white/85 sm:left-10 lg:left-24">
            <span>Scroll</span>
            <span className="relative h-px w-14 overflow-hidden bg-white/60">
              <span className="absolute inset-0 animate-scrollLine bg-gold-glow" />
            </span>
          </div>
        </div>

        {/* Captions revealed over the scrubbing tour */}
        {!reduce && (
          <div className="pointer-events-none absolute inset-0 z-10">
            {storyCaptions.map((cap, i) => (
              <div
                key={cap.eyebrow}
                ref={(el) => (captionRefs.current[i] = el)}
                style={{ opacity: 0, transition: 'opacity .6s ease, transform .6s ease' }}
                className="absolute left-1/2 top-1/2 w-[min(90vw,760px)] -translate-x-1/2 -translate-y-1/2 text-center text-white"
              >
                <Eyebrow light center className="mb-4">
                  {cap.eyebrow}
                </Eyebrow>
                <h2 className="font-serif text-[clamp(2rem,6vw,4.4rem)] font-medium leading-[1.05]">
                  {cap.title[0]}
                  <br />
                  {cap.title[1]}
                </h2>
              </div>
            ))}
          </div>
        )}

        {/* Tour progress (full-bleed bottom line) */}
        {!reduce && (
          <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/15">
            <span ref={progressRef} className="block h-full w-0 bg-gradient-to-r from-gold to-gold-glow" />
          </div>
        )}
      </div>
    </section>
  );
}
