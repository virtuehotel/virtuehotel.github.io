
window.addEventListener("scroll", function () {
    var header = document.querySelector(".site_heading");

    if (window.scrollY > 0) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});
