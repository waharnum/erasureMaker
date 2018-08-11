fluid.defaults("ca.alanharnum.erasureMakerView", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        eraseStyle: "faded"
        // displayedErasure: null
    },
    modelListeners: {
    },
    events: {
        "onTextsReady": null
    },
    components: {
        erasureText: {
            type: "ca.alanharnum.erasureMaker.text.view",
            container: ".erasureMaker-text",
            createOnEvent: "onTextsReady",
            options: {
                model: {
                    currentMode: "{erasureMakerView}.model.currentMode",
                    eraseStyle: "{erasureMakerView}.model.eraseStyle",
                    availableTexts: "{availableErasureTexts}.model.texts"
                },
                modelListeners: {
                    "{erasureMakerView}.model.displayedErasure": {
                        func: "ca.alanharnum.erasureMaker.loadErasure",
                        args: ["{that}", "{erasureMakerView}.model.displayedErasure"]
                    },
                    eraseStyle: {
                        funcName: "ca.alanharnum.erasureMaker.text.changeEraseStyle",
                        args: ["{that}", "{that}.model.eraseStyle"]
                    }
                },
            }
        },
        erasureControls: {
            type: "ca.alanharnum.erasureMaker.controls.view",
            container: ".erasureMaker-controls",
            createOnEvent: "onTextsReady",
            options: {
                model: {
                    eraseStyle: "{erasureMakerView}.model.eraseStyle"
                }
            }
        },
        availableErasureTexts: {
            type: "ca.alanharnum.erasureMaker.availableErasureTexts",
            createOnEvent: "onMarkupAppended",
            options: {
                listeners: {
                    "onTextsChanged.escalate": {
                        func: "{erasureMakerView}.events.onTextsReady.fire"
                    }
                }
            }
        }
    },
    strings: {
        markup:
        `
        <div class="erasureMaker-controls"></div>
        <div class="erasureMaker-text"></div>
        `
    }
});

fluid.defaults("ca.alanharnum.erasureMakerEdit", {
    gradeNames: ["ca.alanharnum.erasureMakerView"],
    model: {
        currentMode: "word"
    },
    components: {
        erasureText: {
            type: "ca.alanharnum.erasureMaker.text.edit"
        },
        erasureControls: {
            type: "ca.alanharnum.erasureMaker.controls.edit",
            options: {
                model: {
                    currentMode: "{erasureMakerView}.model.currentMode",
                },
                listeners: {
                    "onMarkupAppended.addTextFunctionControls": {
                        func: "ca.alanharnum.erasureMaker.addTextFunctionControls",
                        args: ["{that}", "{erasureText}"]
                    }
                }
            }
        }
    }
});

ca.alanharnum.erasureMaker.addTextFunctionControls = function (erasureControlsComponent, erasureTextComponent) {

        erasureControlsComponent.locate("function-control-erase-all").click(function () {
            erasureTextComponent.locate("character").each(function() {
              $(this).addClass("er");
          });
        });

        erasureControlsComponent.locate("function-control-restore-all").click(function () {
            erasureTextComponent.locate("character").each(function() {
              $(this).removeClass("er");
          });
        });

        erasureControlsComponent.locate("function-control-save").click(function () {
            var erasureText = erasureTextComponent.locate("text").html();

            var erasureTitle = fluid.get(erasureTextComponent.model, "erasureTitle");

            if(erasureTitle === "") {
                erasureTitle = "Untitled";
            }

            var confirmed = confirm(`Do you want to save the erasure "${erasureTitle}"? You can only save once, so cancel if you want to work on it further.\n\nPlease also note that all erasures saved to this site are submitted anonymously and you agree to license your work under a Creative Commons 0 license by saving them here.`);
            if(!confirmed) return;

            var erasureData = {
                                title: erasureTitle,
                                text: erasureText,
                                sourceKey: erasureTextComponent.sourceText.key,
                                sourceURL: erasureTextComponent.sourceText.sourceURL,
                                sourceTextAuthor: erasureTextComponent.sourceText.author,
                                sourceTextTitle: erasureTextComponent.sourceText.title
                            };

            $.post(`http://${window.location.host}/erasure/NEW`, erasureData, function (data) {
                var saveInfo = JSON.parse(data);
                erasureControlsComponent.locate("message-area").append(`Your erasure "${erasureTitle}" has been saved and can be <a href="view.html?erasureId=${saveInfo.savedErasureId}">viewed at this link</a>.`).fadeIn();
                erasureControlsComponent.locate("function-control-save").fadeOut();
            });
        });

};

