import {processFile} from "@/lib/processors/processors";

export async function POST(request) {
    const formData = await request.formData()
    const files = formData.getAll('files[]');
    const processedData = await Promise.all(files.map(processFile))
    console.log("processed data", processedData.flat());
    return new Response(JSON.stringify({}), {
        headers: {'Content-Type': 'application/json'}
    });
}
