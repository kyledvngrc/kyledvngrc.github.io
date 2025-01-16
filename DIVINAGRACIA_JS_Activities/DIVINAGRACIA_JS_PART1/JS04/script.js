const calculateButton = document.getElementById('calcButton');
const diffElement = document.getElementById('difference');

calculateButton.addEventListener('click', () => {
    const startDate = new Date(document.getElementById('calendar1').value);
    const endDate = new Date(document.getElementById('calendar2').value);

    const differenceInTime = (startDate - endDate) / (1000 * 60 * 60 * 24);
    diffElement.textContent = `The difference is ${differenceInTime} days.`;
});