fluid.defaults("ca.alanharnum.erasureMaker.availableErasureTexts", {
    gradeNames: "fluid.modelComponent",
    model: {
        texts: {}
    },
    modelListeners: {
        "texts": {
            func: "{that}.events.onTextsChanged.fire",
            excludeSource: "init"
        }
    },
    components: {
        resourceLoader: {
            type: "fluid.resourceLoader",
            options: {
                resources: {
                    texts: "../json/texts.json"
                },
                listeners: {
                    "onResourcesLoaded.addToModel": {
                        func: "{availableErasureTexts}.applier.change",
                        args: ["texts", "@expand:JSON.parse({that}.resources.texts.resourceText)"]
                    }
                }
            }
        }
    },
    events: {
        onTextsChanged: null
    }});
