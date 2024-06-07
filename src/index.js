let PAYTRING_BASE_URL = "https://api.paytring.com";
let iframe_id = "paytringframe";
let callback_received = false;
let child_window_ref = false;
let checkout_url = "";

const handleScreenSize = () => {
    if (window.screen.width < 500) {
        let e = document.getElementById("paytring-frame-container-7832");
        let iframe = document.getElementById(iframe_id);
        iframe.style.borderRadius = '0';
        let icon = document.getElementById("close-ico1232");
        if (e != null) {
            e.style.width = "100%";
            e.style.height = "100%";
            icon.style.width = "2.5rem";
            icon.style.height = "2.5rem";
            icon.style.top = "-0.3rem";
            icon.style.right = "-0.3rem";
        }
    } else {
        let iframe = document.getElementById(iframe_id);
        iframe.style.borderRadius = '16px';
        let e = document.getElementById("paytring-frame-container-7832");
        let icon = document.getElementById("close-ico1232");
        if (e != null) {
            e.style.width = "26rem";
            e.style.height = "80%";
            icon.style.width = "1.5rem";
            icon.style.height = "1.5rem";
            icon.style.top = "-0.7rem";
            icon.style.right = "-0.7rem";
        }
    }
};

function handleScreenOnMethods(large) {
    if (large) {
        let e = document.getElementById("paytring-frame-container-7832");
        if (e != null && window.screen.width > 500) {
            e.style.width = "90%";
            e.style.height = "90%";
        }
    } else {
        handleScreenSize();
    }
}

let onClose = () => { };

function handlePayClose(order_id) {
    callback_received = true;
    closeChildWindow();
    document.getElementById("paytring_pg_container_2023")?.remove();
    const event = new CustomEvent("payment.close", {});
    document.dispatchEvent(event);
    onClose(order_id);
}

function closeChildWindow() {
    try {
        if (callback_received) {
            child_window_ref.close();
        }
    } catch (err) { }
}

class Paytring {
    orderId; onSuccess; onFail; onClose; onEvent; key;
    #baseUrl = PAYTRING_BASE_URL;
    empty() { }

    handlePayClose(order_id) {
        callback_received = true;
        closeChildWindow();
        document.getElementById("paytring_pg_container_2023")?.remove();
        const event = new CustomEvent("payment.close", {});
        document.dispatchEvent(event);
        onClose(order_id);
    }
    

    constructor(options) {
        this.orderId = options.order_id;
        if (options.events) { this.onEvent = options.events; } else { this.onEvent = this.empty; }
        if (options.success) { this.onSuccess = options.success; } else { this.onSuccess = this.empty; }
        if (options.onClose) { onClose = options.onClose; } else { onClose = this.empty; }
        if (options.failed) { this.onFail = options.failed; } else { this.onFail = this.empty; }
        window.addEventListener("message", (e) => {
            this.onEvent({ event_name: e.data.eventname, event_value: e.data.data });
            if ((e.data.eventname === 'Proceed_Card' && e.data.data === 'CardProceedClicked') ||
                (e.data.eventname === 'Proceed_NetBanking' && e.data.data === 'NetBankingProceedClicked')) {
                handleScreenOnMethods(false);
            } else {
                handleScreenOnMethods(false);
            }
            if (e.data.eventname === 'Transaction_Status' && e.data.data === 'success') {
                callback_received = true;
                closeChildWindow();
                this.onSuccess(this.orderId);
                document.getElementById("paytring_pg_839x8")?.remove();
                handlePayClose(this.orderId);
                const event = new CustomEvent("payment.success", { detail: { order_id: this.orderId } });
                document.dispatchEvent(event);
            }
            if (e.data.eventname === 'Transaction_Status' && e.data.data === 'failed') {
                callback_received = true;
                closeChildWindow();
                this.onFail(this.orderId);
                document.getElementById("paytring_pg_839x8")?.remove();
                handlePayClose(this.orderId);
                const event = new CustomEvent("payment.failed", { detail: { order_id: this.orderId } });
                document.dispatchEvent(event);
            }
        });
    }

    status() { }

    open() {
        let url = `${this.#baseUrl}/pay/token/${this.orderId}`;
        const el = document.createElement("div");
        el.classList.add("paytring_pg_container_2023");
        el.id = "paytring_pg_container_2023";
        el.innerHTML = `<style> body {margin: 0;} </style>
        <div id="paytring_pg_839x8" style="position:fixed;width:100vw;height:100%;top:0;display:flex;align-items:center;z-index:1000000;background-color:rgba(0,0,0,0.6);">
            <div id="paytring-frame-container-7832" style="width:26rem;height:80%;display:block;background-color:#fff;margin:0 auto;position:relative;border-radius:15px !important;">
                <div id="close-ico1232" style="position:absolute;background-color:red;width:1.5rem;height:1.5rem;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;user-select:none;color:#ffffff;border-radius:2rem;right:-11.2px;top:-11.2px">&#10005;</div>
                <iframe src="${url}" id="${iframe_id}" frameborder="0" style="width:100%;height:100%;border-radius:15px !important;"></iframe>
            </div>
        </div>`;
        document.body.appendChild(el);
        document.getElementById("close-ico1232").addEventListener("click", () => {
            this.handlePayClose(this.orderId);
        });
        handleScreenSize();
    }
}

window.addEventListener('resize', function (event) {
    handleScreenSize();
}, true);

window.addEventListener('message', function (event) {
    if (event.data.eventname == 'document_loaded' && event.data.data == true) {
        let iframe = document.getElementById(iframe_id);
        iframe.contentWindow.postMessage({ eventname: "checkout_iframe", data: true }, "*");
    }
    if (event.data.eventname == 'non_seamless' && event.data.data == true) {
        let iframe = document.getElementById(iframe_id);
        console.log("order will be non seamless");
        checkout_url = event?.data?.url ?? '';
        iframe.contentWindow.postMessage({ eventname: "checkout_iframe", data: true }, "*");
    }
    if (event.data.eventname == 'checkout_url' && event.data.data.status == true) {
        checkout_url = event.data.data.url;
        if (child_window_ref) {
            try {
                child_window_ref.close();
            } catch (err) { }
        }
    }
    if (event.data.eventname == 'child_window' && event.data.data) {
        callback_received = false;
        var childWindowName = event.data.data;
        child_window_ref = window.open('', childWindowName);
        var timer = setInterval(checkChild, 500);
        function checkChild() {
            if (child_window_ref.closed) {
                if (!callback_received) {
                    console.log("Child window closed before completion");
                    if (checkout_url) {
                        document.getElementById(iframe_id).src = checkout_url;
                    }
                }
                clearInterval(timer);
            }
            if (callback_received) {
                clearInterval(timer);
            }
        }
    }
});

module.exports = Paytring;
