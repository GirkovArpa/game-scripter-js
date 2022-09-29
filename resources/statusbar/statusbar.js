export class Statusbar extends Element {
  constructor(props) {
    super();
    this.app = props.app;
  }

  render() {
    return <div styleset={__DIR__ + "statusbar.css#statusbar"}>
      <span>{this.app.status}</span>
    </div>
  }
}