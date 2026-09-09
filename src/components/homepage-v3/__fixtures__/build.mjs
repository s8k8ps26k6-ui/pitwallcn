// Optional real React/CSS fixture. Reuses Next's installed webpack; no dependencies.
// Generated public/homepage-fixture is temporary QA output, not production code.
import path from "node:path";
import fs from "node:fs";
import bundled from "next/dist/compiled/webpack/webpack.js";
const fixtureDirectory = import.meta.dirname;
bundled.init();
const root = path.resolve(fixtureDirectory, "../../../..");
const output = path.join(root,"public/homepage-fixture");
bundled.webpack({ mode:"production", entry:path.join(fixtureDirectory,"entry.tsx"),
  output:{path:output,filename:"bundle.js"},
  resolve:{extensions:[".tsx",".ts",".js",".json"],alias:{"next/link":path.join(fixtureDirectory,"navigation.tsx"),"@/components/home-brand-link":path.join(fixtureDirectory,"navigation.tsx"),"@":path.join(root,"src")}},
  module:{rules:[{test:/\.(tsx?|css)$/,exclude:/node_modules/,use:[path.join(fixtureDirectory,"loader.mjs")]}]},
  optimization:{minimize:false},
},(error,stats)=>{
  if(error || stats.hasErrors()){console.error(error || stats.toString({all:false,errors:true}));process.exitCode=1;return;}
  fs.writeFileSync(path.join(output,"index.html"),fs.readFileSync(path.join(fixtureDirectory,"harness.html")));
  console.log("Homepage fixture built. Delete public/homepage-fixture before committing.");
});
