import { createElement } from "../utils/createElement.js";
import { clamp } from "../utils/clamp.js";
import { Scene } from "./Scene.js";
import { ScrollManager } from "./ScrollManager.js";
import { MediaManager } from "./MediaManager.js";
import { MobileOptimizer } from "./MobileOptimizer.js";

export const VERSION = "0.1.0";

export const DEFAULT_OPTIONS = {
  direction: "vertical",
  heightPerScene: 120,
  transition: "fade",
  textEffect: "fade",
  progressBar: true,
  sceneNumber: true,
  mobileOptimize: true,
  reducedMotion: true,
  autoPlayVideo: true,
  autoPlayAudio: false,
  loopVideo: true,
  debug: false,
  keyboard: false,
  mobile: null,
  scenes: []
};

function resolveTarget(selector) {
  if (typeof selector === "string") {
    return document.querySelector(selector);
  }

  if (selector instanceof HTMLElement) {
    return selector;
  }

  return null;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function mergeOptions(options) {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    mobile: {
      ...(DEFAULT_OPTIONS.mobile || {}),
      ...(options.mobile || {})
    }
  };
}

export class SceneScrollInstance {
  constructor(selector, options = {}) {
    this.target = resolveTarget(selector);
    if (!this.target) {
      throw new Error("SceneScroll: Target element not found.");
    }

    this.options = mergeOptions(options);
    if (!Array.isArray(this.options.scenes) || this.options.scenes.length === 0) {
      throw new Error("SceneScroll: scenes array is required.");
    }

    this.originalHTML = this.target.innerHTML;
    this.currentIndex = -1;
    this.progress = 0;
    this.sceneProgress = 0;
    this.isDestroyed = false;
    this.mobileOptimizer = new MobileOptimizer(this.options);

    this.build();

    this.mediaManager = new MediaManager(this);
    this.scrollManager = new ScrollManager(this);
    this.scrollManager.start();
  }

  build() {
    this.target.innerHTML = "";
    this.target.classList.add("ss-host");

    this.wrapper = createElement("div", {
      className: [
        "ss-wrapper",
        `ss-direction-${this.options.direction}`,
        this.mobileOptimizer.isMobile ? "ss-mobile" : "",
        this.mobileOptimizer.isReducedMotion ? "ss-reduced-motion" : ""
      ]
        .filter(Boolean)
        .join(" "),
      attrs: {
        "data-scenes": this.options.scenes.length,
        "data-current-scene": "0"
      }
    });

    this.sticky = createElement("div", {
      className: "ss-sticky"
    });

    this.track = null;
    const sceneParent =
      this.options.direction === "horizontal"
        ? this.createHorizontalTrack()
        : this.sticky;

    this.scenes = this.options.scenes.map((scene, index) => {
      const sceneInstance = new Scene(scene, index, this.options.scenes.length, this);
      sceneParent.appendChild(sceneInstance.el);
      return sceneInstance;
    });

    if (this.track) {
      this.sticky.appendChild(this.track);
    }

    this.createControls();
    this.wrapper.appendChild(this.sticky);
    this.target.appendChild(this.wrapper);
  }

  createHorizontalTrack() {
    this.track = createElement("div", {
      className: "ss-horizontal-track"
    });
    return this.track;
  }

  createControls() {
    if (this.options.progressBar) {
      this.progressBar = createElement("div", {
        className: "ss-progress",
        attrs: {
          "aria-hidden": "true"
        },
        children: [
          createElement("div", {
            className: "ss-progress-bar"
          })
        ]
      });
      this.sticky.appendChild(this.progressBar);
    }

    if (this.options.sceneNumber) {
      this.currentNumber = createElement("span", {
        className: "ss-current",
        text: "01"
      });
      this.totalNumber = createElement("span", {
        className: "ss-total",
        text: pad(this.options.scenes.length)
      });

      this.sceneNumber = createElement("div", {
        className: "ss-scene-number",
        attrs: {
          "aria-live": "polite"
        },
        children: [
          this.currentNumber,
          createElement("span", {
            className: "ss-separator",
            text: "/"
          }),
          this.totalNumber
        ]
      });
      this.sticky.appendChild(this.sceneNumber);
    }

    if (this.options.debug) {
      this.debugPanel = createElement("pre", {
        className: "ss-debug",
        attrs: {
          "aria-hidden": "true"
        }
      });
      this.sticky.appendChild(this.debugPanel);
    }
  }

  update(state) {
    if (this.isDestroyed) {
      return;
    }

    const previousIndex = this.currentIndex;
    this.progress = state.progress;
    this.currentIndex = state.currentIndex;
    this.sceneProgress = state.sceneProgress;

    this.wrapper.style.setProperty("--ss-progress", state.progress.toFixed(4));
    this.wrapper.style.setProperty("--ss-scene-progress", state.sceneProgress.toFixed(4));
    this.wrapper.style.setProperty("--ss-current-scene", String(state.currentIndex));
    this.wrapper.dataset.currentScene = String(state.currentIndex);

    this.scenes.forEach((scene) => {
      scene.setState(state.currentIndex);
      scene.update(state.sceneProgress, state.currentIndex);
    });

    if (this.currentNumber) {
      this.currentNumber.textContent = pad(state.currentIndex + 1);
    }

    if (this.debugPanel) {
      this.debugPanel.textContent = JSON.stringify(
        {
          progress: Number(state.progress.toFixed(4)),
          currentIndex: state.currentIndex,
          sceneProgress: Number(state.sceneProgress.toFixed(4)),
          mobile: this.mobileOptimizer.isMobile,
          reducedMotion: this.mobileOptimizer.isReducedMotion
        },
        null,
        2
      );
    }

    if (previousIndex !== state.currentIndex) {
      this.mediaManager.sync(state.currentIndex);
      if (typeof this.options.onSceneChange === "function") {
        this.options.onSceneChange({
          index: state.currentIndex,
          scene: this.options.scenes[state.currentIndex],
          progress: state.progress
        });
      }
    }
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  goTo(index) {
    const safeIndex = Math.round(clamp(index, 0, this.scenes.length - 1));
    this.scrollManager.scrollToIndex(safeIndex);
  }

  refresh() {
    this.mobileOptimizer.refresh();
    this.wrapper.classList.toggle("ss-mobile", this.mobileOptimizer.isMobile);
    this.wrapper.classList.toggle("ss-reduced-motion", this.mobileOptimizer.isReducedMotion);
    this.scenes.forEach((scene) => scene.refreshClasses());
    this.scrollManager.refresh();
    this.scrollManager.requestUpdate();
  }

  pause() {
    this.scrollManager.pause();
  }

  resume() {
    this.scrollManager.resume();
  }

  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    this.scrollManager.stop();
    this.mediaManager.destroy();
    this.target.classList.remove("ss-host");
    this.target.innerHTML = this.originalHTML;
  }
}

export function create(selector, options) {
  return new SceneScrollInstance(selector, options);
}

export const SceneScroll = {
  create,
  version: VERSION,
  defaults: DEFAULT_OPTIONS,
  Instance: SceneScrollInstance
};

export default SceneScroll;
