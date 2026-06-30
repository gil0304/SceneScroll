export type SceneScrollDirection = "vertical" | "horizontal";
export type SceneScrollTransition =
  | "fade"
  | "slide"
  | "zoom"
  | "cut"
  | "parallax"
  | "camera";
export type SceneScrollTextEffect = "fade" | "slide" | "scale" | "type" | "blur";
export type SceneScrollAlign = "left" | "center" | "right";
export type SceneScrollTheme = "light" | "dark";
export type SceneScrollSceneType = "image" | "video" | "color";

export interface SceneScrollCameraPoint {
  scale?: number;
  x?: number;
  y?: number;
}

export interface SceneScrollCamera {
  from?: SceneScrollCameraPoint;
  to?: SceneScrollCameraPoint;
}

export interface SceneScrollParallax {
  backgroundSpeed?: number;
  contentSpeed?: number;
}

export interface SceneScrollMobileOptions {
  breakpoint?: number;
  disableCamera?: boolean;
  reduceCameraMotion?: boolean;
  disableVideo?: boolean;
  fallbackBackground?: string;
  reduceParallax?: boolean;
  transition?: SceneScrollTransition;
  textEffect?: SceneScrollTextEffect;
}

export interface SceneScrollAudioOptions {
  src: string;
  loop?: boolean;
  volume?: number;
  fade?: boolean;
}

export interface SceneScrollLinkOptions {
  href: string;
  label?: string;
  target?: string;
}

export interface SceneScrollScene {
  id?: string;
  label?: string;
  title?: string;
  text?: string;
  type?: SceneScrollSceneType;
  background?: string;
  backgroundAlt?: string;
  backgroundVideo?: string;
  fallbackBackground?: string;
  backgroundColor?: string;
  image?: string;
  imageAlt?: string;
  video?: string;
  audio?: string | SceneScrollAudioOptions;
  transition?: SceneScrollTransition;
  textEffect?: SceneScrollTextEffect;
  align?: SceneScrollAlign;
  theme?: SceneScrollTheme;
  duration?: number;
  camera?: SceneScrollCamera;
  parallax?: SceneScrollParallax;
  mobile?: SceneScrollMobileOptions;
  controls?: boolean;
  loopVideo?: boolean;
  muted?: boolean;
  link?: SceneScrollLinkOptions;
}

export interface SceneScrollChangeEvent {
  index: number;
  scene: SceneScrollScene;
  progress: number;
}

export interface SceneScrollOptions {
  direction?: SceneScrollDirection;
  heightPerScene?: number;
  transition?: SceneScrollTransition;
  textEffect?: SceneScrollTextEffect;
  progressBar?: boolean;
  sceneNumber?: boolean;
  mobileOptimize?: boolean;
  reducedMotion?: boolean;
  autoPlayVideo?: boolean;
  autoPlayAudio?: boolean;
  loopVideo?: boolean;
  debug?: boolean;
  keyboard?: boolean;
  mobile?: SceneScrollMobileOptions;
  scenes: SceneScrollScene[];
  onSceneChange?: (event: SceneScrollChangeEvent) => void;
}

export interface SceneScrollInstance {
  readonly options: SceneScrollOptions;
  readonly target: HTMLElement;
  readonly wrapper: HTMLElement;
  readonly sticky: HTMLElement;
  readonly progress: number;
  readonly sceneProgress: number;
  readonly currentIndex: number;
  next(): void;
  prev(): void;
  goTo(index: number): void;
  refresh(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}

export function create(
  selector: string | HTMLElement,
  options: SceneScrollOptions
): SceneScrollInstance;

export const version: string;
export const defaults: Readonly<Partial<SceneScrollOptions>>;

declare const SceneScroll: {
  create: typeof create;
  version: typeof version;
  defaults: typeof defaults;
};

export default SceneScroll;
