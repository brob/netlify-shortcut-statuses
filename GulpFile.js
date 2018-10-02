'use strict';

var gulp = require('gulp'),
    run = require('gulp-run'),
    gutil = require('gulp-util'),
    runSequence = require('run-sequence'),
    fs = require('file-system'),
    request = require('request');

require('dotenv').config();
var buildSrc = "./";


gulp.task('build:jekyll', function () {
    var shellCommand = 'jekyll build';

    return gulp.src('')
        .pipe(run(shellCommand))
        .on('error', gutil.log);
});

gulp.task('serve:jekyll', function () {
    var shellCommand = "jekyll serve";

    return gulp.src('')
        .pipe(run(shellCommand))
        .on('error', gutil.log);
});

gulp.task('lambda:build', function () {
    var shellCommand = "netlify-lambda build lambda_build";

    return gulp.src('')
        .pipe(run(shellCommand))
        .on('error', gutil.log);
});

gulp.task('status:get', function () {
    var url = `https://api.netlify.com/api/v1/forms/${process.env.APPROVED_COMMENTS_FORM_ID}/submissions/?access_token=${process.env.API_AUTH}`;
    console.log(url);
    request(url, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            var body = JSON.parse(body);
            var statuses = [];
            // massage the data into the shape we want,
            for (var item in body) {
                var data = body[item].data;
                if (data.imgUrl.endsWith('.jpg')) {
                    let idSplit = data.imgUrl.split('.j');
                    data.imgUrl = idSplit[0];
                }
                var status = {
                    status: data.doing,
                    imgUrl: data.imgUrl,
                    date: body[item].created_at
                };
                statuses.push(status);
            }

            // Write the status to a data file
            fs.writeFile(buildSrc + "/_data/statuses.json", JSON.stringify(statuses, null, 2), function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Comments data saved.");
                }
            });

        } else {
            console.log("Couldn't get comments from Netlify");
        }
    });
});


gulp.task('default', function () {
    runSequence('status:get', 'serve:jekyll');
});

gulp.task('build', function (callback) {
    runSequence('status:get', 'build:jekyll', 'lambda:build');
});