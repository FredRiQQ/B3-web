document.addEventListener("DOMContentLoaded", () => {

    const modal =
        document.getElementById("emailModal");

    const openModalButton =
        document.getElementById("openModal");

    const openModalBottom =
        document.getElementById("openModalBottom");

    const closeModal =
        document.getElementById("closeModal");

    const closeModalButton =
        document.getElementById("closeModalButton");

    const emailForm =
        document.getElementById("emailForm");

    const emailInput =
        document.getElementById("email");

    const submitButton =
        document.getElementById("submitButton");

    const formMessage =
        document.getElementById("formMessage");


    // ------------------------------------
    // OPEN MODAL
    // ------------------------------------

    function openEmailModal() {

        if (!modal) return;

        modal.classList.add("active");

        document.body.style.overflow = "hidden";

        setTimeout(() => {

            if (emailInput) {
                emailInput.focus();
            }

        }, 250);

    }


    // ------------------------------------
    // CLOSE MODAL
    // ------------------------------------

    function closeEmailModal() {

        if (!modal) return;

        modal.classList.remove("active");

        document.body.style.overflow = "";

    }


    // ------------------------------------
    // BUTTONS
    // ------------------------------------

    if (openModalButton) {

        openModalButton.addEventListener(
            "click",
            openEmailModal
        );

    }

    if (openModalBottom) {

        openModalBottom.addEventListener(
            "click",
            openEmailModal
        );

    }

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeEmailModal
        );

    }

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeEmailModal
        );

    }


    // ------------------------------------
    // ESC KEY
    // ------------------------------------

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {
                closeEmailModal();
            }

        }
    );


    // ------------------------------------
    // FORM
    // ------------------------------------

    if (!emailForm) return;

    emailForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            // ------------------------------
            // VALIDATION
            // ------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                formMessage.textContent =
                    "Please enter a valid email address.";

                formMessage.style.color =
                    "#c43c3c";

                return;

            }


            // ------------------------------
            // LOADING STATE
            // ------------------------------

            submitButton.disabled = true;

            submitButton.innerHTML =
                "Preparing your copy...";

            formMessage.textContent = "";


            try {

                // --------------------------
                // CAPTURE EMAIL
                // --------------------------

                const response =
                    await fetch(
                        "/capture-lead",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email: email
                                })
                        }
                    );


                const data =
                    await response.json();


                // --------------------------
                // SERVER ERROR
                // --------------------------

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Something went wrong."
                    );

                }


                // --------------------------
                // SUCCESS
                // --------------------------

                formMessage.textContent =
                    "Your B3 ebook is ready. Your download will begin now.";

                formMessage.style.color =
                    "#3b8b58";


                submitButton.innerHTML =
                    "Download ready ✓";


                // --------------------------
                // DOWNLOAD PDF
                // --------------------------

                const downloadLink =
                    document.createElement("a");

                downloadLink.href =
                    data.downloadUrl ||
                    "/download-ebook";

                downloadLink.download =
                    "B3-Bounce-Back-Better.pdf";

                document.body.appendChild(
                    downloadLink
                );

                downloadLink.click();

                downloadLink.remove();


                // --------------------------
                // RESET AFTER DOWNLOAD
                // --------------------------

                emailInput.value = "";

                setTimeout(() => {

                    closeEmailModal();

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML = `
                        Get my copy
                        <span>→</span>
                    `;

                    formMessage.textContent = "";

                }, 3500);


            } catch (error) {

                console.error(
                    "B3 LEAD ERROR:",
                    error
                );

                formMessage.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";

                formMessage.style.color =
                    "#c43c3c";


                submitButton.disabled =
                    false;

                submitButton.innerHTML = `
                    Try again
                    <span>→</span>
                `;

            }

        }
    );

});