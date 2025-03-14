async function loadPropertiesTable() {
    try {
        const response = await fetch('/api/properties/units');
        const data = await response.json();

        const tableBody = document.getElementById('properties-body');
        tableBody.innerHTML = ''; // Clear existing content

        data.forEach(unit => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${unit.Unit_ID}</td>
                <td>${unit.unit_name}</td>
                <td>${unit.Unit_Pax}</td>
                <td>${unit.Unit_Price}</td>
                <td>${unit.Unit_ExtraPaxFee}</td>
                <td>${unit.Unit_Size}</td>
                <td>${unit.Unit_Desc}</td>
                <td>${unit.Building_ID}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading properties:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadPropertiesTable);

let propertyName = null;
let propertyAddress = null;
let buildingTower = null;
let buildingFloor = null;
let unitNumber = null;
let unitPax = null;
let unitPrice = null;
let unitExtraPaxFee = null;
let unitSize = null;
let unitDescription = null;

const addPropertyBtn = document.getElementById('add_property_button').addEventListener('click', ()=> {

    propertyName = document.getElementById('property_name').value;
    propertyAddress = document.getElementById('property_address').value;
    buildingTower = document.getElementById('building_tower').value;
    buildingFloor = document.getElementById('building_floor').value;
    unitNumber = document.getElementById('unit_name').value;
    unitPax = document.getElementById('unit_pax').value;
    unitPrice = document.getElementById('unit_price').value;
    unitExtraPaxFee = document.getElementById('unit_extraPaxFee').value;
    unitSize = document.getElementById('unit_size').value;
    unitDescription = document.getElementById('unit_desc').value;

    if (propertyName == '' && propertyAddress == '' && buildingTower == '' && buildingFloor == '' && unitNumber == ''
        && unitPax == '' && unitPrice == '' && unitExtraPaxFee == '' && unitSize == '' && unitDescription == ''
    ) {
        alert('Please fill in all fields');
    } else {
        console.log(propertyName);
        validateProperty();
    }
});

async function validateProperty() {
    try {
        // Fetch all units
        let unitsResponse = await fetch('/api/properties/units');
        let units = await unitsResponse.json();

        // Check if the unit exists (excluding unit_ID and building_ID)
        let unitExists = units.some(unit =>
            unit.unit_name == unitNumber &&
            unit.Unit_Pax == unitPax &&
            unit.Unit_Price == unitPrice &&
            unit.Unit_extraPaxFee == unitExtraPaxFee &&
            unit.Unit_Size == unitSize &&
            unit.Unit_Desc === unitDescription
        );

        if (!unitExists) {
            addProperty();
            return;
        }

        // Fetch all buildings
        let buildingsResponse = await fetch('/api/properties/buildings');
        let buildings = await buildingsResponse.json();

        // Check if the building exists (excluding building_ID)
        let buildingExists = buildings.some(building =>
            building.Building_Tower == buildingTower &&
            building.Building_Floor == buildingFloor
        );

        if (!buildingExists) {
            addProperty();
            return;
        }

        // Fetch all properties
        let propertiesResponse = await fetch('/api/properties/property');
        let properties = await propertiesResponse.json();

        // Check if the property exists (excluding property_ID)
        let propertyExists = properties.some(property =>
            property.Property_Name == propertyName &&
            property.Property_Address == propertyAddress
        );

        if (!propertyExists) {
            addProperty();
            return;
        }

        // If all exist, notify the user
        alert("This unit is already listed.");
    } catch (error) {
        console.error("Error validating property:", error);
        alert("An error occurred while validating the property.");
    }
}

async function addProperty() {
    try {

        // Step 1: Check if Property Exists
        let propertyID = await fetchPropertyID(propertyName);
        console.log(propertyID);
        if (!propertyID) {
            const propertyData = {
                Property_Name: propertyName,
                Property_Address: propertyAddress
            };

            let responseProperty = await fetch('http://localhost:5500/api/properties/property/post', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(propertyData)
            });
            if (!responseProperty.ok) throw new Error("Failed to add property");

            let getPropertyID = await fetchPropertyID(propertyName);
            propertyID = getPropertyID;
             // Get new Property_ID
        }

        // Step 2: Check if Building Exists
        let buildingID = await fetchBuildingID(propertyID,buildingTower,buildingFloor);
        console.log(buildingID);
        if (!buildingID) {
            const buildingData = {
                Property_ID: propertyID,
                Building_Tower: buildingTower,
                Building_Floor: buildingFloor,
            };

            let buildingResponse = await fetch('http://localhost:5500/api/properties/buildings/post', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildingData)
            });

            if (!buildingResponse.ok) throw new Error("Failed to add building");

            let getBuildingID = await fetchBuildingID(propertyID,buildingTower,buildingFloor);
            buildingID = getBuildingID;// Get new Building_ID
        }

        // Step 3: Add Unit with Building_ID
        const unitData = {
            Unit_Name: unitNumber,
            Unit_Pax: unitPax,
            Unit_Price: unitPrice,
            Unit_ExtraPaxFee: unitExtraPaxFee,
            Unit_Size: unitSize,
            Unit_Desc: unitDescription,
            Building_ID: buildingID
        };

        let unitResponse = await fetch('http://localhost:5500/api/properties/units/post', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(unitData)
        });

        if (!unitResponse.ok) throw new Error("Failed to add unit");

        let unitResult = await unitResponse.json();
        alert(unitResult.message || "Unit Added");
    } catch (error) {
        console.error("Error adding property:", error);
        alert(error.message);
    }
}

async function fetchPropertyID(propertyName) {
    try {
        // Make a GET request to your API endpoint
        let response = await fetch("api/properties/property");
        if (!response.ok) throw new Error("Failed to fetch data");

        let data = await response.json(); // Convert response to JSON

        // Find the property that matches the criteria
        let property = data.find(property => property.Property_Name.toLowerCase() === propertyName.trim().toLowerCase());

        return property ? property.Property_ID : null;

    } catch (error) {
        console.error("Error fetching property data:", error);
        return null;
    }
}
async function fetchBuildingID(propertyID, buildingTower, buildingFloor) {
    try {
        let response = await fetch('http://localhost:5500/api/properties/buildings');
        if (!response.ok) throw new Error("Failed to fetch data");

        let data = await response.json();

        let building = data.find(item => item.Property_ID === propertyID && item.Building_Tower.trim().toLowerCase() === buildingTower.trim().toLowerCase() && item.Building_Floor === buildingFloor);

        return building ? building.Building_ID : null;

    } catch (error) {
        console.error("Error fetching building data:", error);
        return null;
    }
}


