import {processFile} from "@/lib/processors/processors";
import {getLocalConfigFile} from "@/lib/accounts";
import {sendTransactionsToYnab} from "@/lib/ynabApi";

export async function POST(request) {
    const {token, budget_id} = getLocalConfigFile();
    const formData = await request.formData()
    const files = formData.getAll('files[]');
    const processedData = await Promise.all(files.map(processFile))
    const response = await sendTransactionsToYnab(token, budget_id, processedData.flat())
    const json = await response.json()
    return new Response(JSON.stringify({
        "imported": json["data"]['transaction_ids'].length,
        "duplicated": json["data"]['duplicate_import_ids'].length
    }), {
        headers: {'Content-Type': 'application/json'}
    });
}
