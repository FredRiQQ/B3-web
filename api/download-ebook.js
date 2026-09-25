const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                message: "Method not allowed"
            });
        }

        const ebookPath = path.join(
            process.cwd(),
            "Backend",
            "ebook",
            "B3-Bounce-Back-Better.pdf"
        );

        if (!fs.existsSync(ebookPath)) {
            console.error("B3 PDF not found:", ebookPath);

            return res.status(404).json({
                success: false,
                message: "B3 ebook not found."
            });
        }

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="B3-Bounce-Back-Better.pdf"'
        );

        const fileStream = fs.createReadStream(ebookPath);

        fileStream.on("error", (error) => {
            console.error("PDF STREAM ERROR:", error);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Unable to download the ebook."
                });
            }
        });

        fileStream.pipe(res);

    } catch (error) {
        console.error("DOWNLOAD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to download the ebook."
        });
    }
};