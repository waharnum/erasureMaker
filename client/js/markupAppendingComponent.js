fluid.defaults("ca.alanharnum.erasureMaker.markupAppendingComponent", {
        listeners: {
            "onCreate.appendMarkup": {
                "this": "{that}.container",
                "method": "append",
                "args": "{that}.options.strings.markup"
            },
            "onCreate.fireOnMarkupAppended": {
                "func": "{that}.events.onMarkupAppended.fire",
                "priority": "after:appendMarkup"
            }
        },
        strings: {
            markup:
            `
            <div>
                Component markup here; a template literal is an easy way to
                put in a multi-line string.
            </div>
            `
        },
        events: {
            "onMarkupAppended": null
        }
    }
);
