"use strict";

var fluid = require("infusion");
var fs = require("fs");

var storagePath = "./storage/erasures/";
var indexesPath = "./storage/indexes/"

var index = {};

fs.readdir(storagePath, function(err, files) {
    files.forEach(function (filename) {
        if(filename !== ".gitignore") {
            var filePath = storagePath + filename;

            var data = fs.readFileSync(filePath, "utf8");
            var storedErasure = JSON.parse(data);
            var erasureDetails = {
                sourceKey: storedErasure.sourceKey,
                erasureKey: filename,
                erasureTitle: storedErasure.title,
                sourceURL: storedErasure.sourceURL,
                sourceTextAuthor: storedErasure.sourceTextAuthor,
                sourceTextTitle: storedErasure.sourceTextTitle
            };

            var indexAt = index[erasureDetails.sourceKey] ? index[erasureDetails.sourceKey] : index[erasureDetails.sourceKey] = {};

            indexAt[erasureDetails.erasureKey] = erasureDetails;

        }
    });

    fluid.each(index, function (content, key) {
        fs.writeFile(indexesPath + key, JSON.stringify(content), function (err) {
            if(err) {
                console.log("Error updating index for " + key);
            } else {
                console.log("Index file for " + key + " updated");
            }
        });
    });
});
