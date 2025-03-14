async function loadAgentsTable() {
    try {
        const response = await fetch('/api/agents/table');
        const data = await response.json();

        const tableBody = document.getElementById('agents-body');
        tableBody.innerHTML = ''; // Clear existing content

        data.forEach(agent => {
            
            const row = document.createElement('tr');

            row.setAttribute("data-id", agent.Agent_ID);
            row.setAttribute("data-name", agent.Agent_Name);
            row.setAttribute("data-email", agent.Agent_Email);
            row.setAttribute("data-contact", agent.Agent_ContactNum);

            row.innerHTML = `
                <td>${agent.Agent_ID}</td>
                <td>${agent.Agent_Name}</td>
                <td>${agent.Agent_Email}</td>
                <td>${agent.Agent_ContactNum}</td>
            `;

            row.addEventListener("click", () => populateInputs(row));
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading agents:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadAgentsTable);

function populateInputs(row) {
    document.getElementById('edit_agent_id').value = row.getAttribute("data-id");
    document.getElementById("edit_agent_name").value = row.getAttribute("data-name");
    document.getElementById("edit_agent_email").value = row.getAttribute("data-email");
    document.getElementById("edit_agent_contactnum").value = row.getAttribute("data-contact");
    document.getElementById('delete_agent_id').value = row.getAttribute("data-id");
    document.getElementById("delete_agent_name").value = row.getAttribute("data-name");
    document.getElementById("delete_agent_email").value = row.getAttribute("data-email");
    document.getElementById("delete_agent_contactnum").value = row.getAttribute("data-contact");
}

const addagentBtn = document.getElementById('add_agent').addEventListener('click',postAgent);

async function postAgent() {
    let agentName = document.getElementById('agent_name').value;
    let agentEmail = document.getElementById('agent_email').value;
    let agentContactNum = document.getElementById('agent_contactnum').value;
    try {
        let checkagent = await fetch('/api/agents/table');
        const agents = await checkagent.json();

        let agentExists = agents.some(agent =>
            agent.agent_Name == agentName && agent.agent_Email == agentEmail
        );

        if (agentExists) {
            alert("This agent is already listed.");
            return;
        }
    } catch (error) {
        console.error('Error checking agent:', error);
    }

    try {
        const agentData = {
            agent_Name : agentName,
            agent_Email : agentEmail,
            agent_ContactNum : agentContactNum,
        };

        fetch('http://localhost:5500/api/bookings/agent', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(agentData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || "agent Added");
            document.getElementById('agent_name').value = "";
            document.getElementById('agent_email').value = "";
            document.getElementById('agent_contactnum').value = "";
            loadAgentsTable();
        })
        .catch(error => console.error("Error adding agent: ", error));
    } catch (error) {
        console.error("error posting agent details.");   
    }
}

document.getElementById('edit_agent').addEventListener('click',editAgent);

async function editAgent() {
    let agentID = document.getElementById('edit_agent_id').value;
    let agentName = document.getElementById('edit_agent_name').value;
    let agentEmail = document.getElementById('edit_agent_email').value;
    let agentContactNum = document.getElementById('edit_agent_contactnum').value;

    if (!agentID || !agentName || !agentEmail || !agentContactNum ) {
        alert("Please fill in all required fields.");
        return;
    }

    const updatedData = {
        agent_Name : agentName,
        agent_Email : agentEmail,
        agent_ContactNum : agentContactNum,
    };

    fetch(`/api/agents/update/${agentID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message || "agent updated successfully");
        document.getElementById('edit_agent_id').value = "";
        document.getElementById('edit_agent_name').value = "";
        document.getElementById('edit_agent_email').value = "";
        document.getElementById('edit_agent_contactnum').value = "";
        document.getElementById('delete_agent_id').value = "";
        document.getElementById('delete_agent_name').value = "";
        document.getElementById('delete_agent_email').value = "";
        document.getElementById('delete_agent_contactnum').value = "";
        loadAgentsTable();
    })
    .catch(error => console.error("Error updating agent:", error));
}

document.getElementById('delete_agent').addEventListener('click',deleteAgent);

async function deleteAgent() {
    let agentID = document.getElementById('delete_agent_id').value;
    if (!confirm("Are you sure you want to delete this agent?")) return; // Confirm before deleting

    await fetch(`/api/agents/delete/${agentID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message || "agent updated successfully");
        document.getElementById('delete_agent_id').value = "";
        document.getElementById('delete_agent_name').value = "";
        document.getElementById('delete_agent_email').value = "";
        document.getElementById('delete_agent_contactnum').value = "";
        document.getElementById('edit_agent_id').value = "";
        document.getElementById('edit_agent_name').value = "";
        document.getElementById('edit_agent_email').value = "";
        document.getElementById('edit_agent_contactnum').value = "";
        loadAgentsTable();
    })
    .catch(error => console.error("Error updating agent:", error));
}