const taskButton = document.getElementById('taskButton');

taskButton.addEventListener('click', () => {
    const taskElement = document.getElementById('textbox').value;
    if (taskElement.trim() !== "") {
        const listItem = document.createElement("li");
        listItem.textContent = taskElement;

        document.getElementById("taskList").appendChild(listItem);

        document.getElementById("textbox").value = "";
    }
});