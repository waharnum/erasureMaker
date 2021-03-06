fluid.defaults("ca.alanharnum.erasureMaker.textIndex", {
    gradeNames: ["fluid.component"],
    events: {
        onTextsReady: null
    },
    components: {
        availableErasureTexts: {
            type: "ca.alanharnum.erasureMaker.availableErasureTexts",
            options: {
                listeners: {
                    "onTextsChanged.escalate": {
                        func: "{textIndex}.events.onTextsReady.fire"
                    }
                }
            }
        },
        indexMarkup: {
            type: "fluid.viewComponent",
            createOnEvent: "onTextsReady",
            container: ".ahc-erasureMaker-textIndex",
            options: {
                gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent"],
                strings: {
                    markup: {
                        expander: {
                            funcName: "ca.alanharnum.erasureMaker.textIndex.generateMarkup",
                            args: "{availableErasureTexts}"
                        }
                    }
                },
                selectors: {
                    "index-item": ".index-item"
                },
                listeners: {
                    "onCreate.addIndexes": {
                        funcName: "ca.alanharnum.erasureMaker.textIndex.addIndexes",
                        args: ["{that}"]
                    }
                }
            }
        }
    }
});

ca.alanharnum.erasureMaker.textIndex.generateMarkup = function (availableErasureTexts) {
    var indexMarkup = "<h2>Text Excerpts</h2>";

    var textsAsArray = fluid.hashToArray(availableErasureTexts.model.texts, "textKey");


    textsAsArray.sort(function (textA, textB) {
        if(textA.title < textB.title) return -1;
        if(textA.title > textB.title) return 1;
        return 0;
    });

    fluid.each(textsAsArray, function (text, idx) {
        var textMarkup =
        `
            <h3 data-textKey="${text.textKey}" class="index-item">${text.title}, ${text.author} <a class="index-item-new-erasure" href="edit.html?textId=${text.textKey}">Create New Erasure from This Excerpt</a></h3>
        `
        indexMarkup = indexMarkup + textMarkup;
    })
    return indexMarkup;
};

ca.alanharnum.erasureMaker.textIndex.addIndexes = function (that) {
    var indexItems = that.locate("index-item");
    fluid.each(indexItems, function (indexItem) {
        var indexItemDOM = $(indexItem);
        var textKey = indexItemDOM.attr("data-textKey");

        var indexURL = `http://${window.location.host}/indexes/${textKey}`;
        var jqxhr = $.get(indexURL, function () {})
            .done(function (data) {
                var erasureIndex = JSON.parse(data);
                indexItemDOM.after("<ol class='index-list'></ol>");
                fluid.each(erasureIndex, function (erasureIndexItem) {
                    var list = indexItemDOM.next("ol");
                    list.append(`<li class="index-list-item"><a href="view.html?erasureId=${erasureIndexItem.erasureKey}">${erasureIndexItem.erasureTitle}</a></li>`);
                });
            })
            .fail(function (error) {
                indexItemDOM.after("<ul class='index-list'></ul>");
                var list = indexItemDOM.next("ul");
                list.append(`<li class="index-list-item">No erasures for this excerpt yet; maybe you should <a href="edit.html?textId=${textKey}">create one.</a></li>`);
                // indexItemDOM.remove();
            });
    })
};
