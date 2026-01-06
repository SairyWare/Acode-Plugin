"use strict";
(() => {
    const pluginId = "roblox.luau.complete.pro";
    let allData = [];
    let workerSuggestions = [];
    class LuauPlugin {
        async init(baseUrl) {
            try {
                const files = ['keywords.json', 'datatypes.json', 'functions.json'];
                const promises = files.map(file => fetch(baseUrl + file).then(res => res.json()));
                const results = await Promise.all(promises);
                allData = [].concat(...results);
                this.initWorker(baseUrl);
                window.toast("Luau Pro Ready! 🚀", 2000);
                this.setup();
            } catch (err) {
                console.error("Init Error:", err);
            }
        }
        initWorker(baseUrl) {
            this.worker = new Worker(baseUrl + "worker.js");
            this.worker.onmessage = (e) => {
                if (e.data && e.data.suggestions) {
                    workerSuggestions = e.data.suggestions;
                }
            };
            editorManager.on('file-content-changed', () => {
                const content = editorManager.editor.getValue();
                this.worker.postMessage(content);
            });
        }
        setup() {
            const check = setInterval(() => {
                if (window.editorManager && editorManager.editor) {
                    clearInterval(check);
                    editorManager.editor.completers.push({
                        getCompletions: (editor, session, pos, prefix, callback) => {
                            if (prefix.length === 0) return callback(null, []);
                            callback(null, [...allData, ...workerSuggestions]);
                        }
                    });
                }
            }, 1000);
        }
        destroy() {
            if (this.worker) this.worker.terminate();
        }
    }
    if (window.acode) {
        const instance = new LuauPlugin();
        acode.setPluginInit(pluginId, (baseUrl) => instance.init(baseUrl));
        acode.setPluginUnmount(pluginId, () => instance.destroy());
    }
})();
