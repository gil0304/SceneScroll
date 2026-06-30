export class MediaManager {
  constructor(instance) {
    this.instance = instance;
    this.scenes = instance.scenes;
    this.options = instance.options;
    this.hasUserInteracted = false;
    this.audioElements = new Map();
    this.fadeTimers = new Map();

    this.handleFirstInteraction = this.handleFirstInteraction.bind(this);
    this.bindInteractionListeners();
    this.createAudioElements();
  }

  bindInteractionListeners() {
    ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
      window.addEventListener(eventName, this.handleFirstInteraction, {
        once: true,
        passive: true
      });
    });
  }

  removeInteractionListeners() {
    ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
      window.removeEventListener(eventName, this.handleFirstInteraction);
    });
  }

  handleFirstInteraction() {
    this.hasUserInteracted = true;
    this.sync(this.instance.currentIndex);
  }

  createAudioElements() {
    this.scenes.forEach((scene) => {
      const config = scene.media.audio;
      if (!config || !config.src) {
        return;
      }

      const audio = new Audio(config.src);
      audio.loop = config.loop !== false;
      audio.volume = config.fade ? 0 : config.volume;
      audio.preload = "metadata";
      this.audioElements.set(scene.index, { audio, config });
    });
  }

  sync(activeIndex) {
    this.scenes.forEach((scene) => {
      const isActive = scene.index === activeIndex;
      this.syncVideos(scene, isActive);
      this.syncAudio(scene, isActive);
    });
  }

  syncVideos(scene, isActive) {
    const settings = this.instance.mobileOptimizer.getSceneSettings(scene.data);
    scene.media.videos.forEach((video) => {
      if (!isActive || !this.options.autoPlayVideo || settings.disableVideo) {
        video.pause();
        return;
      }

      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    });
  }

  syncAudio(scene, isActive) {
    const entry = this.audioElements.get(scene.index);
    if (!entry) {
      return;
    }

    const { audio, config } = entry;
    if (!this.options.autoPlayAudio || !this.hasUserInteracted) {
      audio.pause();
      return;
    }

    if (isActive) {
      if (config.fade) {
        audio.volume = Math.min(audio.volume, config.volume);
      } else {
        audio.volume = config.volume;
      }

      const playAttempt = audio.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }

      if (config.fade) {
        this.fadeAudio(scene.index, config.volume);
      }
    } else if (config.fade) {
      this.fadeAudio(scene.index, 0, () => {
        audio.pause();
        audio.currentTime = 0;
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  fadeAudio(index, targetVolume, afterFade) {
    const entry = this.audioElements.get(index);
    if (!entry) {
      return;
    }

    const { audio } = entry;
    const startVolume = audio.volume;
    const steps = 16;
    let currentStep = 0;

    if (this.fadeTimers.has(index)) {
      window.clearInterval(this.fadeTimers.get(index));
    }

    const timer = window.setInterval(() => {
      currentStep += 1;
      const progress = currentStep / steps;
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (currentStep >= steps) {
        window.clearInterval(timer);
        this.fadeTimers.delete(index);
        audio.volume = targetVolume;
        if (afterFade) {
          afterFade();
        }
      }
    }, 24);

    this.fadeTimers.set(index, timer);
  }

  destroy() {
    this.removeInteractionListeners();
    this.fadeTimers.forEach((timer) => window.clearInterval(timer));
    this.fadeTimers.clear();

    this.scenes.forEach((scene) => {
      scene.media.videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
    });

    this.audioElements.forEach(({ audio }) => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
    this.audioElements.clear();
  }
}
