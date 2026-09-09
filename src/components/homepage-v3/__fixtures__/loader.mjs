import ts from "typescript";
export default function homepageFixtureLoader(source) {
  if (this.resourcePath.endsWith(".css")) {
    const classes = Object.fromEntries([...source.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => [m[1], m[1]]));
    return `const style = document.createElement('style'); style.textContent = ${JSON.stringify(source)}; document.head.append(style); module.exports = ${JSON.stringify(classes)};`;
  }
  return ts.transpileModule(source, { fileName: this.resourcePath, compilerOptions: {
    module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
};
