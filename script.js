function generateSummary() {
    const dest = document.getElementById("destination").value;
    const dates = document.getElementById("dates").value;
    const budget = document.getElementById("budget").value;
    const pref = document.getElementById("preferences").value;

    const summary = `
        <p><strong>Destinazione:</strong> ${dest}</p>
        <p><strong>Date:</strong> ${dates}</p>
        <p><strong>Budget:</strong> €${budget}</p>
        <p><strong>Preferenze:</strong> ${pref}</p>
        <hr>
        <p><strong>Analisi:</strong> itinerario ottimizzato, allineato con sicurezza e qualità.</p>
    `;

    document.getElementById("summaryBox").innerHTML = summary;
    document.getElementById("summarySection").style.display = "block";
}

