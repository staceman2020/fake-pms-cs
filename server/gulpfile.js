/* eslint-disable no-var */
//import _ from "lodash";
//import run from "gulp-run";
//import gulp from "gulp";
var gulp = require("gulp");
const { series } = require("gulp");
var cp = require("child_process");

const roadmapDir = "../roadmap-metadata";
const pictureDir = "../picture-frame";

function buildSolution(name, cb, dir) {
  cp.exec(`cd ${dir} && npm run build`, function (err, stdout, stderr) {
    console.log(stdout);

    if (err) {
      console.error(stderr);

      cb(err);
    }

    console.log(`${name} Build - Succes`);

    //
    gulp.src(`${dir}/dist/**/*`).pipe(gulp.dest(`./static/${name}`));

    cb();
  });
}

function buildRoadmap(cb) {
  buildSolution("roadmap", cb, roadmapDir);
}

function buildPix(cb) {
  buildSolution("pictureframe", cb, pictureDir);
}

//exports.syncDependencies = syncDependencies;
exports.default = series(buildRoadmap, buildPix);
exports.buildPix = buildPix;
