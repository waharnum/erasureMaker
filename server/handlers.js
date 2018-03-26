"use strict";

var fluid = require("infusion");
require("kettle");
var uuidv1 = require("uuid/v1");
var isuuid = require("is-uuid");
var fs = require("fs");

var ca = fluid.registerNamespace("ca");

fluid.defaults("ca.alanharnum.erasuremaker.server.staticHandlerBase", {
    gradeNames: "kettle.request.http",
    invokers: {
        handleRequest: {
            funcName: "kettle.request.notFoundHandler"
        }
    }
});

fluid.defaults("ca.alanharnum.erasuremaker.server.uiHandler", {
    gradeNames: ["ca.alanharnum.erasuremaker.server.staticHandlerBase"],
    requestMiddleware: {
        "static": {
            middleware: "{server}.ui"
        }
    }
});

fluid.defaults("ca.alanharnum.erasuremaker.server.nodeModulesHandler", {
    gradeNames: ["ca.alanharnum.erasuremaker.server.staticHandlerBase"],
    requestMiddleware: {
        "static": {
            middleware: "{server}.nodeModules",
        }
    }
});

fluid.defaults("ca.alanharnum.erasuremaker.server.saveErasureHandler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "ca.alanharnum.erasuremaker.server.saveErasureHandler.handleRequest",
            args: ["{request}", "{server}.erasureDataSource"]
        }
    }
});

ca.alanharnum.erasuremaker.server.saveErasureHandler.handleRequest = function (request, dataSource) {
    var id = uuidv1();

    if(! isuuid.v1(id)) {
        console.log("Tried to save an erasure with the invalid ID " + id);
        request.events.onError.fire({
            message: "Server error",
            statusCode: 500
        });
    }

    var expectedFields = {
        title: "string",
        text: "string",
        sourceKey: "string",
        sourceURL: "string",
        sourceTextAuthor: "string",
        sourceTextTitle: "string"
    };

    fluid.each(request.req.body, function(fieldValue, fieldKey) {
        var isExpectedField = expectedFields[fieldKey];
        var isExpectedType = typeof fieldValue === expectedFields[fieldKey];
        if(!isExpectedField || !isExpectedType) {
            console.log("error, erasure structure did not validate", {isExpectedField: isExpectedField, isExpectedType: isExpectedType, fieldValue: fieldValue, fieldKey: fieldKey, typeOf: typeof fieldValue});
            request.events.onError.fire({
                message: "Server error",
                statusCode: 500
            });
        }
    });

    var promise = dataSource.set({directErasureId: id}, request.req.body);

    // TODO: sanitize more inputs?
    // TODO: date stamp the erasure here

    promise.then(function (response) {
        var responseAsJSON = JSON.stringify({message: "Save successful", savedErasureId: id});
        request.events.onSuccess.fire(responseAsJSON);
    }, function (error) {
        console.log("error trying to save erasure with id " + id, error);
        var errorAsJSON = JSON.stringify(error);
        request.events.onError.fire({
            message: errorAsJSON
        });
    });
};

fluid.defaults("ca.alanharnum.erasuremaker.server.getErasureHandler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "ca.alanharnum.erasuremaker.server.getErasureHandler.handleRequest",
            args: ["{request}", "{server}.erasureDataSource"]
        }
    }
});

ca.alanharnum.erasuremaker.server.getRandomErasureID = function () {
    var storagePath = "./storage/erasures/";
    var erasureFilenames = [];
    var erasureFiles = fs.readdirSync(storagePath);

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    erasureFiles.forEach(function (filename) {
        if(filename !== ".gitignore") {
            erasureFilenames.push(filename);
        }
    });

    var random = getRandomInt(erasureFilenames.length);

    return erasureFilenames[random];

};

ca.alanharnum.erasuremaker.server.getErasureHandler.handleRequest = function (request, dataSource) {
  var id = request.req.params.id;

  if(id === "RAND") {
      id = ca.alanharnum.erasuremaker.server.getRandomErasureID();
  }

  var promise = dataSource.get({directErasureId: id});

  promise.then(function (response) {
      response.id = id;
      var responseAsJSON = JSON.stringify(response);
      request.events.onSuccess.fire(responseAsJSON);
  }, function (error) {
      console.log("error trying to get erasure with id " + id, error);
      var errorAsJSON = JSON.stringify(error);
      request.events.onError.fire({
          message: errorAsJSON
      });
  });
};

fluid.defaults("ca.alanharnum.erasuremaker.server.getIndexHandler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "ca.alanharnum.erasuremaker.server.getIndexHandler.handleRequest",
            args: ["{request}", "{server}.indexDataSource"]
        }
    }
});

ca.alanharnum.erasuremaker.server.getIndexHandler.handleRequest = function (request, dataSource) {
    var id = request.req.params.id;

    var promise = dataSource.get({directIndexId: id});

    promise.then(function (response) {
        var responseAsJSON = JSON.stringify(response);
        request.events.onSuccess.fire(responseAsJSON);
    }, function (error) {
        console.log("error trying to get index with id " + id, error);
        var errorAsJSON = JSON.stringify(error);
        request.events.onError.fire({
            statusCode: error.statusCode
        });
    });

};
