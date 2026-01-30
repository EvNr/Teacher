document.addEventListener('DOMContentLoaded', () => {
    console.log('Math Academy Application Initialized');

    // Simple animation trigger for elements with .fade-in class
    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
});
