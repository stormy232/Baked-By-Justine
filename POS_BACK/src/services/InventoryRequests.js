
/*
category
searchTerm
limit
start
*/
const url = "http://localhost:41062/php/inventory.php?";
export async function getInventory(category = "All", searchTerm = "", limit = 50, start = 0) {
    try {
        const response = await fetch(url + `category=${category}&name=${searchTerm}&limit=${limit}&start=${start}`);

        if (!response.ok) {
            const errorBody = await response.json(); // or .text()
            console.error('Error Body:', errorBody);
        }

        const data = await response.json();
        console.log(data);
        return data; // Return data so you can use it outside the function
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

export function removeInventory(inventoryId){
  fetch(url+`?id=${id}` , {
    method: "DELETE" 
  })
  .then(reponse => if(!response == 200){console.error("ISSUE");} return response.json())
  .catch(error => console.error(`error: ${error}`); 
}

export function updateInventory(formData) {
fetch(url, {
    method: "PUT",
    body: formData, //
  })
.then(response => {
  if (!response.ok) throw new Error('Network response was not ok'); //
  return response.json();
})
.catch(error => console.error('Error:', error)); //
}

