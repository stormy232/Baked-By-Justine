function InventoryCard(Title, Image, Price, Units, Category) {
    const wrapper = document.createElement('div');
    wrapper.className = "bg-white rounded-xl overflow-hidden w-72";
    wrapper.innerHTML = `
    <img src=${Image} class="h-48 w-full object-cover" /> 
    <!-- Info -->
    <div class="p-4 flex flex-col gap-3">
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1">
          <div><span>${Category}</div><!-- category -->
          <div>${Title}</div><!-- name -->
        </div>
        <div>${Price}</div><!-- price -->
      </div>
 
      <hr class="border-gray-100" />
 
      <!-- Stock footer -->
      <div class="flex justify-between items-center">
        <div>${Units} Available</div><!-- stock status -->
      </div>
    </div>
    </div>
    `;
}