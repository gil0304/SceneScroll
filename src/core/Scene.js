import { createElement } from "../utils/createElement.js";
import { clamp } from "../utils/clamp.js";
import { lerp } from "../utils/lerp.js";

const CAMERA_DEFAULT = {
  from: { scale: 1, x: 0, y: 0 },
  to: { scale: 1, x: 0, y: 0 }
};

const PARALLAX_DEFAULT = {
  backgroundSpeed: 0.4,
  contentSpeed: 1
};

function padSceneNumber(number) {
  return String(number).padStart(2, "0");
}

function normalizeAudio(audio) {
  if (!audio) {
    return null;
  }

  if (typeof audio === "string") {
    return {
      src: audio,
      loop: true,
      volume: 0.8,
      fade: true
    };
  }

  return {
    loop: true,
    volume: 0.8,
    fade: true,
    ...audio
  };
}

export class Scene {
  constructor(scene, index, total, context) {
    this.data = scene;
    this.index = index;
    this.total = total;
    this.context = context;
    this.media = {
      videos: [],
      backgroundVideos: [],
      backgroundFallbacks: [],
      audio: normalizeAudio(scene.audio)
    };

    this.el = this.create();
  }

  create() {
    const settings = this.context.mobileOptimizer.getSceneSettings(this.data);
    const transition = settings.transition;
    const textEffect = settings.isReducedMotion ? "fade" : settings.textEffect;
    const align = this.data.align || "center";
    const theme = this.data.theme || "dark";
    const sceneId = this.data.id || `scene-${this.index + 1}`;

    const section = createElement("section", {
      className: [
        "ss-scene",
        `ss-scene-${this.index}`,
        `ss-transition-${transition}`,
        `ss-text-${textEffect}`,
        `ss-align-${align}`,
        `ss-theme-${theme}`
      ].join(" "),
      attrs: {
        id: sceneId,
        "aria-label": this.data.label || this.data.title || `Scene ${this.index + 1}`,
        "aria-hidden": "true"
      },
      dataset: {
        sceneIndex: this.index,
        transition,
        textEffect
      }
    });

    if (this.data.backgroundColor || this.data.type === "color") {
      section.style.backgroundColor = this.data.backgroundColor || "var(--ss-bg-color)";
    }

    section.appendChild(this.createBackground(settings));

    const media = this.createMainMedia(settings);
    if (media) {
      section.appendChild(media);
    }

    section.appendChild(this.createContent());

    return section;
  }

  createBackground(settings) {
    const bg = createElement("div", { className: "ss-bg" });
    const overlay = createElement("div", {
      className: "ss-overlay",
      attrs: { "aria-hidden": "true" }
    });

    const fallback = settings.fallbackBackground || this.data.fallbackBackground;
    const showVideo = this.data.backgroundVideo && !settings.disableVideo;

    if (showVideo) {
      const video = createElement("video", {
        className: "ss-bg-video",
        attrs: {
          src: this.data.backgroundVideo,
          muted: true,
          autoplay: this.context.options.autoPlayVideo,
          loop: this.context.options.loopVideo,
          playsinline: true,
          preload: "metadata",
          poster: fallback || undefined
        }
      });

      this.media.videos.push(video);
      this.media.backgroundVideos.push(video);

      if (fallback) {
        const image = this.createBackgroundImage(fallback, true);
        image.classList.add("ss-video-fallback");
        this.media.backgroundFallbacks.push(image);
        bg.appendChild(image);

        video.addEventListener("error", () => {
          video.dataset.failed = "true";
          video.hidden = true;
          image.hidden = false;
        });
      }

      bg.appendChild(video);
    } else if (fallback || this.data.background) {
      bg.appendChild(this.createBackgroundImage(fallback || this.data.background, false));
    }

    bg.appendChild(overlay);
    return bg;
  }

  createBackgroundImage(src, hidden) {
    return createElement("img", {
      className: "ss-bg-image",
      attrs: {
        src,
        alt: this.data.backgroundAlt || "",
        loading: this.index === 0 ? "eager" : "lazy",
        hidden
      }
    });
  }

  createMainMedia(settings) {
    const hasImage = Boolean(this.data.image);
    const hasVideo = Boolean(this.data.video || this.data.type === "video");

    if (!hasImage && !hasVideo) {
      return null;
    }

    const wrap = createElement("div", { className: "ss-media" });

    if (hasImage) {
      wrap.appendChild(
        createElement("img", {
          className: "ss-image",
          attrs: {
            src: this.data.image,
            alt: this.data.imageAlt || this.data.title || "",
            loading: this.index === 0 ? "eager" : "lazy"
          }
        })
      );
    }

    const videoSrc = this.data.video || (this.data.type === "video" ? this.data.backgroundVideo : null);
    if (videoSrc && !settings.disableVideo) {
      const video = createElement("video", {
        className: "ss-video",
        attrs: {
          src: videoSrc,
          playsinline: true,
          preload: "metadata",
          controls: this.data.controls !== false,
          loop: this.data.loopVideo || false,
          muted: this.data.muted !== false
        }
      });
      this.media.videos.push(video);
      wrap.appendChild(video);
    }

    return wrap;
  }

