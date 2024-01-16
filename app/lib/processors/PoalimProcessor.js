import CSVFileProcessor from "@/lib/processors/base/CSVFileProcessor";
import {getConfigByIdentifier} from "@/lib/accounts";

const IDENTIFIER = "shekel"
const COLUMN_HEADER_DATE = 'תאריך'
const COLUMN_HEADER_PAYEE = 'תיאור הפעולה'
const COLUMN_HEADER_MEMO = 'אסמכתא'
const COLUMN_HEADER_OUTFLOW = 'חובה'
const COLUMN_HEADER_INFLOW = 'זכות'

export default class MaxProcessor extends CSVFileProcessor {
    constructor() {
        super();
    }

    async process(file) {
        const rawData = await this.readCSVFile(file);
        const identifier = await this.getIdentifier(file);
        const {account_id} = getConfigByIdentifier(identifier);
        return rawData.map(row => {
            const amount = this.getYnabAmount(row[COLUMN_HEADER_OUTFLOW] || row[COLUMN_HEADER_INFLOW] || 0, row[COLUMN_HEADER_INFLOW] === "")
            return this.getYnabJsonObject(
                row[COLUMN_HEADER_DATE],
                row[COLUMN_HEADER_PAYEE].trim(),
                row[COLUMN_HEADER_MEMO].trim(),
                amount,
                account_id
            );
        })
    }

    async getIdentifier(file) {
        if (file.name.startsWith(IDENTIFIER)) {
            return "poalim"
        }
        return null;
    }
}