export function evalInSandbox(code, global, gfx, _this) {
  return (function (code, global, gfx) {
    return eval('((()=>{\r\n' + code + '\r\n})())');
  })(code, global, gfx);
}