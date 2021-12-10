const gulp = require("gulp");
const ts = require("gulp-typescript");
const sass = require("gulp-sass")(require("sass"));
const flatten = require('gulp-flatten');
let tsfun = ts.createProject("./tsconfig.json");

function typescript() {
  return gulp.src("./src/**/*.ts").pipe(tsfun()).pipe(gulp.dest("dist"));
  
}

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
    .pipe(gulp.dest("dist"));
}

function copy(cb) {
  return gulp.src(["./src/**/*.html","./src/**/*.gif"]).pipe(gulp.dest("dist"));
}

exports.build = gulp.parallel(typescript, scss, copy);


exports.watch = function(){
    return gulp.watch("./src/**/*",gulp.parallel(typescript, scss, copy));
    // cb();
}