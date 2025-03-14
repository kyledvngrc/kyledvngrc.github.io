const currentDate = document.querySelector('.current-date'),
daysTag = document.querySelector('.days'),
prevNextIcon = document.querySelectorAll('.icons span');

let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];

let calendarUnit = null;
let bookedDates = [];

const renderCalendar = () => {
    let firstDayOfMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDay(),
        lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate();

    let liTag = "";

    // Fill in previous month's trailing days
    for (let i = firstDayOfMonth; i > 0; i--) {
        liTag += `<li class='inactive'>${lastDateOfLastMonth - i + 1}</li>`;
    }

    // Loop through current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
        let currentDate = new Date(currYear, currMonth, i);
        let currentDateStr = currentDate.toISOString().split('T')[0];

        let isBooked = bookedDates.some(booking => {
            let checkInStr = booking.checkIn.toISOString().split('T')[0];
            let checkOutStr = booking.checkOut.toISOString().split('T')[0];
    
            return currentDateStr >= checkInStr && currentDateStr <= checkOutStr; 
        });

        let bookedClass = isBooked ? "booked" : "";
        liTag += `<li class='${bookedClass}'>${i}</li>`;
    }

    // Fill in next month's leading days
    for (let i = lastDayOfMonth; i < 6; i++) {
        liTag += `<li class='inactive'>${i - lastDayOfMonth + 1}</li>`;
    }

    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
}
prevNextIcon.forEach(icon => {
    icon.addEventListener('click', () => {
        currMonth = icon.id === 'prev' ? currMonth - 1 : currMonth + 1;

        if( currMonth < 0 || currMonth > 11) {
            date = new Date(currYear, currMonth);
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } else {
            date = new Date();
        }
        renderCalendar();
    });
});
renderCalendar();

document.getElementById('select-unit').addEventListener('click', async function () {
    calendarUnit = document.getElementById('selected-calendar-unit').value;
    if (!calendarUnit) {
        alert("Please select a unit.");
        return;
    }

    bookedDates = await getBookingsForUnit(calendarUnit); // Fetch booked dates
    renderCalendar(); // Render updated calendar
});

