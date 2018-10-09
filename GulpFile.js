'use strict';

const gulp = require('gulp'),
    run = require('gulp-run'),
    gutil = require('gulp-util'),
    runSequence = require('run-sequence'),
    fs = require('fs'),
    request = require('request');

require('dotenv').config();


function download(uri, filename, callback){
    request.head(uri, function(err, res, body){      
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function cleanFile(filePath, callback) {
    fs.truncate(filePath, 0, callback);
}

function getId(imageUrl) {
    if (imageUrl.endsWith('.jpg')) {
        // protects against imgur URL changes from 'app' source
        let idSplit = imageUrl.split('.j');
        imageUrl = idSplit[0];
    }
    let imgUrlSplit = imageUrl.split('/');
    let imgId = imgUrlSplit[imgUrlSplit.length - 1];
    return imgId
}

function buildStatuses(body) {
    let data = body.data;
    let imgId = getId(data.imgUrl);
    const status = {
        status: data.doing,
        imgUrl: data.imgUrl,
        localUrl: `/images/statusImages/${imgId}.jpg`,
        date: body.created_at
    };
    return status;
}

gulp.task('build:jekyll', function () {
    // Builds Jekyll site
    const shellCommand = 'jekyll build';

    return gulp.src('')
        .pipe(run(shellCommand))
        .on('error', gutil.log);
});

gulp.task('serve:jekyll', function () {
    //Serves Jekyll site locally
    const shellCommand = "jekyll serve";

    return gulp.src('')
        .pipe(run(shellCommand))
        .on('error', gutil.log);
});

gulp.task('lambda:build', function () {
    // Builds Netlify function (for live)
    const shellCommand = "netlify-lambda build lambda_build";

    return gulp.src('')
        .pipe(run(shellCommand))
        .on('error', gutil.log);
});

gulp.task('image:get', function() {
    function imageNeeds() {
        // Creates array of all image IDs in JSON file
        let idList = fs.readFileSync('_data/statuses.json', 'utf8', function(err, contents) {
            return statuses;
        });
        let jsonEncoded = JSON.parse(idList);
        const statusImageIds = jsonEncoded.map(status => { let split = status.imgUrl.split('/'); return split[split.length - 1]; });
        return statusImageIds;
    } 
    function currentlyDownloaded() {
        // Creates array of images currently in the project
        const files = fs.readdirSync('./images/statusImages', (err, files) => {
            return files;        
        });
        const imageIds = files.map(imageUrl => imageUrl.replace('.jpg', ''));
        return imageIds;
    }

    const imageIdList = imageNeeds();
    const downloadedIdList = currentlyDownloaded();

    // Filters IDs to find images we need to download
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
    // URL for data store
    let url = `https://api.netlify.com/api/v1/forms/${process.env.STATUS_FORM_ID}/submissions/?access_token=${process.env.API_AUTH}`;
    let statusFile = `./_data/statuses.json`;

    cleanFile(statusFile, function() {
        // Erases JSON file
        console.log(`${statusFile} cleaned`);
        request(url, function (err, response, body) {
            // console.log(body);
            if (!err && response.statusCode === 200) {
                let bodyArray = JSON.parse(body);
                let statuses = bodyArray.map(buildStatuses);

                // Write the status to a data file
                fs.writeFileSync(statusFile, JSON.stringify(statuses, null, 2), function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Status data saved.");
                    }
                });
                console.log(`${statusFile} rebuilt from data`);
    
            } else {
                console.log("Couldn't get statuses from Netlify");
            }
        });
    });
    
});


gulp.task('default', function () {
    runSequence('status:get', 'image:get', 'serve:jekyll');
});

gulp.task('build', function (callback) {
    runSequence('status:get', 'image:get', 'build:jekyll', 'lambda:build');
});