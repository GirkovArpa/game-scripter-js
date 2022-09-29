export class Metadata extends Element {
  constructor(props) {
    super();
    this.app = props.app;
  }

  componentDidMount() {
    const [wmin, w] = document.state.contentWidths();
    const h = document.state.contentHeight(w);
    const [sw, sh] = Window.this.screenBox('frame', 'dimension');
    Window.this.move((sw - w) / 2, (sh - h) / 2, w, h, true);

    Object.entries(this.app.metadata).forEach(([k, v]) => {
      this.$('#' + k).value = v;
    });
  }

  ['on click at #cancel']() {
    Window.this.close();
  }

  ['on click at #confirm']() {
    const metadata = Object.fromEntries(
      this.$$('input').map(input => ([input.id, input.value]))
    );
    this.app.componentUpdate({ metadata });
    Window.this.close();
  }

  ['on click at #browse']() {
    const filename = Window.this
      .selectFile({
        mode: 'open',
        filter: 'Icon Files (*.ico)|*.ico|All (*.*)|*.*',
        caption: 'Pick an icon for your game...',
      })
      ?.replace('file://', '')
      ?.replace(/.+/, (filename) => decodeURIComponent(filename));

    if (!filename) return;

    this.$('#icofile').value = filename;

    const metadata = { ...this.app.metadata };
    metadata.icofile = filename;
    this.app.componentUpdate({ metadata });
    this.patch(this.render());
    Window.this.update();
  }

  render() {
    const style = `foreground-image: url("${this.app.metadata.icofile}")`;

    return (
      <body styleset={__DIR__ + "metadata.css#metadata"}>
        <main>
          <label for="icofile">
            <span style={style}>Icon</span>
            <input id="icofile" />
            <button id="browse">&hellip;</button>
          </label>
          <label for="productName">
            <span>Name</span>
            <input id="productName" />
          </label>
          <label for="productVersion">
            <span>Version</span>
            <input id="productVersion" />
          </label>
          <label for="productDescription">
            <span>Description</span>
            <input id="productDescription" />
          </label>
          <label for="productCompany">
            <span>Company</span>
            <input id="productCompany" />
          </label>
          <label for="productCopyright">
            <span>Copyright</span>
            <input id="productCopyright" />
          </label>
        </main>
        <footer id="button-bar">
          <button id="cancel" role="cancel-button">
            Cancel
          </button>
          <button id="confirm" role="default-button">
            Save
          </button>
        </footer>
      </body>
    );
  }
}