ca.alanharnum.erasureMaker.loadErasure = function (erasureTextComponent, erasureId) {
    var url = `http://${window.location.host}/erasure/` + erasureId;
    $.get(`http://${window.location.host}/erasure/` + erasureId, function ( data ) {
        var erasure = JSON.parse(data);
        erasureTextComponent.locate("text").html(erasure.text);
        var erasureTitle = erasure.title;
        var sourceMarkup = `Original text from <em>${erasure.sourceTextTitle}</em> by ${erasure.sourceTextAuthor} (<a href='${erasure.sourceURL}'>source</a>)`;
        erasureTextComponent.locate("source").html(sourceMarkup);
        erasureTextComponent.locate("erasureTitle").html(`<a href="/view.html?erasureId=${erasure.id}">${erasureTitle}</a>`);
   });
};

fluid.defaults("ca.alanharnum.erasureMaker.text.view", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        eraseStyle: "faded",
        availableTexts: {
            quickBrownFox: {
                source: "http://alanharnum.ca",
                text: "The quick brown fox\n\njumped over\n\nthe lazy dog"
            }
        },
        erasureTitle: "Untitled",
        // Will receive an ID if retrieved from storage
        id: null
    },
    selectors: {
        "text": ".erasureText",
        "source": ".source",
        "paragraph": ".paragraph",
        "character": ".char",
        "fade": ".fd",
        "erasureTitle": ".erasureTitle",
        "erasureTitleContainer": ".erasureTitleContainer"
    },
    strings: {
        markup:
        `
        <div class="erasureTitleContainer"><h2 class="erasureTitle"></h2></div>
        <div class="erasureText eraseStyle-faded"></div>
        <p class="source"></p>
        `
    },
    listeners: {

    }
});

fluid.defaults("ca.alanharnum.erasureMaker.text.edit", {
    gradeNames: ["ca.alanharnum.erasureMaker.text.view"],
    model: {
        currentMode: "word"
    },
    listeners: {
        "onMarkupAppended.addSourceText": {
            func: "ca.alanharnum.erasureMaker.text.addSourceText",
            args: ["{that}"]
        },
        "onMarkupAppended.addErasureByCharacterStructure": {
            func: "ca.alanharnum.erasureMaker.text.addErasureByCharacterStructure",
            args: ["{that}"],
            priority: "after:addSourceText"
        },
        "onMarkupAppended.addCharacterErasureEvents": {
            func: "ca.alanharnum.erasureMaker.text.addCharacterErasureEvents",
            args: ["{that}"],
            priority: "after:addErasureByCharacterStructure"
        }
    }
});

ca.alanharnum.erasureMaker.text.changeEraseStyle = function (erasureTextComponent, eraseStyle) {
    var text = erasureTextComponent.locate("text");
    var eraseStyleClass = "eraseStyle-" + eraseStyle;
    text.toggleClass();
    text.addClass("erasureText " + eraseStyleClass);
};

ca.alanharnum.erasureMaker.text.addSourceText = function (that) {

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    var chosenText = fluid.get(that.model, "chosenText");

    var selectedText;

    if(!chosenText) {
        var availableTexts = fluid.hashToArray(that.model.availableTexts, "key");

        selectedText = availableTexts[getRandomInt(availableTexts.length)];
    } else if(chosenText) {
        selectedText = fluid.get(that.model.availableTexts, chosenText);
    }

    var sourceURL = selectedText.sourceURL;
    var title = selectedText.title;
    var author = selectedText.author;
    var key = selectedText.key || chosenText;


    that.sourceText = {
        sourceURL: sourceURL,
        title: title,
        author: author,
        key: key
    };

    var sourceMarkup = `Original text excerpt from <em>${title}</em> by ${author} (<a href='${sourceURL}'>source</a>)`;

    that.locate("source").append(sourceMarkup);

    // TODO: this doesn't really belong here
    that.locate("erasureTitle").html(`${fluid.get(that.model, "erasureTitle")}`);

    var text = selectedText.text;

    var splitText = text.split("\n\n");

    splitText.forEach(function (para) {
        var paraMarkup = "<p class='paragraph'>" + para + "</p>";
        that.locate("text").append(paraMarkup);
    });

};

