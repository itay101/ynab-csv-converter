import CSVFileProcessor from "@/lib/processors/base/CSVFileProcessor";

const IDENTIFIER = "shekel"
export default class MaxProcessor extends CSVFileProcessor {
    constructor() {
        super();
    }

    async getIdentifier(file) {
        if (file.name.startsWith(IDENTIFIER)) {
            return "poalim"
        }
        return null;
    }
}