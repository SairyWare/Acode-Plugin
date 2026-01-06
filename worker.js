"use strict";
(() => {
    self.onmessage = (e) => {
        const content = e.data;
        if (typeof content !== 'string') return;
        const suggestions = [];
        const lines = content.split("\n");
        const pattern = /(?:local\s+)?(?:function\s+([a-zA-Z0-9_:]+)|([a-zA-Z0-9_]+)\s*=)/;
        lines.forEach(line => {
            const match = line.match(pattern);
            if (match) {
                const name = match[1] || match[2];
                if (name) {
                    suggestions.push({
                        caption: name,
                        value: name,
                        meta: "in-file variable",
                        score: 100
                    });
                }
            }
        });
        self.postMessage({ suggestions });
    };
})();
