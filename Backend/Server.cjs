const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { Resend } = require("resend");

// ==========================================
// LOAD .ENV
// ==========================================

dotenv.config({
    path: path.join(__dirname, ".env")
});

// ==========================================
// APP
// ==========================================

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CHECK ENVIRONMENT
// ==========================================

if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is missing from Backend/.env");
    process.exit(1);
}

if (!process.env.RESEND_SEGMENT_ID) {
    console.error("❌ RESEND_SEGMENT_ID is missing from Backend/.env");
    process.exit(1);
}

console.log("✅ Resend API key detected");
console.log("✅ Resend Segment ID detected");

// ==========================================
// RESEND
// ==========================================

const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// PATHS
// ==========================================

const frontendPath = path.join(__dirname, "..");

const ebookPath = path.join(
    __dirname,
    "ebook",
    "B3-Bounce-Back-Better.pdf"
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(express.static(frontendPath));

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// ==========================================
// CAPTURE B3 LEAD
// ==========================================

app.post("/capture-lead", async (req, res) => {

    console.log("\n========================================");
    console.log("NEW B3 LEAD");
    console.log("========================================");

    try {

        const email = req.body?.email?.trim().toLowerCase();

        console.log("Email:", email);

        // ----------------------------------
        // VALIDATE EMAIL
        // ----------------------------------

        if (!email) {
            console.log("❌ No email provided");

            return res.status(400).json({
                success: false,
                message: "Please enter your email address."
            });
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            console.log("❌ Invalid email");

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // ----------------------------------
        // CHECK PDF
        // ----------------------------------

        console.log("Checking B3 PDF...");

        if (!fs.existsSync(ebookPath)) {

            console.error(
                "❌ PDF NOT FOUND:",
                ebookPath
            );

            return res.status(500).json({
                success: false,
                message: "The B3 ebook could not be found."
            });
        }

        console.log("✅ PDF found");

        // ----------------------------------
        // SAVE CONTACT + SEGMENT
        // ----------------------------------

        console.log("Saving contact to Resend...");
        console.log(
            "Segment ID:",
            process.env.RESEND_SEGMENT_ID
        );

        const {
            data,
            error
        } = await resend.contacts.create({

            email: email,

            unsubscribed: false,

            segments: [
                {
                    id: process.env.RESEND_SEGMENT_ID
                }
            ]

        });

        // ----------------------------------
        // RESEND ERROR
        // ----------------------------------

        if (error) {

            console.error("\n❌ RESEND CONTACT ERROR");
            console.error("----------------------------------------");
            console.error(
                JSON.stringify(error, null, 2)
            );
            console.error("----------------------------------------");

            return res.status(500).json({
                success: false,
                message: "We couldn't save your email. Please try again."
            });
        }

        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        console.log("✅ CONTACT SAVED");
        console.log(
            JSON.stringify(data, null, 2)
        );

        console.log("✅ CONTACT ADDED TO B3 SEGMENT");

        console.log("========================================");
        console.log("B3 LEAD SUCCESS");
        console.log("========================================\n");

        return res.status(200).json({

            success: true,

            message: "Your B3 ebook is ready.",

            downloadUrl: "/download-ebook"

        });

    } catch (error) {

        console.error("\n❌ UNEXPECTED SERVER ERROR");
        console.error("========================================");

        console.error(error);

        console.error("========================================\n");

        return res.status(500).json({
            success: false,
            message: "We couldn't save your email. Please try again."
        });
    }
});

// ==========================================
// DOWNLOAD EBOOK
// ==========================================

app.get("/download-ebook", (req, res) => {

    console.log("\n📚 B3 DOWNLOAD REQUEST");

    if (!fs.existsSync(ebookPath)) {

        console.error(
            "❌ PDF does not exist:",
            ebookPath
        );

        return res.status(404).send(
            "B3 ebook not found."
        );
    }

    console.log(
        "Sending PDF:",
        ebookPath
    );

    res.download(
        ebookPath,
        "B3-Bounce-Back-Better.pdf",
        (error) => {

            if (error) {
                console.error(
                    "❌ DOWNLOAD ERROR:",
                    error
                );
            } else {
                console.log(
                    "✅ B3 PDF downloaded successfully"
                );
            }

        }
    );
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log(`🚀 B3 running at http://localhost:${PORT}`);
    console.log("======================================");
    console.log("");

});