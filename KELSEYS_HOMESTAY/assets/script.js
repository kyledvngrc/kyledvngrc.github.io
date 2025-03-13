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
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
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

// Ensure this runs when the page loads
window.onload = () => {
    populateUnits();
    fetchBookings();
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
        Booking_ExtraPaxFee : extraPaxCharge || null
    };
    console.log(bookingData);

    fetch("http://localhost:5500/api/bookings/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Booking created!");
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

/* async function getBookingsForUnit(unitId) {
    try {
        console.log(`Fetching bookings for unit: ${unitId}`);
        const response = await fetch('http://localhost:5500/api/check/dates');
        const bookings = await response.json();

        // Filter bookings that match the given unit ID
        const unitBookings = bookings
            .filter(booking => booking.Unit_ID == unitId)
            .flatMap(booking => {
                let dates = [];
                let current = new Date(booking.Booking_DateFrom);
                let end = new Date(booking.Booking_DateTo);

                // Set time to midnight for proper date comparison
                current.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                while (current <= end) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }

                return dates;
            });

        console.log("Booked Dates:", unitBookings);
        return unitBookings;
    } catch (error) {
        console.error("Error fetching bookings for unit:", error);
        return [];
    }
} */

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












