import { detectMobile, prefersReducedMotion } from "../utils/detectMobile.js";

const DEFAULT_MOBILE = {
  breakpoint: 768,
  disableCamera: false,
  reduceCameraMotion: true,
  disableVideo: false,
  reduceParallax: true,
  fallbackBackground: null,
  transition: null,
  textEffect: null
};

export class MobileOptimizer {
  constructor(options) {
    this.options = options;
    this.mobileOptions = {
      ...DEFAULT_MOBILE,
      ...(options.mobile || {})
    };
    this.isMobile = false;
    this.isReducedMotion = false;
    this.refresh();
  }

  refresh() {
    this.isMobile = Boolean(
      this.options.mobileOptimize &&
        detectMobile(this.mobileOptions.breakpoint)
    );

    this.isReducedMotion = Boolean(
      this.options.reducedMotion &&
        prefersReducedMotion()
    );

    return {
      isMobile: this.isMobile,
      isReducedMotion: this.isReducedMotion
    };
  }

  getSceneSettings(scene) {
    const mobile = this.isMobile ? { ...this.mobileOptions, ...(scene.mobile || {}) } : {};

    return {
      transition: mobile.transition || scene.transition || this.options.transition,
      textEffect: mobile.textEffect || scene.textEffect || this.options.textEffect,
      disableCamera: Boolean(
        this.isReducedMotion ||
          mobile.disableCamera ||
          (this.isMobile && scene.mobile && scene.mobile.disableCamera)
      ),
      reduceCameraMotion: Boolean(this.isMobile && mobile.reduceCameraMotion),
      disableVideo: Boolean(
        this.isReducedMotion ||
          (this.isMobile && mobile.disableVideo)
      ),
      fallbackBackground:
        (this.isMobile && (mobile.fallbackBackground || scene.mobile?.fallbackBackground)) ||
        scene.fallbackBackground ||
        scene.background ||
        null,
      reduceParallax: Boolean(this.isReducedMotion || (this.isMobile && mobile.reduceParallax)),
      isMobile: this.isMobile,
      isReducedMotion: this.isReducedMotion
    };
  }
}
