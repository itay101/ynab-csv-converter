const {DateTime} = require("luxon");
export default class FileProcessor {
    constructor({fileExtension}) {
        this.fileExtension = fileExtension
    }

    process(file) {
        return null;
    }

    getIdentifier(file) {
        return null;
    }

    getYnabJsonObject(date, payee_name, memo, amount, account_id) {
        return {
            date, payee_name, memo, amount, account_id,
            import_id: `YNAB:${amount}:${date}:1`, approved: false, cleared: "cleared"
        }
    }

    getYnabAmount(amount, isOutflow = true) {
        amount = Math.round(amount * 1000)
        if (isOutflow) {
            amount = amount * -1;
        }

        return amount;
    }

    getYnabDate(year, month, day) {
        const date = DateTime.fromObject({year, month, day});
        return date.toFormat("yyyy-MM-dd");
    }

    static getFileExtension(filename) {
        let extensionRegex = /(?:\.([^.]+))?$/;
        let match = extensionRegex.exec(filename);
        return match ? match[1] || "" : "";
    }
}