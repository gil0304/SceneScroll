# SceneScroll.js

Scroll-based Cinematic Web Library.

SceneScroll.js is a Vanilla JavaScript library that turns scrolling into cinematic scene transitions. You can create movie-like landing pages, portfolio pages, travel stories, web picture books, and exhibition websites with simple scene data.

## Install

Install from npm after publishing:

```sh
npm install scenescroll
```

```js
import SceneScroll from "scenescroll";
import "scenescroll/css";
```

Or use the files in `dist/` directly:

```html
<link rel="stylesheet" href="./dist/scenescroll.css">
<div id="scene"></div>
<script src="./dist/scenescroll.js"></script>
```

The package also ships a CommonJS build, browser global build, minified browser build, CSS, and TypeScript definitions.

```text
dist/scenescroll.cjs
dist/scenescroll.js
dist/scenescroll.min.js
dist/scenescroll.css
dist/scenescroll.d.ts
```

For local module development, import the source entry:

```js
import SceneScroll from "./src/index.js";
```

## Minimum Code

```js
SceneScroll.create("#scene", {
  scenes: [
    {
      title: "Scene 01",
      text: "The story begins.",
      background: "scene1.jpg"
    },
    {
      title: "Scene 02",
      text: "The world changes.",
      background: "scene2.jpg",
      transition: "camera",
      camera: {
        from: { scale: 1, x: 0, y: 0 },
        to: { scale: 1.3, x: -100, y: 40 }
      }
    }
  ]
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | string | `"vertical"` | `"vertical"` or `"horizontal"` |
| `heightPerScene` | number | `120` | Scroll distance per scene, in `vh` |
| `transition` | string | `"fade"` | Default transition |
| `textEffect` | string | `"fade"` | Default text animation |
| `progressBar` | boolean | `true` | Show progress bar |
| `sceneNumber` | boolean | `true` | Show current scene number |
| `mobileOptimize` | boolean | `true` | Enable mobile optimization |
| `reducedMotion` | boolean | `true` | Respect `prefers-reduced-motion` |
| `autoPlayVideo` | boolean | `true` | Play active videos automatically |
| `autoPlayAudio` | boolean | `false` | Play active scene audio after first user interaction |
| `loopVideo` | boolean | `true` | Loop background videos |
| `keyboard` | boolean | `false` | Enable arrow key navigation |
| `debug` | boolean | `false` | Show debug state |
| `scenes` | array | `[]` | Scene definitions |

## Scene Object

| Property | Type | Description |
| --- | --- | --- |
| `id` | string | Scene element id |
| `label` | string | Small scene label |
| `title` | string | Main title |
| `text` | string | Body text |
| `type` | string | `"image"`, `"video"`, or `"color"` |
| `background` | string | Background image URL |
| `backgroundAlt` | string | Background image alt text |
| `backgroundVideo` | string | Background video URL |
| `fallbackBackground` | string | Image used if video is disabled or fails |
| `backgroundColor` | string | Color scene background |
| `image` | string | Main image URL |
| `video` | string | Main video URL |
| `audio` | string/object | Scene audio source or options |
| `transition` | string | Scene transition override |
| `textEffect` | string | Scene text effect override |
| `align` | string | `"left"`, `"center"`, or `"right"` |
| `theme` | string | `"dark"` or `"light"` |
| `duration` | number | Scene scroll distance in `vh` |
| `camera` | object | Camera transform settings |
| `parallax` | object | Parallax speed settings |
| `mobile` | object | Mobile-only overrides |

## Transitions

SceneScroll.js includes:

- `fade`
- `slide`
- `zoom`
- `cut`
- `parallax`
- `camera`

## Text Effects

SceneScroll.js includes:

- `fade`
- `slide`
- `scale`
- `type`
- `blur`

## Horizontal Mode

```js
SceneScroll.create("#scene", {
  direction: "horizontal",
  scenes: [
    { title: "Start", background: "scene1.jpg" },
    { title: "Middle", background: "scene2.jpg" },
    { title: "Goal", background: "scene3.jpg" }
  ]
});
```

The page still scrolls vertically, but the generated scene track moves horizontally with `translate3d()`.

## Camera Mode

```js
{
  title: "Move closer",
  background: "city.jpg",
  transition: "camera",
  camera: {
    from: { scale: 1, x: 0, y: 0 },
    to: { scale: 1.45, x: -120, y: 60 }
  }
}
```

SceneScroll.js updates these CSS variables on every frame:

```css
--ss-camera-scale
--ss-camera-x
--ss-camera-y
```

## Mobile Optimization

```js
SceneScroll.create("#scene", {
  mobileOptimize: true,
  mobile: {
    breakpoint: 768,
    disableCamera: false,
    reduceCameraMotion: true,
    disableVideo: false,
    reduceParallax: true,
    transition: "fade",
    textEffect: "fade"
  },
  scenes: []
});
```

Scene-level mobile overrides are also supported:

```js
{
  backgroundVideo: "scene.mp4",
  fallbackBackground: "scene.jpg",
  transition: "camera",
  mobile: {
    disableCamera: true,
    disableVideo: true,
    fallbackBackground: "scene-mobile.jpg"
  }
}
```

## Instance API

```js
const ss = SceneScroll.create("#scene", options);

ss.next();
ss.prev();
ss.goTo(2);
ss.refresh();
ss.pause();
ss.resume();
ss.destroy();
```

## Demos

- [Movie LP](./demos/movie-lp/)
- [Portfolio](./demos/portfolio/)
- [Travel](./demos/travel/)
- [Horizontal Story](./demos/horizontal-story/)

## Build

```sh
npm run build
npm run check
npm run smoke
```

`npm run smoke` starts a temporary static server and checks the top page plus all demo pages in Chrome headless.

## License

MIT
