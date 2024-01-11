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
        return {date, payee_name, memo, amount, account_id,
            import_id: `YNAB:${amount}:${date}:1`, approved: false}
    }

    getYnabAmount(amount, isOutflow = true) {
        amount = amount * 1000
        if (isOutflow) {
            amount = amount * -1;
        }

        return amount;
    }

    getYnabDate(year, month, day) {
        const date = new Date(year, month - 1, day);
        return date.toISOString().split('T')[0]
    }

    static getFileExtension(filename) {
        let extensionRegex = /(?:\.([^.]+))?$/;
        let match = extensionRegex.exec(filename);
        return match ? match[1] || "" : "";
    }
}