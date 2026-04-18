
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

