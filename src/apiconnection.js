export const API_URL='http://localhost:3005';

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