// Fetch and display bookings
async function fetchBookings() {
    try {
        const response = await fetch('http://localhost:5500/api/bookings');
        const bookings = await response.json();

        const tableBody = document.getElementById('booking-body');
        tableBody.innerHTML = '';

        bookings.forEach(booking => {
            const formatDate = (dateString) => {
                if (!dateString) return '-';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            };

            const bookingTotal = parseInt(booking.Booking_Rate)+parseInt(booking.Booking_ExtraPaxFee);
            const row = document.createElement('tr');

            row.setAttribute("data-id", booking.Booking_ID);
            row.setAttribute("data-datefrom", booking.Booking_DateFrom);
            row.setAttribute("data-dateto", booking.Booking_DateTo);
            row.setAttribute("data-unit", booking.Unit_Name);
            row.setAttribute("data-customername", booking.Customer_Name);
            row.setAttribute("data-pax", booking.Booking_Pax);
            row.setAttribute("data-deposit", booking.Booking_Deposit);
            row.setAttribute("data-payment",booking.Booking_Payment);
            row.setAttribute("data-agent",booking.Agent_Name);


            row.innerHTML = `
                <td>${booking.Booking_ID || '-'}</td>
                <td>${formatDate(booking.Booking_DateFrom) || '-'}</td>
                <td>${formatDate(booking.Booking_DateTo) || '-'}</td>
                <td>${booking.Unit_Name || '-'}</td>
                <td>${booking.Customer_Name || '-'}</td>
                <td>${booking.Booking_Pax || '-'}</td>
                <td>P${booking.Booking_Deposit || '-'}</td>
                <td>${booking.Booking_Payment || '-'}</td>
                <td>${booking.Agent_Name || '-'}</td>
                <td>P${booking.Booking_Commission || '0.00'}</td>
                <td>P${booking.Booking_Rate || '-'}</td>
                <td>P${booking.Booking_ExtraPaxFee || '0.00'}</td>
                <td>P${booking.total || '-'}</td>
            `;
            row.addEventListener("click", ()=> populateInputs(row));
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
}

function populateInputs(row) {
    document.getElementById('edit_booking_id').value = row.getAttribute("data-id");
    document.getElementById('edit_booking_datefrom').value = row.getAttribute("data-datefrom");
    document.getElementById("edit_booking_dateto").value = row.getAttribute("data-dateto");
    document.getElementById("edit_customer_name").value = row.getAttribute("data-customername");
    document.getElementById("edit_unit").value = row.getAttribute("data-unit");
    document.getElementById("edit_booking_pax").value = row.getAttribute("data-pax");
    document.getElementById('edit_booking_payment').value = row.getAttribute("data-payment");
    document.getElementById("edit_agent_name").value = row.getAttribute("data-agent");
    document.getElementById("edit_booking_commission").value = row.getAttribute("data-commission");
}

// Fetch unit details and populate dropdown
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

async function populateCustomerName() {
    const customerNameSelects = document.querySelectorAll('.customer-name-dropdown');

    if (customerNameSelects.length === 0) {
        console.error("No .customer-name-dropdown elements found!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5500/api/check/customer');
        const customers = await response.json();

        customerNameSelects.forEach(customerSelect => {
            customerSelect.innerHTML = '<option value="">Select Customer</option>';

            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.Customer_Name; 
                option.textContent = `${customer.Customer_Name}`;
                customerSelect.appendChild(option);
            });
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

async function populateCustomerEmail() {
    const customerEmailSelects = document.querySelectorAll('.customer-email-dropdown');

    if (customerEmailSelects.length === 0) {
        console.error("No .customer-email-dropdown elements found!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5500/api/check/customer');
        const emails = await response.json();

        customerEmailSelects.forEach(emailSelect => {
            emailSelect.innerHTML = '<option value="">Select Email</option>';

            emails.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.Customer_Email; 
                option.textContent = `${customer.Customer_Email}`;
                emailSelect.appendChild(option);
            });
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

async function populateAgentName() {
    const agentNameSelects = document.querySelectorAll('.agent-name-dropdown');

    if (agentNameSelects.length === 0) {
        console.error("No .agent-name-dropdown elements found!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5500/api/check/agent');
        const agents = await response.json();

        agentNameSelects.forEach(agentSelect => {
            agentSelect.innerHTML = '<option value="">Select Agent</option>';

            agents.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent.Agent_Name; 
                option.textContent = `${agent.Agent_Name}`;
                agentSelect.appendChild(option);
            });
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

async function populateAgentEmail() {
    const agentEmailSelects = document.querySelectorAll('.agent-email-dropdown');

    if (agentEmailSelects.length === 0) {
        console.error("No .agent-email-dropdown elements found!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5500/api/check/agent');
        const agents = await response.json();

        agentEmailSelects.forEach(agentSelect => {
            agentSelect.innerHTML = '<option value="">Select Email</option>';

            agents.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent.Agent_Email; 
                option.textContent = `${agent.Agent_Email}`;
                agentSelect.appendChild(option);
            });
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

// Ensure this runs when the page loads
window.onload = () => {
    populateUnits();
    fetchBookings();
    populateCustomerName();
    populateCustomerEmail();
    populateAgentName();
    populateAgentEmail();
};

let IDCustomer = null,
IDUnit = null,
unitRate = null,
extraPaxCharge = null;


// Handle Create Booking Submission with Confirmation Modal
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("confirmation-modal");
    const confirmSubmitBtn = document.getElementById("confirm-submit");
    const cancelSubmitBtn = document.getElementById("cancel-submit");
    const createBookingBtn = document.getElementById("create-booking-button");

    createBookingBtn.addEventListener("click", async function (event) {
        event.preventDefault();
    
        // Validate inputs
        const checkIn = document.getElementById("booking_datefrom").value;
        const checkOut = document.getElementById("booking_dateto").value;
        const unitText = document.getElementById("unit").options[document.getElementById("unit").selectedIndex].text;
        const unitId = document.getElementById("unit").value;
        const customerName = document.getElementById("customer_name").value;
        const customerEmail = document.getElementById("customer_email").value;
        const pax = document.getElementById("booking_pax").value || 0;
        const deposit = document.getElementById("booking_deposit").value;
        const payment = document.getElementById("booking_payment").value;
        const agentName = document.getElementById("agent_name").value || "N/A";
        const agentEmail = document.getElementById("agent_email").value || "N/A";
        const commission = document.getElementById("booking_commission").value || "0.00";
    
        if (!checkIn || !checkOut || !unitId || !customerName || !customerEmail || !pax || !deposit || !payment) {
            alert("Please fill in all required fields.");
            return;
        }
    
        if (new Date(checkOut) <= new Date(checkIn)) {
            alert("Check-out date must be later than check-in date.");
            return;
        }
    
        try {

            const hasConflict = await checkDateConflict(unitId, checkIn, checkOut);
                if (hasConflict) {
                    alert("This unit is already booked for the selected dates. Please choose a different unit or date.");
                    return;
                }
            // Step 1: Validate Customer & Agent First
            const { customerID, agentID } = await validateBooking(customerName, customerEmail, agentName, agentEmail);
    
            if (!customerID) {
                alert("Customer not found. Please add them first.");
                return;
            }
            IDCustomer = customerID;
            IDAgent = agentID;
    
            // Step 2: Get Unit Details
            const unit = await getUnitDetails(unitId);
            if (!unit) {
                alert("Unit details not found.");
                return;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const numOfDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
            unitRate = unit.Unit_Price;
            let extraPaxCount = pax > unit.Unit_Pax ? pax - unit.Unit_Pax : 0;
            extraPaxCharge = extraPaxCount > 0 ? extraPaxCount * unit.Unit_ExtraPaxFee : "0.00";

            let unitTotal = parseFloat((parseFloat(extraPaxCharge) > 0 ? parseFloat(extraPaxCharge) + parseFloat(unitRate) : parseFloat(unitRate)) * numOfDays);
            
            // Populate Modal Before Displaying
            document.getElementById("confirm-checkin").innerText = checkIn;
            document.getElementById("confirm-checkout").innerText = checkOut;
            document.getElementById("confirm-unit").innerText = unitText;
            document.getElementById("confirm-customer").innerText = `${customerName}`;
            document.getElementById("confirm-pax").innerText = pax;
            document.getElementById("confirm-deposit").innerText = deposit;
            document.getElementById("confirm-payment").innerText = payment;
            document.getElementById("confirm-agent").innerText = agentName !== "N/A" ? `${agentName} (${agentEmail})` : "N/A";
            document.getElementById("confirm-commission").innerText = `P${commission}`;
            document.getElementById("confirm-rate").innerText = `P${unitRate}`;
            document.getElementById("confirm-extrapaxfee").innerText = `P${extraPaxCharge}`;
            document.getElementById("confirm-total").innerText = `P${unitTotal}`;
    
            // Show Modal
            modal.style.display = "block";
    
        } catch (error) {
            console.error("Error processing booking:", error);
            alert("An error occurred. Please try again.");
        }
    });
    
    // Confirm Booking Submission
    confirmSubmitBtn.addEventListener("click", () => {
        submitBooking(IDCustomer,IDAgent,unitRate);
        modal.style.display = "none";
    });
    
    // Cancel Booking
    cancelSubmitBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
    
});


// Submit Booking Data to Backend
function submitBooking(IDCustomer,IDAgent,unitRate) {
    const bookingData = {
        Booking_DateFrom: document.getElementById("booking_datefrom").value,
        Booking_DateTo: document.getElementById("booking_dateto").value,
        Booking_Pax: document.getElementById("booking_pax").value,
        Booking_Deposit: document.getElementById("booking_deposit").value,
        Unit_ID: document.getElementById("unit").value,
        Customer_ID: IDCustomer,
        Agent_ID: IDAgent || null,
        Booking_Rate : unitRate,
        Booking_Payment: document.getElementById("booking_payment").value,
        Booking_ExtraPaxFee : extraPaxCharge || null,
        Booking_Commission : document.getElementById('booking_commission').value || null
    };

    fetch("http://localhost:5500/api/bookings/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Booking created!");
        document.getElementById("booking_datefrom").value = '';
        document.getElementById("booking_dateto").value = '';
        document.getElementById("booking_pax").value = '';
        document.getElementById("booking_deposit").value = '';
        document.getElementById("unit").value = '';
        document.getElementById("booking_payment").value = '';
        document.getElementById('booking_commission').value = '';
        fetchBookings();
    })
    .catch(error => console.error("Error creating booking:", error));
}

const add_customer = document.getElementById('add-customer-button').addEventListener('click', postCustomer);

function postCustomer() {
    const CustomerData = {
        customer_Name : document.getElementById('customer_customer_name').value,
        customer_Email : document.getElementById('customer_customer_email').value,
        customer_ContactNum : document.getElementById('customer_customer_contactnum').value,
        customer_BirthDate : document.getElementById('customer_customer_birthdate').value
    };

    fetch('http://localhost:5500/api/bookings/customer', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(CustomerData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Customer Added");
        document.getElementById('customer_customer_name').value = '';
        document.getElementById('customer_customer_email').value = '';
        document.getElementById('customer_customer_contactnum').value = '';
        document.getElementById('customer_customer_birthdate').value = '';
    })
    .catch(error => console.error("Error adding customer: ", error));
}

const add_agent = document.getElementById('add-agent-button').addEventListener('click', postAgent);

function postAgent() {
    const AgentData = {
        agent_Name : document.getElementById('agent_agent_name').value,
        agent_Email : document.getElementById('agent_agent_email').value,
        agent_ContactNum : document.getElementById('agent_agent_contactnum').value
    };

    console.log(AgentData);

    fetch('http://localhost:5500/api/bookings/agent', {
        method: 'POST',
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(AgentData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Agent Added");
        document.getElementById('agent_agent_name').value = '';
        document.getElementById('agent_agent_email').value = '';
        document.getElementById('agent_agent_contactnum').value = '';
    })
    .catch(error => console.error("Error adding agent: ", error));
}

async function getUnitDetails(unitID) {
    try {
        const response = await fetch('http://localhost:5500/api/bookings/units');
        const units = await response.json();

        // Filter out the unit that matches the given unitID
        const matchedUnit = units.find(unit => unit.Unit_ID == unitID);

        if (matchedUnit) {
            console.log("Matched Unit Details:", matchedUnit);
            return matchedUnit;
        } else {
            console.log("Unit not found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching unit details:", error);
    }
}

async function validateBooking(customerName, customerEmail, agentName, agentEmail) {
    try {
        // Fetch customers
        const customerResponse = await fetch('http://localhost:5500/api/check/customer');
        const customers = await customerResponse.json();

        // Find matching customer
        const matchedCustomer = customers.find(customer => 
            customer.Customer_Name === customerName && customer.Customer_Email === customerEmail
        );

        if (!matchedCustomer) {
            console.log("Customer not found!");
            return { customerID: null, agentID: null };  // Return null if customer doesn't exist
        }

        // Fetch agents only if an agent is provided
        let matchedAgent = null;
        if (agentName && agentEmail) {
            const agentResponse = await fetch('http://localhost:5500/api/check/agent');
            const agents = await agentResponse.json();

            matchedAgent = agents.find(agent => 
                agent.Agent_Name === agentName && agent.Agent_Email === agentEmail
            );

            if (!matchedAgent) {
                console.log("Agent not found!");
            }
        }

        // Return only Customer_ID and Agent_ID
        return { 
            customerID: matchedCustomer.Customer_ID, 
            agentID: matchedAgent ? matchedAgent.Agent_ID : null 
        };

    } catch (error) {
        console.error("Error validating booking:", error);
        return { customerID: null, agentID: null };  // Return null in case of error
    }
}

async function checkDateConflict(unitId, checkIn, checkOut) {
    try {
        const response = await fetch('http://localhost:5500/api/check/dates');
        const bookings = await response.json();

        // Convert input dates to JavaScript Date objects
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Check for conflicts
        const conflict = bookings.some(booking => {
            if (booking.Unit_ID == unitId) {
                const existingCheckIn = new Date(booking.Booking_DateFrom);
                const existingCheckOut = new Date(booking.Booking_DateTo);

                return (
                    (checkInDate >= existingCheckIn && checkInDate < existingCheckOut) || 
                    (checkOutDate > existingCheckIn && checkOutDate < existingCheckOut) ||
                    (checkInDate <= existingCheckIn && checkOutDate >= existingCheckOut)
                );
            }
            return false;
        });

        return conflict; // Returns `true` if there is a conflict, `false` otherwise
    } catch (error) {
        console.error("Error checking date conflicts:", error);
        return true; // Assume conflict if an error occurs
    }
}

async function getBookingsForUnit(unitId) {
    try {
        const response = await fetch('http://localhost:5500/api/check/dates');
        const bookings = await response.json();

        return bookings
            .filter(booking => booking.Unit_ID == unitId)
            .map(booking => ({
                checkIn: new Date(booking.Booking_DateFrom),
                checkOut: new Date(booking.Booking_DateTo)
            }));
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

document.getElementById('edit-button').addEventListener('click', editBooking);

async function editBooking() {

    const checkIn = document.getElementById("edit_booking_datefrom").value;
    const checkOut = document.getElementById("edit_booking_dateto").value;
    const unitId = document.getElementById("edit_unit").value;
    const customerName = document.getElementById("edit_customer_name").value;
    const customerEmail = document.getElementById("edit_customer_email").value;
    const pax = document.getElementById("edit_booking_pax").value || 0;
    const deposit = document.getElementById("edit_booking_deposit").value;
    const payment = document.getElementById("edit_booking_payment").value;
    const agentName = document.getElementById("edit_agent_name").value || "N/A";
    const agentEmail = document.getElementById("edit_agent_email").value || "N/A";
    const commission = document.getElementById("edit_booking_commission").value || "0.00";
    const BookingID = document.getElementById('edit_booking_id').value;

    const { customerID, agentID } = await validateBooking(customerName, customerEmail, agentName, agentEmail);
    
            if (!customerID) {
                alert("Customer not found. Please add them first.");
                return;
            }
            IDCustomer = customerID;
            IDAgent = agentID;
    
            // Step 2: Get Unit Details
            const unit = await getUnitDetails(unitId);
            if (!unit) {
                alert("Unit details not found.");
                return;
            }

    unitRate = unit.Unit_Price;
    let extraPaxCount = pax > unit.Unit_Pax ? pax - unit.Unit_Pax : 0;
    extraPaxCharge = extraPaxCount > 0 ? extraPaxCount * unit.Unit_ExtraPaxFee : "0.00";

    const bookingData = {
        Booking_DateFrom: checkIn,
        Booking_DateTo: checkOut,
        Booking_Pax: pax,
        Booking_Deposit: deposit,
        Unit_ID: unitId,
        Customer_ID: IDCustomer,
        Agent_ID: IDAgent || null,
        Booking_Rate : unitRate,
        Booking_Payment: payment,
        Booking_ExtraPaxFee : extraPaxCharge || null,
        Booking_Commission : commission
    };

    fetch(`/api/booking/update/${BookingID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message || "Booking updated successfully");
        document.getElementById('edit_booking_datefrom').value = "";
        document.getElementById('edit_booking_dateto').value = "";
        document.getElementById('edit_customer_name').value = "";
        document.getElementById('edit_customer_email').value = "";
        document.getElementById('edit_unit').value = "";
        document.getElementById('edit_booking_pax').value = "";
        document.getElementById('edit_booking_payment').value = "";
        document.getElementById('edit_booking_deposit').value = "";
        document.getElementById('edit_agent_name').value = "";
        document.getElementById('edit_agent_email').value = "";
        document.getElementById('edit_booking_commission').value = "";
        fetchBookings();
    })
    .catch(error => console.error("Error updating booking:", error));
}

async function getCustomerID(customerName, customerEmail) {
    try {
        const response = await fetch(`/api/customers/id?name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}`);
        const data = await response.json();

        if (response.ok) {
            console.log("Customer ID:", data.Customer_ID);
            return data.Customer_ID;
        } else {
            console.error("Error:", data.error);
            return null;
        }
    } catch (error) {
        console.error("Error fetching customer ID:", error);
        return null;
    }
}

async function getAgentID(agentName, agentEmail) {
    try {
        const response = await fetch(`/api/agent/id?name=${encodeURIComponent(agentName)}&email=${encodeURIComponent(agentEmail)}`);
        const data = await response.json();

        if (response.ok) {
            console.log("Agent ID:", data.Agent_ID);
            return data.Agent_ID;
        } else {
            console.error("Error:", data.error);
            return null;
        }
    } catch (error) {
        console.error("Error fetching agent ID:", error);
        return null;
    }
}











