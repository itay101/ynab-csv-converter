import {getConfigByIdentifier} from "@/lib/accounts";
import FileProcessor from "@/lib/processors/base/FileProcessor";
import MaxProcessor from "@/lib/processors/MaxProcessor";
import IsracardProcessor from "@/lib/processors/IsracardProcessor";

const PROCESSORS = [MaxProcessor, IsracardProcessor];

async function getIdentifierFromFile(file) {
    const fileExtension = FileProcessor.getFileExtension(file.name)
    let identifier;
    for (let i = 0; i < PROCESSORS.length; i++) {
        const processor = new PROCESSORS[i]();
        if (processor.fileExtension !== fileExtension) continue;
        identifier = await processor.getIdentifier(file)
    }
    if (!identifier) {
        throw new Error(`Identifier not found for file: ${file.name}`)
    } else {
        return identifier
    }
}

export async function identifyFile(file) {
    const identifierFromFile = await getIdentifierFromFile(file);
    const config = getConfigByIdentifier(identifierFromFile);
    return {...config, fileName: file.name};
}