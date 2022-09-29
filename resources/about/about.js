import { launch } from '@env';
import { exepath } from '@sys';

export class About extends Element {
  constructor(props) {
    super();
    this.app = props.app;
  }

  componentDidMount() {
    this.$('#ok').focus();

    const [wmin, w] = document.state.contentWidths();
    const h = document.state.contentHeight(w);
    const [sw, sh] = Window.this.screenBox('frame', 'dimension');
    Window.this.move((sw - w) / 2, (sh - h) / 2, w, h, true);
  }

  ['on click at #ok']() {
    Window.this.close();
  }

  ['on click at a'](_, a) {
    launch(a.attributes.href);
    return true;
  }

  render() {
    let metadata = this.app.metadata;

    let gameEngineMetadata = {
      //icofile: 'icon.ico',
      productName: 'GameScripter.JS',
      productVersion: '0.1.0',
      productDescription: 'Write games in JS.',
      productCompany: 'GirkovArpa',
      productCopyright: 'GirkovArpa © 2022',
    };

    metadata = gameEngineMetadata; // debugging

    // <img id="logo" src='../logo/128.png' width="64" height="64" />
      
    return (
      <body styleset='about.css#about'>
        <div id="container">
          <div id="header">
            <icon id="logo" icon-size="xx-large" filename={exepath()} />
            <div id="title">
              <div>{metadata.productName}</div>
              <div>v{metadata.productVersion}</div>
            </div>
          </div>
          <div id="contents">
            <div class="row">
              This application uses <img src={__DIR__ + 'sciter.png'} width="16" height="16" />
              &#8202;<a href="https://sciter.com/?ref=GameScripter.JS">Sciter</a> Engine,
            </div>
            <div class="row">
              © <a href="https://terrainformatica.com/?ref=GameScripter.JS">Terra Informatica Software</a>, Inc.
            </div>
          </div>
          <div id="footer">
            <button id="ok">OK</button>
          </div>
        </div>
      </body>
    );
  }
}
