fluid.defaults("ca.alanharnum.erasureMaker.textIndex", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    components: {
        availableErasureTexts: {
            type: "ca.alanharnum.erasureMaker.availableErasureTexts"
        }
    },
    strings: {
        markup: {
            expander: {
                funcName: "ca.alanharnum.erasureMaker.textIndex.generateMarkup",
                args: "{that}.availableErasureTexts"
            }
        }
    },
    selectors: {
        "index-item": ".index-item"
    },
    listeners: {
        "onMarkupAppended.addIndexes": {
            funcName: "ca.alanharnum.erasureMaker.textIndex.addIndexes"
        }
    }
});

ca.alanharnum.erasureMaker.textIndex.generateMarkup = function (availableErasureTexts) {
    var indexMarkup = "";
    fluid.each(availableErasureTexts.options.texts, function (text, textKey) {
        var textMarkup =
        `
            <p data-textKey="${textKey}" class="index-item">${text.title}, ${text.author}</p>
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
        var indexURL = `http://localhost:8081/indexes/${textKey}`;
        $.get(indexURL, function (data) {
            var erasureIndex = JSON.parse(data);
            indexItemDOM.append("<ul></ul>")
            fluid.each(erasureIndex, function (erasureIndexItem) {
                var list = indexItemDOM.find("ul");
                list.append(`<li>${erasureIndexItem.erasureTitle}</li>`)
            });
        });
    })
};