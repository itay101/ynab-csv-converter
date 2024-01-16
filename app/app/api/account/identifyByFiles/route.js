import {identifyFile} from "@/lib/processors/processors";

export async function POST(request) {
    const formData = await request.formData()
    const files = formData.getAll('files[]');
    const identifiedFiles = await Promise.all(files.map(identifyFile))
    return new Response(JSON.stringify(identifiedFiles), {
        headers: {'Content-Type': 'application/json'}
    });
}
