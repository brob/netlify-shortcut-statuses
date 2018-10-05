'use strict';

var gulp = require('gulp'),
    run = require('gulp-run'),
    gutil = require('gulp-util'),
    runSequence = require('run-sequence'),
    fs = require('fs'),
    request = require('request');

require('dotenv').config();
var buildSrc = "./";


var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){      
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

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

gulp.task('image:get', function() {
    function imageNeeds() {
        var idList = fs.readFileSync('_data/statuses.json', 'utf8', function(err, contents) {
            return statuses;
        });
        var jsonEncoded = JSON.parse(idList);
        const statusImageIds = jsonEncoded.map(status => { let split = status.imgUrl.split('/'); return split[split.length - 1]; });
        return statusImageIds;
    } 
    function currentlyDownloaded() {

        const files = fs.readdirSync('./images/statusImages', (err, files) => {
            return files;        
        });
        const imageIds = files.map(imageUrl => imageUrl.replace('.jpg', ''));
        return imageIds;
    }

    const imageIdList = imageNeeds();
    const downloadedIdList = currentlyDownloaded();

    let needToDownload = imageIdList.filter(e => {
        return ! downloadedIdList.includes(e);
    });

    needToDownload.forEach(fileId => {
        let url = `https://imgur.com/download/${fileId}`;
        let fileName = `./images/statusImages/${fileId}.jpg`
        download(url, fileName, function() {
            console.log(`Downloaded ${url}`);
        })
    });
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
                    localUrl: `/images/statusImages/${data.imgUrl}`,
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
    runSequence('status:get', 'image:get', 'serve:jekyll');
});

gulp.task('build', function (callback) {
    runSequence('status:get', 'image:get', 'build:jekyll', 'lambda:build');
});