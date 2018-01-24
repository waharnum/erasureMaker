"use strict";

var fluid = require("infusion");
require("kettle");

var ca = fluid.registerNamespace("ca");

fluid.defaults("ca.alanharnum.erasuremaker.server", {
    gradeNames: "fluid.component",
    components: {
        server: {
            type: "kettle.server",
            options: {
                port: 8081,
                components: {
                    ui: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./client"
                        }
                    },
                    nodeModules: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./node_modules"
                        }
                    },
                    app: {
                        type: "ca.alanharnum.erasuremaker.server.app.handlers"
                    }
                }
            }
        }
    }
});

fluid.defaults("ca.alanharnum.erasuremaker.server.app.handlers", {
     gradeNames: ["kettle.app"],
     requestHandlers: {
         nodeModulesHandler: {
            type: "ca.alanharnum.erasuremaker.server.nodeModulesHandler",
            "route": "/*",
            "method": "get",
            "prefix": "/node_modules"
        },
        uiHandler: {
            type: "ca.alanharnum.erasuremaker.server.uiHandler",
            "route": "/*",
            "method": "get"
        }
     }
});

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

var server = ca.alanharnum.erasuremaker.server();
