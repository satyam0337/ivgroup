import sh from "shelljs"

sh.cd(import.meta.dirname)
sh.cd("..")

if (process.argv.includes("--typecheck")) {
  let tsc = sh.exec("./node_modules/.bin/tsc -p tsconfig.app.json --noEmit")
  if (tsc.code !== 0) process.exit(tsc.code)
}

sh.exec("./node_modules/.bin/vite build")

sh.cd("dist/assets")
sh.mkdir("../../../ivcargo/src/main/webapp/resources/iveditor")
sh.cp(sh.ls("index*.js")[0], "../../../ivcargo/src/main/webapp/resources/iveditor/index.js")
sh.cp(sh.ls("index*.css")[0], "../../../ivcargo/src/main/webapp/resources/iveditor/index.css")
