/*
* @Author: huangzexia
* @Date:   2016-08-17 10:25:09
* @Last Modified by:   huangzexia
* @Last Modified time: 2017-01-11 16:27:54
*/
var gulp = require('gulp');//  引入 gulp
var browserSync = require('browser-sync').create();// browser-sync 实时刷新
var sourcemaps = require('gulp-sourcemaps');// 源码压缩之后不易报错定位  sourcemaps用于错误查找
var minifycss = require('gulp-minify-css');// 压缩css
var autoprefixer = require('gulp-autoprefixer');// 处理浏览器私有前缀
var babel = require('gulp-babel');// 编译ES6语法
var uglify = require('gulp-uglify');// 压缩js
var imagemin = require('gulp-imagemin');// 压缩图片
var contentIncluder = require('gulp-content-includer');//通过includer导入方式导入不同的模块
var cache = require('gulp-cache');//清除缓存
var rev = require('gulp-rev-append');//添加MD5
var postcss = require('gulp-postcss');
var cssnext = require('cssnext');//使用CSS未来的语法
var precss = require('precss');//编写Sass的函数
// 静态服务器 + 监听 scss/html/js/images 文件
gulp.task('serve', ['css',"html","copyJs","js","images"], function() {
    browserSync.init({
        server: "./dest"
    });
    gulp.watch("src/module/**/css/*.scss", ['css']);
    gulp.watch("src/module/**/*.html", ['copyHtml']);
    gulp.watch("src/module/public/**/*", ['copyJs']);
    gulp.watch("src/module/**/js/*.js", ['js']);
    gulp.watch("src/module/**/images/*.*", ['images']);
    gulp.watch("*.html").on('change', browserSync.reload);
});

// 编译压缩css 输出到目标目录
gulp.task('css', function () {
  var processors = [
    autoprefixer,
    cssnext,
    precss
  ];
  gulp.src(['src/module/**/css/*.css','src/module/public/css/*.css'])
    .pipe(postcss(processors))
    .pipe(autoprefixer({
        browsers: ['last 2 versions', 'Android >= 4.0'],
        cascade: true
    }))
    .pipe(minifycss())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dest/'))
    .pipe(browserSync.stream());
})

// 编译压缩js 输出到目标目录
gulp.task('js', function () {
  gulp.src(['src/module/**/js/*.js','!src/module/public/js/*.js'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify({
      mangle: true, //fasle不混淆变量名 true为混淆
      preserveComments: 'some' //不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
    }))
    .pipe(gulp.dest('dest/'))
    .pipe(browserSync.stream());
});

// 图片压缩  输出到目标目录
gulp.task('images', function () {
  gulp.src(['src/module/**/images/*.*','src/module/public/images/*.*'])
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      interlaced: true,
      progressive: true
    })))
    .pipe(gulp.dest('dest/'))
    .pipe(browserSync.stream());
});

// 拷贝 html
gulp.task('html', function() {
  gulp.src(['src/module/**/*.html','!src/module/public/html/*.html'])
    .pipe(contentIncluder({
      includerReg:/<!\-\-include\s+"([^"]+)"\-\->/g
    }))
    .pipe(rev())
    .pipe(gulp.dest('dest/'))
    .pipe(browserSync.stream());
});

// 拷贝 public下面的js
gulp.task('copyJs', function() {
  gulp.src('src/module/public/js/**/*',{base: 'src/module/public/'})
    .pipe(uglify({
        mangle: true, //fasle不混淆变量名 true为混淆
        preserveComments: 'some' //不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
    }))
    .pipe(gulp.dest('dest/public'))
    .pipe(browserSync.stream());
});

//执行默认任务
gulp.task('default', ['serve'])
