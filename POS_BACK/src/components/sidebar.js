import { logoutUser } from "../services/UserRequests";

export function sideButton(label, iconClass, onClick) {
  const button = document.createElement("div");
  
  // Layout and Hover effects
  // We use bg-[#E8E8E3] as the base and hover:bg-bakery-mint for interaction
  button.className = "flex flex-row items-center gap-3 px-4 py-3 rounded-lg text-[#2d2621] hover:bg-surface-hover transition-colors cursor-pointer font-medium";

  // Icon Element (FontAwesome)
  const icon = document.createElement("i");
  icon.className = `fa-solid ${iconClass} text-[#6b6661]`; // Muted brown for icons

  // Label Element
  const text = document.createElement("span");
  text.textContent = label;

  button.append(icon, text);
  button.addEventListener("click", onClick);
  return button;
}

export function userProfileButton(User, Status, pageLoad) {
const containerDiv = document.createElement("div");

// Layout and Theme matching
containerDiv.className="flex flex-row items-center gap-3 px-3 py-2 rounded-lg text-black cursor-pointer mt-auto bg-surface-hover transition-colors duration-200"
// Title/Status container
const titleDiv = document.createElement("div");
titleDiv.className = "flex flex-col leading-tight"; // leading-tight keeps the name and status close together

const userTitle = document.createElement("span");
userTitle.className = "font-bold text-sm";
userTitle.textContent = User;

const userStatus = document.createElement("span");
userStatus.className = "text-xs text-[#6b6661]"; // Using your muted brown/gray for the status
userStatus.textContent = Status;

titleDiv.append(userTitle, userStatus);
document.addEventListener("click",pageLoad);
const logoutBtn = document.createElement("button");
    logoutBtn.className = "p-1.5 hover:bg-gray-200 rounded-md transition-colors text-[#6b6661] hover:text-red-600";
    // Using a simple SVG icon for a cleaner look
    logoutBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
    `;
    
    // Placeholder for your functionality
    logoutBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevents the containerDiv click from firing
        logoutUser();
        localStorage.removeItem("user_id");
        localStorage.removeItem("privilege");
        location.reload();
      });

    containerDiv.append(titleDiv, logoutBtn);
    
    return containerDiv;
}
export function sideBar(){
    
}
