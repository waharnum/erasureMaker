"use strict";

var fluid = require("infusion");
require("kettle");
var uuidv1 = require("uuid/v1");

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

    var promise = dataSource.set({directErasureId: id}, request.req.body);

    promise.then(function (response) {
        console.log("success");
        var responseAsJSON = JSON.stringify({message: "Success!", savedErasuseId: id});
        request.events.onSuccess.fire(responseAsJSON);
    }, function (error) {
        console.log("error");
        var errorAsJSON = JSON.stringify(error);
        request.events.onError.fire({
            message: errorAsJSON
        });
    });

};
