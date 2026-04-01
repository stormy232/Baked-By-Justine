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
containerDiv.append(titleDiv);

return containerDiv;
}
export function sideBar(){
    
}
