// Home Nav Functionalities
let assetBtn = document.getElementById("assetsBtn"),
    asset = document.getElementById("asset");
let transactBtn = document.getElementById("transactionsBtn"),
    transaction = document.getElementById("transaction");
assetBtn.onclick = () => {
    asset.style.left = "0";
    transaction.style.right = "-100%";
}
transactBtn.onclick = () => {
    asset.style.left = "-100%";
    transaction.style.right = "0";
}

function openNotification() {
    document.getElementById("notification").style.display = "block";
    document.getElementById("notification").style.right = "0";
}
function closeNotification() {
    document.getElementById("notification").style.right = "-100%";
    document.getElementById("notification").style.display = "none";
}

function openWin(currency) {
    document.getElementById("crypto").style.display = "flex";
    document.getElementById("crypto").style.right = "0";
}
function closeWin() {
    document.getElementById("crypto").style.right = "-100%";
    document.getElementById("crypto").style.display = "none";
}


// Navbar Functionalities
let home = document.getElementById("home"),
    messages = document.getElementById("messages"),
    settings = document.getElementById("settings"),
    gMessages = document.getElementById("gMessages");

let homeBtn = document.getElementById("homeBtn"),
    messagesBtn = document.getElementById("messageBtn"),
    settingsBtn = document.getElementById("settingsBtn");
homeBtn.onclick = () => {
    home.style.display = "flex";
    messages.style.display = "none";
    settings.style.display = "none";
}
messagesBtn.onclick = () => {
    home.style.display = "none";
    messages.style.display = "flex";
    settings.style.display = "none";
    gMessages.scrollTop = gMessages.scrollHeight;
    loadMessages();
}
function loadMessages() {
    const mesLists = document.getElementById("gMessages");
    mesLists.innerHTML = ""; // Clear the list before fetching new data

    try {
        db.collection("messages").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const messes = doc.data();
                const mes = document.createElement("li");
                if ( messes.type === "sent" && messes.sender === loggedUsr.toUpperCase() ) {
                    mes.classList.add("sent");
                    mes.innerHTML = `<span>${messes.sender}</span> ${messes.text} <span>${messes.timestamp}</span>`;
                } else {
                    mes.classList.add("received");
                    mes.innerHTML = `<span>${messes.sender}</span> ${messes.text} <span>${messes.timestamp}</span>`;
                }
                mesLists.appendChild(mes);
            });
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}
function formatDate() {
    const now = new Date();

    // Extract date components
    const day = String(now.getDate()).padStart(2, '0'); // Day
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getMonth()]; // Month in short form
    const year = String(now.getFullYear()).slice(-2); // Last two digits of the year

    // Extract time components
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const isAM = hours < 12;
    const period = isAM ? "am" : "pm";
    hours = hours % 12 || 12; // Convert to 12-hour format

    // Combine into desired format
    return `${day} ${month} ${year} - ${hours}:${minutes}${period}`;
}
function sendMessage() {
    const txt = document.getElementById("txtMes").value;

    if ( txt.length !== 0) {
        const mesDetails = {
            text: txt,
            sender: loggedUsr.toUpperCase(),
            timestamp: `${formatDate()}`,
            type: "sent"
        }

        // Add the new user to the "users" document in the "wallet" collection
        db.collection("messages").doc(`${formatDate()}`).set(mesDetails)
            .then(() => {
                console.log("Message sent successfully!");
                document.getElementById("txtMes").value = "";
                loadMessages();
            })
            .catch((error) => {
                console.error("Error sending message:", error);
            });
    }
}
settingsBtn.onclick = () => {
    home.style.display = "none";
    messages.style.display = "none";
    settings.style.display = "flex";
}
function getInitial() {
    const fullName = f_name;
    const initials = fullName
        .split(" ")              // Split into words
        .map(word => word[0])   // Get the first letter of each word
        .join("")               // Combine them
        .toUpperCase();         // Convert to uppercase
    return initials
}


let log = document.getElementById("logPIN");
let fname = document.getElementById("fname");
let uname = document.getElementById("uname");
let pcode = document.getElementById("pincode");

let loggedUsr = "";
let tMoni = 0;
let astCon = 0;
let f_name = "";
let usrStatus = "";

async function getNaira() {
    await fetch('https://api.exchangerate-api.com/v4/latest/NGN').then(res => res.json()).then(data => {
        document.getElementById("ast").innerText = tMoni;
        document.getElementById("astCon").innerText = `$${eval(data.rates.USD * tMoni).toFixed(2)}`;

        document.getElementById("currTotal").innerText = tMoni;
    });
}

log.onkeyup = () => {
    if ( log.value.length === 8 ) {
        if ( log.value === 28460000 ) {
            window.location.replace('admin.html');
        } else {
            try {
                db.collection("users").get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if ( doc.data().pincode === log.value ) {
                            loggedUsr = doc.data().uname;
                            tMoni = doc.data().amount;
                            f_name = doc.data().fname;
                            usrStatus = doc.data().status;
                            log.style.backgroundColor = "#6897b6";
                            loadHome();
                            loadTransactions();
                            loadAssetTransactions();
                        }
                    });
                });
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
    }
}

