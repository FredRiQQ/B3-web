const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

const ebookPath = path.join(
    process.cwd(),
    "Backend",
    "ebook",
    "B3-Bounce-Back-Better.pdf"
);

module.exports = async (req, res) => {

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {

        // ----------------------------------
        // GET EMAIL
        // ----------------------------------

        const email = req.body?.email?.trim().toLowerCase();

        console.log("========================================");
        console.log("NEW B3 LEAD");
        console.log("========================================");
        console.log("Email:", email);


        // ----------------------------------
        // VALIDATE EMAIL
        // ----------------------------------

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }


        // ----------------------------------
        // CHECK B3 PDF
        // ----------------------------------

        console.log("Checking B3 PDF...");

        if (!fs.existsSync(ebookPath)) {

            console.error(
                "B3 PDF not found:",
                ebookPath
            );

            return res.status(500).json({
                success: false,
                message: "B3 ebook is currently unavailable."
            });
        }


        // ----------------------------------
        // CHECK RESEND API KEY
        // ----------------------------------

        if (!process.env.RESEND_API_KEY) {

            console.error(
                "RESEND_API_KEY is missing."
            );

            return res.status(500).json({
                success: false,
                message: "RESEND_API_KEY is missing on the server."
            });
        }


        // ----------------------------------
        // CHECK RESEND SEGMENT ID
        // ----------------------------------

        if (!process.env.RESEND_SEGMENT_ID) {

            console.error("RESEND_SEGMENT_ID is missing.");

            return res.status(500).json({
                success: false,
                message: ("RESEND_SEGMENT_ID is missing.");
            });
        }


        // ----------------------------------
        // CONNECT TO RESEND
        // ----------------------------------

        const resend = new Resend(
            process.env.RESEND_API_KEY
        );


        console.log(
            "Segment ID:",
            process.env.RESEND_SEGMENT_ID
        );


        // ----------------------------------
        // ADD CONTACT TO RESEND SEGMENT
        // ----------------------------------

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

            console.error(
                "RESEND ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "We could not process your email."
            });
        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        console.log("========================================");
        console.log("B3 LEAD SUCCESS");
        console.log("========================================");


        return res.status(200).json({

            success: true,

            message: "Your B3 ebook is ready.",

            downloadUrl: "/api/download-ebook"

        });


    } catch (error) {

        console.error(
            "B3 LEAD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};