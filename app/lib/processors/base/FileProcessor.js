export default class FileProcessor {
    constructor({fileExtension}) {
        this.fileExtension = fileExtension
        this.identifier = null
        this.fileData = []
    }

    process() {
        return this.fileData;
    }

    getIdentifier(file) {
        return null;
    }

    static getFileExtension(filename) {
        let extensionRegex = /(?:\.([^.]+))?$/;
        let match = extensionRegex.exec(filename);
        return match ? match[1] : "";
    }
}