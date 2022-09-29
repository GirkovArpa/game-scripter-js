import { Toolbar } from 'toolbar/toolbar.js'; // debugging
import { Game } from 'game/game.js';
import { Code } from 'code/code.js'; // debugging
import { Statusbar } from 'statusbar/statusbar.js'; // debugging

import { compile } from 'compile.js'; // debugging

import { home } from '@env';

import { fs } from '@sys';

import { encode, decode } from '@sciter';

export class Application extends Element {
  status = 'Welcome to GameScripter.JS!';
  error = false;
  playing = false;
  paused = true;
  restarting = false;
  compiling = false;

  debugging = Window.share.debugging;

  tickCode = '// manage game state';
  paintCode = '// paint game objects';

  metadata = {
    icofile: 'icon.ico',
    productName: 'Your Game',
    productVersion: '0.1.0',
    productDescription: 'Made with GameScripter.JS v0.1.0',
    productCompany: 'GirkovArpa',
    productCopyright: 'GirkovArpa © 2022',
  }

  constructor(props) {
    super();

    document.on('click', 'menu(file) > (save)', () => {

      const tickCode = this.$('#tick').plaintext.content;

      let file = fs.$open(home(['tick-code.js']), 'w');
      file.$write(encode(tickCode));
      file.close();

      const paintCode = this.$('#paint').plaintext.content;

      file = fs.$open(home(['paint-code.js']), 'w');
      file.$write(encode(paintCode));
      file.close();
    });

    document.$('menu(help) > (about)').on('click', () => {
      Window.this.modal({ url: 'about/about.htm', parameters: { app: this } });
    });

    document.$('(metadata)').on('click', () => { // debugging
      Window.this.modal({ url: 'metadata/metadata.htm', parameters: { app: this } }); // debugging
    }); // debugging

    const __GRAPHICS_IMAGE_LOAD__ = Graphics.Image.load.bind(Graphics.Image);

    Graphics.Image.load = async function (path) {
      let newPath = path;
      if (path.startsWith('internal://')) {
        newPath = path.replace('internal://', 'this://app/');
        newPath = home([path.replace('internal://', '')]); // debugging
      }
      return await __GRAPHICS_IMAGE_LOAD__(newPath);
    }

    try {
      this.tickCode = fetch('this://app/tick-code.js', { sync: true }).text();
      this.paintCode = fetch('this://app/paint-code.js', { sync: true }).text();
    } catch (e) {

    }

    this.tickCode = decode(fs.$readFile(home(['tick-code.js'])), 'utf-8'); // debugging
    this.paintCode = decode(fs.$readFile(home(['paint-code.js'])), 'utf-8'); // debugging
  }

  ['on click at toolbar > button(restart)']() {
    this.componentUpdate({
      playing: false,
      paused: false,
      restarting: true,
      status: 'Restarting...',
      error: false
    });
  }

  ['on click at toolbar > button(play)']() {
    this.componentUpdate({
      status: 'Playing!',
      playing: true,
      paused: false
    });
  }

  ['on click at toolbar > button(pause)']() {
    this.componentUpdate({
      status: 'Paused.',
      playing: false,
      paused: true
    });
  }

  ['on click at toolbar > button(apply)']() {
    const tickCode = this.$('#tick').plaintext.content;
    const paintCode = this.$('#paint').plaintext.content;
    this.componentUpdate({
      status: 'Code changes applied!',
      error: false,
      tickCode,
      paintCode
    });
  }

  async ['on click at toolbar > button(compile)']() {
    if (!fs.$stat(this.metadata.icofile)) {
      Window.this.modal(<error caption="Error">The specified icon could not be found.</error>);
      this.componentUpdate({
        status: `Unable to locate "${this.metadata.icofile}"`
      });
      return;
    }

    this.componentUpdate({
      status: 'Exporting to executable...',
      compiling: true
    });
    await compile(this);
    this.componentUpdate({
      status: `Exported to "/your-game/${this.metadata.productName}.exe"`,
      compiling: false
    });
  }

  componentDidMount() {
    return; // debugging
    //setTimeout(() => {
    this.componentUpdate({
      status: 'Playing!',
      playing: true,
      paused: false
    });
    //}, 2000);
  }

  render() {
    return (
      <body styleset={__DIR__ + 'main.css#body'}>
        {this.debugging ? <Toolbar app={this} /> : false}
        <frameset rows="*,*">
          <Game app={this} />
          {this.debugging ? <splitter /> : false}
          {this.debugging ? <Code app={this} /> : false}
        </frameset>
        {this.debugging ? <Statusbar app={this} /> : false}
      </body>
    );
  }
}