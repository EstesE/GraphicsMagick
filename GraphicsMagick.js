var gm = require('gm');
var im = require("imagemagick")
var fs = require('fs');
var path = require('path');
var async = require('async');
var cnt = 1;

var processQueue = async.queue(function (task, callback) {
    var basename = path.basename(task.file.toLowerCase(), '.jpg');
    var dirname = path.dirname(task.file);

    gm(task.file)
        .size(function (err, size) {
            if (!err) {
                if (size.width > task.width) {
                    gm(task.file)
                        .resize(task.width)
                        .write(dirname + '/' + basename.split('.')[0] + task.suffix + '.jpg', function (err) {
                            if (err) {
                                console.log('Uh Oh: ' + err);
                                return console.dir(arguments);
                            }
                            console.log('-----------------------------------------------\n');
                            console.log(this.outname + " created " + arguments[3]);
                            console.log('-----------------------------------------------\n\n');
                        });
                }
            } else {
                console.log('ERROR: ' + err);
            }
        });
}, cnt);

var walk = function (root, images) {
    var files = fs.readdirSync(root);
    for (var f in files) {
        cnt++;
        var file = path.join(root, files[f]);
        var stat = fs.statSync(file);

        if (stat.isDirectory()) {
            walk(file);
        } else {
            var ext = path.extname(file);

            // ------ Gallery-Photos ------
            if (file.indexOf('gallery-photos') > -1 && ext.toLowerCase() === '.jpg') {
                if (file.indexOf('_sm') == -1) {
                    processQueue.push({ file: file, width: 360, suffix: '_sm' }, function (err) {
                        if (!err) {
                            //console.log('Processing: ', file);
                        } else {
                            console.log('ERROR: ', err);
                        }
                    });
                }
                processQueue.push({ file: file, width: 800, suffix: '' }, function (err) {
                    if (!err) {
                        console.log('Processing: ', file);
                    } else {
                        console.log('ERROR: ', err);
                    }
                });
            }

            // ------ Index-Photos ------
            if (file.indexOf('index-photos') > -1 && ext.toLowerCase() === '.jpg') {
                if (file.indexOf('_md') == -1) {
                    processQueue.push({ file: file, width: 760, suffix: '_md' }, function (err) {
                        if (!err) {
                            //console.log('Successfully Processed: ', file);
                        } else {
                            console.log('Error: ', err);
                        }
                    });
                }
                processQueue.push({ file: file, width: 2048, suffix: '' }, function (err) {
                    if (!err) {
                        //console.log('Successfully Processed: ', file);
                    } else {
                        console.log('Error: ', err);
                    }
                });
            }

            // ------ Other Images... ------
            if (file.indexOf('index-photos') == -1 && file.indexOf('gallery-photos') == -1 && file.indexOf('floorplans') == -1 && file.indexOf('forms') == -1 && ext.toLowerCase() === '.jpg') {
                if (file.indexOf('_sm') == -1) {
                    processQueue.push({ file: file, width: 800, suffix: '_sm' }, function (err) {
                        if (!err) {
                            //console.log('Successfully Processed: ', file);
                        } else {
                            console.log('Error: ', err);
                        }
                    });
                }
                processQueue.push({ file: file, width: 2048, suffix: '' }, function (err) {
                    if (!err) {
                        //console.log('Successfully Processed: ', file);
                    } else {
                        console.log('Error: ', err);
                    }
                });
            }

        }
        cnt++;
        processQueue.concurrency = cnt;
    }
}

walk('.');