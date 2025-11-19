function searchFlights() {
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;
    let date = document.getElementById("date").value;

    const table = document.querySelector("#results-table tbody");
    table.innerHTML = ""; // Reset tabella

    // Mock data – qui poi potrai collegare API reali
    const flights = [
        { airline: "ITA Airways", from: from, to: to, price: "€350" },
        { airline: "Lufthansa", from: from, to: to, price: "€410" },
        { airline: "Emirates", from: from, to: to, price: "€520" }
    ];

    flights.forEach(f => {
        const row = `
            <tr>
                <td>${f.airline}</td>
                <td>${f.from}</td>
                <td>${f.to}</td>
                <td>${f.price}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}
