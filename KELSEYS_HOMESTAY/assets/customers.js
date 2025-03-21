async function loadCustomersTable() {
    try {
        const response = await fetch('/api/customers/table');
        const data = await response.json();

        const tableBody = document.getElementById('customers-body');
        tableBody.innerHTML = '';

        data.forEach(customer => {
            const formatDate = (dateString) => {
                if (!dateString) return '-';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            };
            const row = document.createElement('tr');

            row.setAttribute("data-id", customer.Customer_ID);
            row.setAttribute("data-name", customer.Customer_Name);
            row.setAttribute("data-email", customer.Customer_Email);
            row.setAttribute("data-contact", customer.Customer_ContactNum);
            row.setAttribute("data-birthdate", customer.Customer_BirthDate);

            row.innerHTML = `
                <td>${customer.Customer_ID}</td>
                <td>${customer.Customer_Name}</td>
                <td>${customer.Customer_Email}</td>
                <td>${customer.Customer_ContactNum}</td>
                <td>${formatDate(customer.Customer_BirthDate)}</td>
            `;

            row.addEventListener("click", () => populateInputs(row));
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadCustomersTable);

function populateInputs(row) {
    document.getElementById('edit_customer_id').value = row.getAttribute("data-id");
    document.getElementById("edit_customer_name").value = row.getAttribute("data-name");
    document.getElementById("edit_customer_email").value = row.getAttribute("data-email");
    document.getElementById("edit_customer_contactnum").value = row.getAttribute("data-contact");
    document.getElementById("edit_customer_birthdate").value = row.getAttribute("data-birthdate");
    document.getElementById('delete_customer_id').value = row.getAttribute("data-id");
    document.getElementById("delete_customer_name").value = row.getAttribute("data-name");
    document.getElementById("delete_customer_email").value = row.getAttribute("data-email");
    document.getElementById("delete_customer_contactnum").value = row.getAttribute("data-contact");
    document.getElementById("delete_customer_birthdate").value = row.getAttribute("data-birthdate");
}

const addCustomerBtn = document.getElementById('add_customer').addEventListener('click',postCustomer);

async function postCustomer() {
    let customerName = document.getElementById('customer_name').value;
    let customerEmail = document.getElementById('customer_email').value;
    let customerContactNum = document.getElementById('customer_contactnum').value;
    let customerBirthDate = document.getElementById('customer_birthdate').value;
    try {
        let checkCustomer = await fetch('/api/customers/table');
        const customers = await checkCustomer.json();

        let customerExists = customers.some(customer =>
            customer.Customer_Name == customerName && customer.Customer_Email == customerEmail
        );

        if (customerExists) {
            alert("This customer is already listed.");
            return;
        }
    } catch (error) {
        console.error('Error checking customer:', error);
    }

    try {
        const customerData = {
            customer_Name : customerName,
            customer_Email : customerEmail,
            customer_ContactNum : customerContactNum,
            customer_BirthDate : customerBirthDate
        };

        fetch('http://localhost:5500/api/bookings/customer', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customerData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || "Customer Added");
            document.getElementById('customer_name').value = "";
            document.getElementById('customer_email').value = "";
            document.getElementById('customer_contactnum').value = "";
            document.getElementById('customer_birthdate').value = "";
            loadCustomersTable();
        })
        .catch(error => console.error("Error adding customer: ", error));
    } catch (error) {
        console.error("error posting customer details.");   
    }
}

document.getElementById('edit_customer').addEventListener('click',editCustomer);

async function editCustomer() {
    let customerID = document.getElementById('edit_customer_id').value;
    let customerName = document.getElementById('edit_customer_name').value;
    let customerEmail = document.getElementById('edit_customer_email').value;
    let customerContactNum = document.getElementById('edit_customer_contactnum').value;
    let customerBirthDate = document.getElementById('edit_customer_birthdate').value;

    if (!customerID || !customerName || !customerEmail || !customerContactNum || !customerBirthDate) {
        alert("Please fill in all required fields.");
        return;
    }

    const updatedData = {
        customer_Name : customerName,
        customer_Email : customerEmail,
        customer_ContactNum : customerContactNum,
        customer_BirthDate : customerBirthDate
    };

    fetch(`/api/customers/update/${customerID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message || "Customer updated successfully");
        document.getElementById('edit_customer_id').value = "";
        document.getElementById('edit_customer_name').value = "";
        document.getElementById('edit_customer_email').value = "";
        document.getElementById('edit_customer_contactnum').value = "";
        document.getElementById('edit_customer_birthdate').value = "";
        document.getElementById('delete_customer_id').value = "";
        document.getElementById('delete_customer_name').value = "";
        document.getElementById('delete_customer_email').value = "";
        document.getElementById('delete_customer_contactnum').value = "";
        document.getElementById('delete_customer_birthdate').value = "";
        loadCustomersTable();
    })
    .catch(error => console.error("Error updating customer:", error));
}

document.getElementById('delete_customer').addEventListener('click',deleteCustomer);

async function deleteCustomer() {
    let customerID = document.getElementById('delete_customer_id').value;
    if (!confirm("Are you sure you want to delete this customer?")) return; 

    await fetch(`/api/customers/delete/${customerID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message || "Customer updated successfully");
        document.getElementById('delete_customer_id').value = "";
        document.getElementById('delete_customer_name').value = "";
        document.getElementById('delete_customer_email').value = "";
        document.getElementById('delete_customer_contactnum').value = "";
        document.getElementById('delete_customer_birthdate').value = "";
        document.getElementById('edit_customer_id').value = "";
        document.getElementById('edit_customer_name').value = "";
        document.getElementById('edit_customer_email').value = "";
        document.getElementById('edit_customer_contactnum').value = "";
        document.getElementById('edit_customer_birthdate').value = "";
        loadCustomersTable();
    })
    .catch(error => console.error("Error updating customer:", error));
}