ca.alanharnum.erasureMaker.text.addErasureByCharacterStructure = function (that) {
        that.locate("paragraph").each(function (i,e) {
            var splitText = $(this).text().split("");

            var spannedText = [];

            splitText.forEach(function (currentValue) {
              var spanned = "<span class='char'>" + currentValue + "</span>";
              spannedText.push(spanned);
            });

            $(this).html(spannedText.join(""));
        });
};

ca.alanharnum.erasureMaker.text.addCharacterErasureEvents = function (that) {
    that.locate("character").each(function (i,e) {
        $(this).click(function () {
          if(that.model.currentMode === "char") {
            $(this).toggleClass("er");
          }
          if(that.model.currentMode === "word") {
            ca.alanharnum.erasureMaker.text.toggleWord(this)
          }
          if(that.model.currentMode === "titleSelect") {
            ca.alanharnum.erasureMaker.text.addToSaveTitle(this, that);
          }
        });
    });
};

ca.alanharnum.erasureMaker.text.toggleWord = function (characterSelector) {
  var isErased = $(characterSelector).hasClass("er");

  var word = ca.alanharnum.erasureMaker.text.getWordFromCharacter(characterSelector);
  // if original character erased, toggle off erasing for whole word
  if(isErased) {
      word.removeClass("er");
  // if original character not erased, toggle erasing for whole word
  } else if (!isErased) {
      word.addClass("er");
  }
};

ca.alanharnum.erasureMaker.text.addToSaveTitle = function (characterSelector, erasureText) {
    var currentTitle = fluid.get(erasureText.model, "erasureTitle");
    if(currentTitle === "Untitled") {
        currentTitle = "";
    }
    var updatedTitle = currentTitle + " " + ca.alanharnum.erasureMaker.text.getWordFromCharacter(characterSelector).text().toLowerCase();
    var trimmedTitle = updatedTitle.substr(0,50).trim();
    erasureText.applier.change("erasureTitle", trimmedTitle);
    erasureText.locate("erasureTitle").text(fluid.get(erasureText.model, "erasureTitle"));
};

ca.alanharnum.erasureMaker.text.getWordFromCharacter = function (characterSelector) {
    var prev, next;
    prev = ca.alanharnum.erasureMaker.text.getAdjacentcharacterSelectors(characterSelector, "prev");
    next = ca.alanharnum.erasureMaker.text.getAdjacentcharacterSelectors(characterSelector, "next");
    return $(characterSelector).add(prev).add(next);
};

ca.alanharnum.erasureMaker.text.getAdjacentcharacterSelectors = function (characterSelector, direction) {
  var adjacentcharacterSelectors = $([]);
  if(ca.alanharnum.erasureMaker.text.isPunctuationCharacter($(characterSelector).text())) {
    return adjacentcharacterSelectors;
  }
  var allWordcharacterSelectorsFound = false;
  var currentCharacterSelector = characterSelector;
  while (!allWordcharacterSelectorsFound) {
    currentCharacterSelector = $(currentCharacterSelector)[direction]();
    if(ca.alanharnum.erasureMaker.text.isPunctuationCharacter(currentCharacterSelector.text())) {
      allWordcharacterSelectorsFound = true;
    } else {
      adjacentcharacterSelectors = adjacentcharacterSelectors.add(currentCharacterSelector);
    }
  }
  return adjacentcharacterSelectors;
};

ca.alanharnum.erasureMaker.text.isPunctuationCharacter = function (character) {
  // python.punctuation definition, via https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex#comment39981263_4328722
  var punctuationCharacters = " ['!\"“”#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']";
  if (punctuationCharacters.indexOf(character) > -1) {
    return true;
  } else return false;
};

fluid.defaults("ca.alanharnum.erasureMaker.controls.view", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        eraseStyle: "faded"
    },
    strings: {
        markup:
        `
        <form>
            <label for="select-erase-style">
                <h2 class="control-header">Erasing Style <span class="control-header-explanation">Change appearance of erased text.</span>
                </h2>
                <select class="erase-style-selector" id="select-erase-style">
                    <option value="faded">Faded</option>
                    <option value="strike-through">Strike Through</option>
                    <option value="blacked-out">Blacked Out</option>
                    <option value="removed">Removed</option>
                </select>
            </label>
        </form>
        `
    },
    listeners: {
        "onMarkupAppended.addEraseStyleControl": {
            func: "ca.alanharnum.erasureMaker.controls.addEraseStyleControl",
            args: ["{that}"]
        }
    },
    selectors: {
        "erase-style-selector": ".erase-style-selector"
    }
});

