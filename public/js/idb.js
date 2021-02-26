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
        // uploadTxns();
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