let db;

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("PendingBudget", { autoIncrement: true });
};

request.onerror = function (event) {
    console.log(`An Error has occured: ${event.target.errorCode}`);
};

request.onsuccess = function (event) {
    console.log("success");
    db = event.target.result;

    if (navigator.onLine) {
        console.log("Online Budget reconnected! 🗄️");
        checkDatabase();
    }
};

function checkDatabase() {
    console.log("check db invoked");

    // Open a transaction on your BudgetStore db
    let transaction = db.transaction(["PendingBudget"], "readwrite");

    // access your PendingBudget object
    const store = transaction.objectStore("PendingBudget");

    // Get all records from store and set to a variable
    const getAll = store.getAll();

    // If the request was successful
    getAll.onsuccess = function () {
        // If there are items in the store, we need to bulk add them when we are back online
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((res) => {
                    // If our returned response is not empty
                    if (res.length !== 0) {
                        // Open another transaction to BudgetStore with the ability to read and write
                        transaction = db.transaction(
                            ["PendingBudget"],
                            "readwrite"
                        );

                        // Assign the current store to a variable
                        const currentStore = transaction.objectStore(
                            "PendingBudget"
                        );

                        // Clear existing entries because our bulk add was successful
                        currentStore.clear();
                        console.log("Clearing store 🧹");
                    }
                });
        }
    };
}

const saveRecord = (record) => {
    console.log("Save record invoked");
    // Create a transaction on the PendingBudget db with readwrite access
    const transaction = db.transaction(["PendingBudget"], "readwrite");

    // Access your PendingBudget object store
    const store = transaction.objectStore("PendingBudget");

    // Add record to your store with add method.
    store.add(record);
};

// Listen for app coming back online
window.addEventListener("online", checkDatabase);
