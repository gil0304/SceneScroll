import { clamp } from "../utils/clamp.js";

export class ScrollManager {
  constructor(instance) {
    this.instance = instance;
    this.options = instance.options;
    this.wrapper = instance.wrapper;
    this.track = instance.track;
    this.sceneCount = instance.scenes.length;
    this.isTicking = false;
    this.isPaused = false;
    this.startY = 0;
    this.totalScroll = 1;
    this.totalDuration = 1;
    this.sceneStarts = [];
    this.sceneDurations = [];

    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  start() {
    this.refresh();
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize);

    if (this.options.keyboard) {
      window.addEventListener("keydown", this.handleKeydown);
    }

    this.requestUpdate();
  }

  stop() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleKeydown);
  }

  handleScroll() {
    if (!this.isPaused) {
      this.requestUpdate();
    }
  }

  handleResize() {
    this.refresh();
    this.requestUpdate();
  }

  handleKeydown(event) {
    const nextKeys = ["ArrowDown", "ArrowRight", "PageDown"];
    const prevKeys = ["ArrowUp", "ArrowLeft", "PageUp"];

    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      this.instance.next();
    } else if (prevKeys.includes(event.key)) {
      event.preventDefault();
      this.instance.prev();
    }
  }

  requestUpdate() {
    if (this.isTicking) {
      return;
    }

    this.isTicking = true;
    window.requestAnimationFrame(() => {
      this.isTicking = false;
      if (!this.isPaused) {
        this.instance.update(this.getState());
      }
    });
  }

  refresh() {
    const rect = this.wrapper.getBoundingClientRect();
    this.startY = rect.top + window.scrollY;
    this.sceneDurations = this.instance.scenes.map((scene) => {
      return Number(scene.data.duration || this.options.heightPerScene);
    });
    this.totalDuration = this.sceneDurations.reduce((total, duration) => total + duration, 0);

    let cumulative = 0;
    this.sceneStarts = this.sceneDurations.map((duration) => {
      const start = cumulative;
      cumulative += duration;
      return start;
    });

    this.wrapper.style.height = `${Math.max(this.totalDuration, 100)}vh`;
    this.totalScroll = Math.max(1, this.wrapper.offsetHeight - window.innerHeight);

    if (this.track) {
      this.track.style.width = `${this.sceneCount * 100}vw`;
    }
  }

  getState() {
    const currentScroll = clamp(window.scrollY - this.startY, 0, this.totalScroll);
    const progress = clamp(currentScroll / this.totalScroll);
    const virtualPosition = progress * this.totalDuration;
    const currentIndex = this.getCurrentIndex(virtualPosition, progress);
    const sceneStart = this.sceneStarts[currentIndex] || 0;
    const duration = this.sceneDurations[currentIndex] || this.options.heightPerScene;
    const sceneProgress = clamp((virtualPosition - sceneStart) / duration);

    if (this.track) {
      const x = progress * (this.sceneCount - 1) * -100;
      this.track.style.transform = `translate3d(${x.toFixed(4)}vw, 0, 0)`;
    }

    return {
      progress,
      currentIndex,
      sceneProgress
    };
  }

  getCurrentIndex(virtualPosition, progress) {
    if (progress >= 1) {
      return this.sceneCount - 1;
    }

    for (let index = this.sceneCount - 1; index >= 0; index -= 1) {
      if (virtualPosition >= this.sceneStarts[index]) {
        return index;
      }
    }

    return 0;
  }

  scrollToIndex(index, behavior) {
    const safeIndex = clamp(index, 0, this.sceneCount - 1);
    const targetProgress = clamp((this.sceneStarts[safeIndex] || 0) / this.totalDuration);
    const top = this.startY + targetProgress * this.totalScroll + 1;

    window.scrollTo({
      top,
      behavior:
        behavior ||
        (this.instance.mobileOptimizer.isReducedMotion ? "auto" : "smooth")
    });
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.requestUpdate();
  }
}
