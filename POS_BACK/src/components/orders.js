export function orderCard(orderNumber, customerName, items, status, time, price) {
  const card = document.createElement('div');
  card.className = 'flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100';
  card.innerHTML = `
    <div class="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
      <img src="" class="w-full h-full object-cover" />
    </div>
    <div class="flex flex-col gap-1 flex-1">
      <div class="flex justify-between items-start">
        <span class="font-medium text-sm">${orderNumber} — ${customerName}</span>
        <span class="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">${status}</span>
      </div>
      <span class="text-xs text-stone-400">${items}</span>
      <div class="flex justify-between items-center mt-1">
        <span class="text-xs text-stone-400">${time}</span>
      </div>
    </div>
  `;
  return card;
}
export async function createOrderCards(containerSelector) {
    try {
        // 1. Fetch data from your order.php
        const response = await fetch(`http://cs1xd3.cas.mcmaster.ca/~randevv/Justine_Bakes/POS_BACK/php/order.php?`);
        const data = await response.json();

        if (data.status === 'success') {
            const container = document.querySelector(containerSelector);
            container.innerHTML = ''; // Clear "Loading..." text or old cards

            // 2. Loop through each order from the DB
            data.orders.forEach(order => {
                // Map your DB columns to your UI function:
                // orderCard(id, customer, items, status, time)
                const card = orderCard(
                    `Order #${order.order_id}`, 
                    `User ${order.user_id}`, // Change this if you join a users table later
                    order.product_name, 
                    order.order_status, 
                    new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})                );
                
                container.append(card);
            });
        }
    } catch (error) {
        console.error("Failed to load orders:", error);
    }
}
