const url = "http://localhost:41062/api/users/register.php";

export function registerUser(formData) {
fetch(url, {
    method: "POST",
    body: formData, //
  })
.then(response => {
  if (!response.ok) throw new Error('Network response was not ok'); //
  return response.json();
})
.catch(error => console.error('Error:', error)); //
}

export function deleteUser(userId) {
fetch(url + `?userid=${userId}`, {
    method: "DELETE",
  })
.then(response => {
  if (!response.ok) throw new Error('Network response was not ok'); //
  return response.json();
})
.catch(error => console.error('Error:', error)); //
}

export function updateUser(formData) {
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


