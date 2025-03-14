async function loadExpensesTable() {
    try {
        const response = await fetch('/api/expenses');
        const data = await response.json();

        const tableBody = document.getElementById('expenses-body');
        tableBody.innerHTML = ''; // Clear existing content

        data.forEach(expenses => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${expenses.Exp_ID}</td>
                <td>${expenses.Unit_ID}</td>
                <td>${expenses.bills_id}</td>
                <td>${expenses.daily_id}</td>
                <td>${expenses.Exp_TotalCost}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadExpensesTable);

async function loadDeTable() {
    try {
        const response = await fetch('/api/dailyexpenses');
        const data = await response.json();

        const tableBody = document.getElementById('de-body');
        tableBody.innerHTML = ''; // Clear existing content

        data.forEach(daily => {
            const formatDate = (dateString) => {
                if (!dateString) return '-';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            };
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${daily.Daily_ID}</td>
                <td>${daily.Unit_ID}</td>
                <td>${formatDate(daily.Daily_Date)}</td>
                <td>${daily.Daily_CostName}</td>
                <td>${daily.Daily_Cost}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading table:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadDeTable);

async function loadBillsTable() {
    try {
        const response = await fetch('/api/bills');
        const data = await response.json();

        const tableBody = document.getElementById('bills-body');
        tableBody.innerHTML = ''; // Clear existing content

        data.forEach(bills => {
            const formatDate = (dateString) => {
                if (!dateString) return '-';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            };
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${bills.Bills_ID}</td>
                <td>${bills.Unit_ID}</td>
                <td>${formatDate(bills.Bills_Date)}</td>
                <td>${bills.Bills_Name}</td>
                <td>${bills.Bills_Cost}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadBillsTable);

async function populateUnits() {
    const unitSelects = document.querySelectorAll('.unit-dropdown');

    if (unitSelects.length === 0) {
        console.error("No .unit-dropdown elements found!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5500/api/units');
        const units = await response.json();

        unitSelects.forEach(unitSelect => {
            unitSelect.innerHTML = '<option value="">Select a Unit</option>';

            units.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.Unit_ID; 
                option.textContent = `${unit.Property_Name} - ${unit.Unit_Name}`;
                unitSelect.appendChild(option);
            });
        });

    } catch (error) {
        console.error('Error fetching units:', error);
    }
}

window.onload = () => {
    populateUnits();
}

document.getElementById('submit-de').addEventListener('click', submitDailyExpenses);

async function submitDailyExpenses() {
    let deUnit = document.getElementById('de_unit').value;
    let deDate = document.getElementById('de_date').value;
    let deCostName = document.getElementById('de_costname').value;
    let deCost = document.getElementById('de_cost').value;
    
    const deData = {
        Unit_ID : deUnit,
        Daily_Date : deDate,
        Daily_CostName : deCostName,
        Daily_Cost : deCost
    };

    await fetch('/api/dailyexpenses/post', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Daily Expenses Added");
        document.getElementById('de_unit').value = '';
        document.getElementById('de_date').value = '';
        document.getElementById('de_costname').value = '';
        document.getElementById('de_cost').value = '';
        loadDeTable();
    })
    .catch(error => console.error("Error adding expenses: ",error));

    let response = await fetch('/api/dailyexpenses/last');
    let data = await response.json();

    const expData = {
        Unit_ID : data.Unit_ID,
        Daily_ID : data.Daily_ID,
        Cost : data.Daily_Cost
    };

    await fetch('/api/expenses/postde', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Expenses Added");
        loadExpensesTable();
    })
    .catch(error => console.error("Error adding expenses: ", error));
}

document.getElementById('submit-bills').addEventListener('click', submitBillsExpenses);

async function submitBillsExpenses() {
    let billsUnit = document.getElementById('bills_unit').value;
    let billsDate = document.getElementById('bills_date').value;
    let billsCostName = document.getElementById('bills_costname').value;
    let billsCost = document.getElementById('bills_cost').value;
    
    const deData = {
        Bills_Name : billsCostName,
        Bills_Date : billsDate,
        Unit_ID : billsUnit,
        Bills_Cost : billsCost
    };

    await fetch('/api/bills/post', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Daily Expenses Added");
        document.getElementById('de_unit').value = '';
        document.getElementById('de_date').value = '';
        document.getElementById('de_costname').value = '';
        document.getElementById('de_cost').value = '';
        loadDeTable();
    })
    .catch(error => console.error("Error adding expenses: ",error));

    let response = await fetch('/api/bills/last');
    let dataArray = await response.json();

    let data = dataArray[0];

    const expData = {
        Unit_ID : data.Unit_ID,
        Bills_ID : data.Bills_ID,
        Cost : data.Bills_Cost
    };
    console.log(expData);

    await fetch('/api/expenses/postbills', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Expenses Added");
        loadExpensesTable();
    })
    .catch(error => console.error("Error adding expenses: ", error));
}