  createContent() {
    const children = [];

    if (this.data.label) {
      children.push(
        createElement("p", {
          className: "ss-label",
          text: this.data.label
        })
      );
    }

    if (this.data.title) {
      children.push(
        createElement("h1", {
          className: "ss-title",
          text: this.data.title
        })
      );
    }

    if (this.data.text) {
      const text = createElement("p", {
        className: "ss-text",
        text: this.data.text
      });
      text.style.setProperty("--ss-type-characters", String(this.data.text.length));
      children.push(text);
    }

    if (this.data.link && this.data.link.href) {
      children.push(
        createElement("a", {
          className: "ss-link",
          text: this.data.link.label || "View more",
          attrs: {
            href: this.data.link.href,
            target: this.data.link.target || undefined,
            rel: this.data.link.target === "_blank" ? "noreferrer" : undefined
          }
        })
      );
    }

    return createElement("div", {
      className: "ss-content",
      children
    });
  }

  refreshClasses() {
    const settings = this.context.mobileOptimizer.getSceneSettings(this.data);
    const transition = settings.transition;
    const textEffect = settings.isReducedMotion ? "fade" : settings.textEffect;

    Array.from(this.el.classList)
      .filter((name) => name.startsWith("ss-transition-") || name.startsWith("ss-text-"))
      .forEach((name) => this.el.classList.remove(name));

    this.el.classList.add(`ss-transition-${transition}`, `ss-text-${textEffect}`);
    this.el.dataset.transition = transition;
    this.el.dataset.textEffect = textEffect;
    this.refreshMediaVisibility(settings);
  }

  refreshMediaVisibility(settings) {
    this.media.backgroundVideos.forEach((video) => {
      video.hidden = settings.disableVideo || video.dataset.failed === "true";
    });

    this.media.backgroundFallbacks.forEach((image) => {
      const videoFailed = this.media.backgroundVideos.some((video) => video.dataset.failed === "true");
      image.hidden = !(settings.disableVideo || videoFailed);
    });
  }

  setState(currentIndex) {
    const isActive = this.index === currentIndex;
    this.el.classList.toggle("active", isActive);
    this.el.classList.toggle("prev", this.index < currentIndex);
    this.el.classList.toggle("next", this.index > currentIndex);
    this.el.setAttribute("aria-hidden", isActive ? "false" : "true");
  }

  update(progress, currentIndex) {
    const settings = this.context.mobileOptimizer.getSceneSettings(this.data);
    const sceneProgress = this.index === currentIndex ? clamp(progress) : this.index < currentIndex ? 1 : 0;

    this.refreshMediaVisibility(settings);
    this.el.style.setProperty("--ss-scene-progress-local", sceneProgress.toFixed(4));
    this.applyCamera(sceneProgress, settings);
    this.applyParallax(sceneProgress, settings);
  }

  applyCamera(progress, settings) {
    const isCamera = settings.transition === "camera";
    const hasCamera = Boolean(this.data.camera);

    if (!hasCamera || !isCamera || settings.disableCamera) {
      this.el.style.setProperty("--ss-camera-scale", "1");
      this.el.style.setProperty("--ss-camera-x", "0px");
      this.el.style.setProperty("--ss-camera-y", "0px");
      return;
    }

    const camera = {
      from: { ...CAMERA_DEFAULT.from, ...(this.data.camera.from || {}) },
      to: { ...CAMERA_DEFAULT.to, ...(this.data.camera.to || {}) }
    };

    const reduction = settings.reduceCameraMotion ? 0.45 : 1;
    const fromScale = camera.from.scale;
    const toScale = fromScale + (camera.to.scale - fromScale) * reduction;
    const fromX = camera.from.x;
    const toX = fromX + (camera.to.x - fromX) * reduction;
    const fromY = camera.from.y;
    const toY = fromY + (camera.to.y - fromY) * reduction;

    this.el.style.setProperty("--ss-camera-scale", lerp(fromScale, toScale, progress).toFixed(4));
    this.el.style.setProperty("--ss-camera-x", `${lerp(fromX, toX, progress).toFixed(2)}px`);
    this.el.style.setProperty("--ss-camera-y", `${lerp(fromY, toY, progress).toFixed(2)}px`);
  }

  applyParallax(progress, settings) {
    const parallax = {
      ...PARALLAX_DEFAULT,
      ...(this.data.parallax || {})
    };
    const amount = settings.reduceParallax ? 24 : 72;
    const centered = progress - 0.5;
    const backgroundY = centered * amount * parallax.backgroundSpeed * -1;
    const contentY = centered * amount * parallax.contentSpeed;

    this.el.style.setProperty("--ss-bg-parallax-y", `${backgroundY.toFixed(2)}px`);
    this.el.style.setProperty("--ss-content-parallax-y", `${contentY.toFixed(2)}px`);
  }

  getLabel() {
    return this.data.label || `Scene ${padSceneNumber(this.index + 1)}`;
  }
}
