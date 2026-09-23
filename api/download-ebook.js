const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {

    // ----------------------------------
    // ONLY ALLOW GET REQUESTS
    // ----------------------------------

    if (req.method !== "GET") {

        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });

    }


    try {

        // ----------------------------------
        // B3 PDF LOCATION
        // ----------------------------------

        const ebookPath = path.join(
            process.cwd(),
            "Backend",
            "ebook",
            "B3-Bounce-Back-Better.pdf"
        );


        // ----------------------------------
        // CHECK THAT PDF EXISTS
        // ----------------------------------

        if (!fs.existsSync(ebookPath)) {

            console.error(
                "B3 PDF not found:",
                ebookPath
            );

            return res.status(404).json({
                success: false,
                message: "B3 ebook not found."
            });

        }


        // ----------------------------------
        // READ PDF
        // ----------------------------------

        const pdf = fs.readFileSync(
            ebookPath
        );


        // ----------------------------------
        // SEND PDF TO USER
        // ----------------------------------

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="B3-Bounce-Back-Better.pdf"'
        );

        res.setHeader(
            "Content-Length",
            pdf.length
        );


        return res.status(200).send(pdf);


    } catch (error) {

        console.error(
            "DOWNLOAD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to download the ebook."
        });

    }

};