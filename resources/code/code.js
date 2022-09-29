import { fs } from '@sys';
import { encode } from '@sciter';

export class Code extends Element {
  constructor(props) {
    super();
    this.app = props.app;
  }

  componentDidMount() {
    this.$('#tick').plaintext.content = this.app.tickCode;
    this.$('#paint').plaintext.content = this.app.paintCode;

    this.$('#tick').postEvent(new Event('change'));
    this.$('#paint').postEvent(new Event('change'));
  }

  ['on change at plaintext'](_, el) {
    const code = el.plaintext.content;

    //fs.$open('foo.js', 'w').$write(encode(code, 'utf-8'));
    //Window.this.close();

    if (el.id === 'tick') {
      //this.app.componentUpdate({ tickCode: code });
    } else if (el.id === 'paint') {
      //this.app.componentUpdate({ paintCode: code });
    }
  }

  render() {
    return <div styleset={__DIR__ + 'code.css#code'}>
      <frameset cols="*,*">
        <label for="tick">Tick
        <plaintext id="tick" styleset={__DIR__ + 'colorizer/colorizer.css#colorizer'} type="text/html" spaces-per-tab="2"></plaintext>
        </label>
        <splitter />
        <label for="paint">Paint
        <plaintext id="paint" styleset={__DIR__ + 'colorizer/colorizer.css#colorizer'} type="text/html" spaces-per-tab="2"></plaintext>
        </label>
      </frameset>
    </div>
  }
}
