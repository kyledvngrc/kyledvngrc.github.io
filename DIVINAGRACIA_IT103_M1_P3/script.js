document.addEventListener("DOMContentLoaded", function() {
    const portfolio = document.querySelector(".myportfolio");
    if (portfolio) {
        portfolio.addEventListener("click", function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.error("Element with class 'myportfolio' not found.");
    }
});