fluid.defaults("ca.alanharnum.erasureMaker.controls.edit", {
    gradeNames: ["ca.alanharnum.erasureMaker.controls.view"],
    model: {
        currentMode: "word"
    },
    strings: {
        markup:
        `
        <form>
            <h2 class="control-header">Cursor Behavior <span class="control-header-explanation">Controls how the cursor interacts with the text. Has keyboard shortcuts.</span></h2>
            <div class="mode-controls controls">
                    <label class="mode-control mode-control-word">
                        <input class="mode-control-word-radio" checked type="radio" name="mode-control-radio" value="word" />
                        click to toggle <span class="keyboard-shortcut-indicator">w</span>ords
                    </label>
                    <label class="mode-control mode-control-char current-control">
                        <input class="mode-control-char-radio" type="radio" name="mode-control-radio" value="char" />
                        click to toggle <span class="keyboard-shortcut-indicator">c</span>haracters
                    </label>
                    <label class="mode-control mode-control-titleSelect">
                        <input class="mode-control-titleSelect-radio" type="radio" name="mode-control-radio" value="titleSelect" />
                        select words for <span class="keyboard-shortcut-indicator">t</span>itle
                    </label>
            </div>
            <h2 class="control-header">Functions <span class="control-header-explanation">Operate on the entire text at once.</span></h2>
            <div class="function-controls controls">
                <button type="button" class="function-control-erase-all">erase all</button>
                <button type="button" class="function-control-restore-all">restore all</button>
                <button type="button" class="function-control-save">save</button>
            </div>
            <div class="message-area"></div>
            <label for="select-erase-style">
                <h2 class="control-header">Erasing Style <span class="control-header-explanation">Change appearance of erased text.</span>
                </h2>
                <select class="erase-style-selector" id="select-erase-style">
                    <option value="faded">Faded</option>
                    <option value="strike-through">Strike Through</option>
                    <option value="blacked-out">Blacked Out</option>
                    <option value="removed">Removed</option>
                </select>
            </label>
        </form>
        `
    },
    listeners: {
        "onMarkupAppended.addKeyboardShortcuts": {
            func: "ca.alanharnum.erasureMaker.controls.addKeyboardShortcuts",
            args: ["{that}"]
        },
        "onMarkupAppended.addModeControls": {
            func: "ca.alanharnum.erasureMaker.controls.addModeControls",
            args: ["{that}"]
        }
    },
    selectors: {
        "mode-control": ".mode-control",
        "mode-control-char": ".mode-control-char",
        "mode-control-word": ".mode-control-word",
        "mode-control-titleSelect": ".mode-control-titleSelect",
        "function-control-erase-all": ".function-control-erase-all",
        "function-control-restore-all": ".function-control-restore-all",
        "function-control-save": ".function-control-save",
        "message-area": ".message-area"
    }
});

ca.alanharnum.erasureMaker.controls.addKeyboardShortcuts = function (that) {
    $(document).keyup(function (e) {
        if(e.key === "c") {
            that.locate("mode-control-char").click();
        }
        if(e.key === "w") {
            that.locate("mode-control-word").click();
        }
        if(e.key === "t") {
            that.locate("mode-control-titleSelect").click();
        }
    });
};

ca.alanharnum.erasureMaker.controls.addModeControls = function (that) {
    that.locate("mode-control-char").click(function () {
        that.applier.change("currentMode", "char");
        $(this).addClass("current-control");
          that.locate("mode-control").not($(this)).removeClass("current-control");
    });

    that.locate("mode-control-word").click(function () {
        that.applier.change("currentMode", "word");
        $(this).addClass("current-control");
        that.locate("mode-control").not($(this)).removeClass("current-control");
    });

    that.locate("mode-control-titleSelect").click(function () {
        that.applier.change("currentMode", "titleSelect");
        $(this).addClass("current-control");
        that.locate("mode-control").not($(this)).removeClass("current-control");
    });

};

ca.alanharnum.erasureMaker.controls.addEraseStyleControl = function (that) {
    var eraseStyleSelector = that.locate("erase-style-selector").change(function () {
        var val = $(this).val();
        that.applier.change("eraseStyle", val);
    });

};
