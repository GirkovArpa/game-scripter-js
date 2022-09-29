import { evalInSandbox } from '../eval.js';
import { home } from '@env';

function seededRandom(max, ...seeds) {
  let n = max - 1;
  seeds.forEach(seed => n = Math.pow(seed + max, n) % max);
  return n;
}

export class Game extends Element {
  global = {
    home,
    seededRandom,
    key: {},
    mouse: [],
    get canvas() {
      return {
        get width() {
          return document.$('#canvas').clientWidth;
        },
        get height() {
          return document.$('#canvas').clientHeight;
        }
      }
    }
  };

  constructor(props) {
    super();
    this.app = props.app;

    document.on('keydown', (evt) => {
      if (document.$('plaintext:focus')) return;
      if (!this.app.playing) return;
      const code = evt.code.replace('Key', '').replace('Arrow', '').toLowerCase();
      const global = { ...this.global };
      global.key[code] = true;
      this.componentUpdate({ global });
    });

    document.on('keyup', (evt) => {
      if (document.$('plaintext:focus')) return;
      if (!this.app.playing) return;
      const code = evt.code.replace('Key', '').replace('Arrow', '').toLowerCase();
      const global = { ...this.global };
      global.key[code] = false;
      this.componentUpdate({ global });
    });
  }

  ['on mousemove at #canvas'](evt) {
    if (!this.app.playing) return;
    const { x, y } = evt;
    const global = { ...this.global };
    global.mouse.x = x;
    global.mouse.y = y;
    this.componentUpdate({ global });
  }

  ['on mousedown at #canvas'](evt) {
    if (!this.app.playing) return;
    evt.target.state.capture(true);
    const button = ['left', 'right', 'middle'][evt.button - 1];
    const global = { ...this.global };
    global.mouse[button] = true;
    this.componentUpdate({ global });
  }

  ['on mouseup at #canvas'](evt) {
    if (!this.app.playing) return;
    evt.target.state.capture(false);
    const button = ['left', 'right', 'middle'][evt.button - 1];
    const global = { ...this.global };
    global.mouse[button] = false;
    this.componentUpdate({ global });
  }

  componentDidMount() {
    const __THIS__ = this;

    let ticks = 0;
    let paints = 0;

    const tick = function () {
      ticks++;

      if (__THIS__.app.restarting) {
        __THIS__.componentUpdate({
          global: {
            home,
            seededRandom,
            key: {},
            mouse: [],
            get canvas() {
              return {
                get width() {
                  return document.$('#canvas').clientWidth;
                },
                get height() {
                  return document.$('#canvas').clientHeight;
                }
              }
            }
          }
        });
        __THIS__.app.componentUpdate({
          restarting: false,
          playing: false,
          paused: true,
          status: 'Game restarted.'
        });
        evalInSandbox(__THIS__.app.tickCode, __THIS__.global);
        this.requestPaint();
        return true;
      }

      if (!__THIS__.app.playing) {
        if (ticks === 1) evalInSandbox(__THIS__.app.tickCode, __THIS__.global);
        this.requestPaint();
        return true;
      }

      try {
        evalInSandbox(__THIS__.app.tickCode, __THIS__.global);
      } catch (e) {
        console.log(e);
        const error = 'Tick: ' + e;
        __THIS__.app.componentUpdate({
          error,
          errorOrigin: 'tick',
          status: error,
          playing: false,
          paused: true
        });
      }

      this.requestPaint();
      return true;
    }

    this.$('#canvas').animate(tick, { FPS: 30 });

    this.$('#canvas').paintContent = function (gfx) {
      paints++;

      if (!__THIS__.app.playing && __THIS__.app.errorOrigin === 'paint') return true;
      try {
        evalInSandbox(__THIS__.app.paintCode, __THIS__.global, gfx);
      } catch (e) {
        console.log(e);
        const error = 'Paint: ' + e;
        __THIS__.app.componentUpdate({
          error,
          errorOrigin: 'paint',
          status: error,
          playing: false,
          paused: true
        });
      }
    };
  }

  render() {
    return <div styleset={__DIR__ + 'game.css#game'}>
      <div id="canvas"></div>
    </div>
  }
}