function signup() {
    const fname = document.getElementById("fname").value;
    const uname = document.getElementById("uname").value;
    const pinCode = document.getElementById("pincode").value;

    if (fname && uname && pinCode) {
        const userDetails = {
            fname: fname,
            uname: uname,
            pincode: pinCode,
            amount: 0,
            status: "active",
            currency: "ngn",
            transactions: []
        }
        
        /*
            let newTrans = {
                month: "december",
                currency: "ngn",
                amount: 200,
                type: "withdraw",
                timestamp: "6 Dec 24 - 12:15pm"
            }
    
            db.collection("users").doc(uname).update({
                transactions: firebase.firestore.FieldValue.arrayUnion(newTrans)
            });
        */
    
        // Add the new user to the "users" document in the "wallet" collection
        db.collection("users").doc(uname).set(userDetails)
            .then(() => {
                console.log("User added successfully!");
                loggedUsr = userDetails.uname;
                tMoni = userDetails.amount;
                f_name = userDetails.fname;
                usrStatus = userDetails.status;
                loadHome();
                loadTransactions();
                loadAssetTransactions();
            })
            .catch((error) => {
                console.error("Error adding user:", error);
            });
    }
}

function chgLog() {
    document.getElementById("log").style.display = "none";
    document.getElementById("sign").style.display = "flex";
}
function chgSign() {
    document.getElementById("sign").style.display = "none";
    document.getElementById("log").style.display = "flex";
}

function loadHome() {
    setTimeout(() => {
        document.getElementById("log").style.display = "none";
        document.getElementById("sign").style.display = "none";
        document.getElementById("home").style.display = "flex";
        document.getElementById("btmNav").style.display = "flex";
        
        document.getElementById("userBanner").innerText = loggedUsr.toUpperCase();
        document.getElementById("totalMoney").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M122.6 46.3c-7.8-11.7-22.4-17-35.9-12.9S64 49.9 64 64l0 192-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 100.2 0 97.2 145.8c7.8 11.7 22.4 17 35.9 12.9s22.7-16.5 22.7-30.6l0-128 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-192c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 192-57.5 0L122.6 46.3zM305.1 320l14.9 0 0 22.3L305.1 320zM185.5 256L128 256l0-86.3L185.5 256z"/></svg> ${tMoni}`;
        getNaira();

        document.getElementById("depMemo").innerHTML = `<span>Memo</span> SYN: Deposit from ${loggedUsr}`;
        document.getElementById("supportMemo").innerHTML = `<span>Memo</span> SYN: Deposit from ${loggedUsr}`;

        document.getElementById("usr").innerText = getInitial();
        document.getElementById("usrName").innerText = f_name;

        if ( usrStatus === "active" ) {
            document.getElementById("status").classList.add("active");
            document.getElementById("status").innerText = "active";
        } else {
            document.getElementById("status").classList.add("inactive");
            document.getElementById("status").innerText = "inactive";
        }
    }, 800);
}

function logout() {
    setTimeout(() => {
        document.getElementById("log").style.display = "flex";
        document.getElementById("sign").style.display = "none";
        document.getElementById("settings").style.display = "none";
        document.getElementById("btmNav").style.display = "none";
        log.value = "";
        log.style.backgroundColor = "var(--primary)";
    }, 100);
}

function openDeposit() {
    document.getElementById("deposit").style.display = "flex";
}
function closeDeposit() {
    document.getElementById("deposit").style.display = "none";
}
function openWithdraw() {
    document.getElementById("withdraw").style.scale = "1";
    document.getElementById("withdraw").style.display = "flex";
}
function closeWithdraw() {
    document.getElementById("withdraw").style.scale = "0";
    document.getElementById("withdraw").style.display = "none";
}
function openSupport() {
    document.getElementById("supportPage").style.display = "flex";
}
function closeSupport() {
    document.getElementById("supportPage").style.display = "none";
}
function openTerms() {
    document.getElementById("terms").style.display = "block";
}
function closeTerms() {
    document.getElementById("terms").style.display = "none";
}

function confirm(num) {
    if ( num === 1 ) {
        const params = {
            name: 'Syndicate',
            message: `SYN: Deposit from ${loggedUsr}`,
        }
        const serviceID = "service_1b309qg";
        const templateID = "template_d568noi";
        emailjs.send(serviceID, templateID, params).then(() => { closeDeposit() });
    } else {
        const params = {
            name: 'Syndicate',
            message: `SYN: Support from ${loggedUsr}`,
        }
        const serviceID = "service_1b309qg";
        const templateID = "template_d568noi";
        emailjs.send(serviceID, templateID, params).then(() => { closeDeposit() });
    }
}
