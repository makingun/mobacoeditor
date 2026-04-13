export class LangUtils {
    static detectLanguage(name: string) {
        var ext = name.split(".").pop();
        if (!ext) ext = '';
        return {
            js: "javascript",
            ts: "typescript",
            json: "json",
            md: "markdown",
            html: "html",
            css: "css"
        }[ext] || "plaintext";
    }
}
