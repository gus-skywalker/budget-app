<template>
  <div class="hero-narrative" :class="{ 'reduce-motion': prefersReducedMotion }">
    <div class="hero-narrative-panel" aria-hidden="true">
      <div class="hero-narrative-stack">
        <img
          v-for="(frame, index) in frames"
          :key="frame.id"
          class="hero-narrative-frame"
          :class="{ active: index === activeIndex }"
          :src="frame.src"
          :alt="frame.alt"
          decoding="async"
          loading="eager"
          draggable="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
const FRAME_SEQUENCE = [
  {
    id: 'problem',
    src: '/landing-assets/problem-financial-doubt.png',
    alt: 'Financial uncertainty and conflicting opinions.',
    durationMs: 2000,
  },
  {
    id: 'insight',
    src: '/landing-assets/insight-moment.png',
    alt: 'The insight: simulate the decision first.',
    durationMs: 2000,
  },
  {
    id: 'product',
    src: '/landing-assets/cobudget_final_motion.gif',
    alt: 'CoBudget simulation in action.',
    durationMs: 3000,
  },
  {
    id: 'result',
    src: '/landing-assets/hero-decision-impact.png',
    alt: 'Clear impact and decision confidence.',
    durationMs: 2000,
  },
  {
    id: 'relief',
    src: '/landing-assets/financial-relief.png',
    alt: 'Relief after aligning on a decision.',
    durationMs: 2000,
  },
]

export default {
  name: 'HeroNarrative',
  data() {
    return {
      activeIndex: 0,
      prefersReducedMotion: false,
      timeoutId: null,
      mediaQuery: null,
      visibilityHandler: null,
    }
  },
  computed: {
    frames() {
      return FRAME_SEQUENCE
    },
  },
  mounted() {
    if (typeof window === 'undefined') return

    this.mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') || null
    this.updateReducedMotionPreference(this.mediaQuery?.matches)

    if (this.mediaQuery?.addEventListener) {
      this.mediaQuery.addEventListener('change', this.handleReducedMotionChange)
    } else if (this.mediaQuery?.addListener) {
      this.mediaQuery.addListener(this.handleReducedMotionChange)
    }

    this.visibilityHandler = () => {
      if (document.hidden) {
        this.stop()
      } else {
        this.start()
      }
    }
    document.addEventListener('visibilitychange', this.visibilityHandler, { passive: true })

    this.start()
  },
  beforeUnmount() {
    this.stop()

    if (this.mediaQuery?.removeEventListener) {
      this.mediaQuery.removeEventListener('change', this.handleReducedMotionChange)
    } else if (this.mediaQuery?.removeListener) {
      this.mediaQuery.removeListener(this.handleReducedMotionChange)
    }

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }
  },
  methods: {
    handleReducedMotionChange(event) {
      const matches = Boolean(event?.matches)
      this.updateReducedMotionPreference(matches)
      this.start()
    },
    updateReducedMotionPreference(isReduced) {
      this.prefersReducedMotion = Boolean(isReduced)
      if (this.prefersReducedMotion) {
        this.activeIndex = 2
      }
    },
    start() {
      if (this.prefersReducedMotion) {
        this.stop()
        return
      }
      if (typeof document !== 'undefined' && document.hidden) return
      this.stop()
      this.scheduleNext()
    },
    stop() {
      if (this.timeoutId) {
        const clear = typeof window !== 'undefined' ? window.clearTimeout : clearTimeout
        clear(this.timeoutId)
        this.timeoutId = null
      }
    },
    scheduleNext() {
      const currentFrame = this.frames[this.activeIndex]
      const delay = Number(currentFrame?.durationMs || 2000)
      const schedule = typeof window !== 'undefined' ? window.setTimeout : setTimeout
      this.timeoutId = schedule(() => {
        this.activeIndex = (this.activeIndex + 1) % this.frames.length
        this.scheduleNext()
      }, delay)
    },
  },
}
</script>

<style scoped>
.hero-narrative {
  width: 100%;
  max-width: 560px;
}

.hero-narrative-panel {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 28px;
  background:
    radial-gradient(800px 480px at 20% 20%, rgba(96, 165, 250, 0.16), transparent 55%),
    radial-gradient(720px 520px at 80% 20%, rgba(16, 185, 129, 0.14), transparent 58%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(2, 6, 23, 0.92) 100%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 26px 60px rgba(2, 6, 23, 0.22),
    0 10px 26px rgba(2, 6, 23, 0.10);
  overflow: hidden;
}

.hero-narrative-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.10), transparent 48%),
    radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.06), transparent 55%);
  pointer-events: none;
  opacity: 0.9;
}

.hero-narrative-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.18), rgba(2, 6, 23, 0.44));
  pointer-events: none;
}

.hero-narrative-stack {
  position: absolute;
  inset: 0;
}

.hero-narrative-frame {
  position: absolute;
  inset: 18px;
  width: calc(100% - 36px);
  height: calc(100% - 36px);
  border-radius: 22px;
  object-fit: contain;
  background: rgba(2, 6, 23, 0.18);
  box-shadow:
    0 18px 50px rgba(2, 6, 23, 0.26),
    0 1px 0 rgba(255, 255, 255, 0.06) inset;
  opacity: 0;
  transform: scale(1.02);
  transition:
    opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 1300ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
  user-select: none;
}

.hero-narrative-frame.active {
  opacity: 1;
  transform: scale(1);
}

.reduce-motion .hero-narrative-frame {
  transition: none;
  transform: none;
}

@media (max-width: 900px) {
  .hero-narrative {
    max-width: none;
  }
}
</style>
