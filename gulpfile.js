const gulp = require("gulp");
const ts = require("gulp-typescript");
const sass = require("gulp-sass")(require("sass"));
const flatten = require('gulp-flatten');
let tsfun = ts.createProject("./tsconfig.json");

// 处理ts
function typescript() {
  return gulp.src("./src/**/*.ts").pipe(tsfun()).pipe(gulp.dest("dist"));
}
// 处理css
function scss() {
  return gulp
    .src(["./src/**/*.sass", "./src/**/*.scss"])
    .pipe(
      sass({
        style: "expanded",
      })
    )
    .pipe(flatten({
      includeParents : - 1
    }))
    .pipe(gulp.dest("dist/public"));
}
// 处理html
function html(){
  return gulp.src("./src/**/*.html").pipe(gulp.dest("dist/public"))
}
// 处理其他文件
function copy(cb) {
  return gulp.src(["./src/**/*.gif"]).pipe(gulp.dest("dist/public"));
}
// 编译
exports.build = gulp.parallel(typescript, scss,html, copy);
// 监听
exports.watch = function(){
    return gulp.watch("./src/**/*",gulp.parallel(typescript,html, scss, copy));
}