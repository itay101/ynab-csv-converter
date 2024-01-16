import FileUpload from "@/components/FileUpload.js";

export default function Home() {
    return (
        <main className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">File Upload Example</h1>
            <FileUpload/>
        </main>
    )
}
