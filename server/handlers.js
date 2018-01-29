"use strict";

var fluid = require("infusion");
require("kettle");
var uuidv1 = require("uuid/v1");
var isuuid = require("is-uuid");

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
    var id = request.req.params.id === "NEW" ? uuidv1() : request.req.params.id;

    // // check for valid UUID if passed from browser https://github.com/afram/is-uuid
    if(! isuuid.v1(id)) {
        console.log("Tried to save an erasure with the invalid ID" + id);
        request.events.onError.fire({
            message: "Could not save erasure",
            statusCode: 500
        });
    };

    var promise = dataSource.set({directErasureId: id}, request.req.body);

    // TODO: sanitize more inputs
    // TODO: date stamp the erasure here
    // TODO: investigate 413 errors

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

ca.alanharnum.erasuremaker.server.getErasureHandler.handleRequest = function (request, dataSource) {
  var id = request.req.params.id;

  var promise = dataSource.get({directErasureId: id});

  promise.then(function (response) {
      var responseAsJSON = JSON.stringify(response);
      request.events.onSuccess.fire(responseAsJSON);
  }, function (error) {
      console.log("error trying to get erasure with id " + id, error);
      var errorAsJSON = JSON.stringify(error);
      request.events.onError.fire({
          message: errorAsJSON
      });
  });


}
