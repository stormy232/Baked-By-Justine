
/*
category
searchTerm
limit
start
*/
async function getInventory(category = "All", searchTerm = "", limit = 10, start = 0) {
    try {
        const response = await fetch(`http://localhost:41062/team_php/inventory.php?category=${category}&name=${searchTerm}&limit=${limit}&start=${start}`);

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

getInventory("All", "Coffee");