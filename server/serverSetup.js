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
                    erasureDataSource: {
                        type: "ca.alanharnum.erasuremaker.server.dataSource.file"
                    },
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
        saveErasureHandler: {
            type: "ca.alanharnum.erasuremaker.server.saveErasureHandler",
            "route": "/erasure/:id",
            "method": "post"
        },
        getErasureHandler: {
          type: "ca.alanharnum.erasuremaker.server.getErasureHandler",
          "route": "/erasure/:id",
          "method": "get"
        },
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
