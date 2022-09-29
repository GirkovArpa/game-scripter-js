export class Toolbar extends Element {
  constructor(props) {
    super();
    this.app = props.app;
  }

  render() {
    return <toolbar styleset={__DIR__ + "toolbar.css#toolbar"}>
      <button title="Play Game" name="play" disabled={this.app.playing} />
      <button title="Pause Game" name="pause" disabled={(this.app.paused && !this.app.playing) || this.app.restarting} />
      <button title="Restart Game" name="restart" />
      {this.app.debugging ? <button title="Apply Code Changes" name="apply" /> : false}
      {this.app.debugging ? <VerticalDivider /> : false}
      {(this.app.debugging) ? <button title="Export Executable" name="compile" disabled={this.app.compiling} /> : false}
    </toolbar>;
  }
}

class VerticalDivider extends Element {
  render() {
    return <div styleset={__DIR__ + "toolbar.css#vr"} />
  }
}