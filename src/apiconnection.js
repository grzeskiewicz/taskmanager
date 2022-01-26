//export const API_URL='https://taskmanager-node.herokuapp.com';
<<<<<<< HEAD
=======
//export const API_URL = 'http://localhost:3001';
>>>>>>> 49becd92656f330000a7e8c5368108ae7e9b2369
export const API_URL = 'https://api.arielgrzes.ovh';

export const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
});


export function request(url, method, dataset,headerz) {
    return new Request(url, {
        method: method,
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(dataset)
    });
}