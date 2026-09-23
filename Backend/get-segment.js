import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, ".env")
});

if (!process.env.RESEND_API_KEY) {
    console.error("ERROR: RESEND_API_KEY is missing from .env");
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function getSegments() {
    const { data, error } = await resend.segments.list();

    if (error) {
        console.error("ERROR:", error);
        return;
    }

    console.log("\n========== RESEND SEGMENTS ==========\n");

    if (!data?.data || data.data.length === 0) {
        console.log("No segments found.");
        return;
    }

    data.data.forEach((segment, index) => {
        console.log(`${index + 1}. ${segment.name}`);
        console.log(`   ID: ${segment.id}`);
        console.log("");
    });

    console.log("=====================================\n");
}

getSegments();