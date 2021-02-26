// initialize database store
let db;

// create the budget_tracker db on indexedDB
const request = indexedDB.open('budget_tracker', 1);

// on db change store the db changes in budget_tracker db and increment the version number
request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('new_txn', { autoIncrement: true });
};

// upon successful db creation, save current db info to the global db variable
request.onsuccess = function(e) {
    db = e.target.result;
    if (navigator.onLine) {
        uploadTxns();
    }
};

// upon failed db creation, log the error
request.onerror = function(e) {
    console.log(e.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['new_txn'], 'readwrite');

    const txnObjectStore = transaction.objectStore('new_txn');

    txnObjectStore.add(record);
}

function uploadTxns() {
    const transaction = db.transaction(['new_txn'], 'readwrite');

    const txnObjectStore = transaction.objectStore('new_txn');

    const getAll = txnObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error (serverResponse);
                }
                const transaction = db.transaction(['new_txn'], 'readwrite');

                const txnObjectStore = transaction.objectStore('new_txn');

                txnObjectStore.clear();

                alert('All saved transactions have been submitted!')
            })
            .catch(err => {
                console.log(err);
            });    
        }
    }
}

window.addEventListener('online', uploadTxns)