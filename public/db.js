const indexedDB = window.indexedDB
let db;

// create our indexedDB database called "budget"
const request = indexedDB.open("budget", 1)

// creating our table/collection called "pending"
request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true})
}


request.onsuccess = ({ target }) => {
    let db = target.result;

    // checking if app is online before from indexedDB
    if (navigator.onLine) {
        checkDatabase();
    }
}    

request.onerror = ({ target }) => {
    console.log("Oopsies" + target.errorCode)
}

const savedRecord = (record) => {
    // tell our database to select pending collection, and we're going to read/write with it
    const transaction = db.transaction(["pending"], "readwrite")
    
    // where are we going to add the record?
    const store = transaction.objectStore("pending");
    store.add(record)
}

const checkDatabase = () => {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.success = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json. text/plain, */*", "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                // if success = open a transaction with pending db where we are going to clear it.
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");

                store.clear()
            })
        }
    }
}

// listen for app coming back online
window.addEventListener("online", checkDatabase)