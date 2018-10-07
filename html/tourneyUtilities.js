function closeDropdowns(event) {
  if (!event || !event.target.matches('.dropdown-button')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function showDropdown(name) {
  closeDropdowns()
  element = document.getElementById(name)
  if (element) element.classList.toggle("show");
}

window.onclick = closeDropdowns