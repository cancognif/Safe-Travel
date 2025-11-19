ffunction generateSummary() {
    const dest = document.getElementById("destination").value;
    const dates = document.getElementById("dates").value;
    const budget = document.getElementById("budget").value;
    const pref = document.getElementById("preferences").value;

    const text = `
        <p><strong>Destinazione:</strong> ${dest}</p>
        <p><strong>Periodo:</strong> ${dates}</p>
        <p><strong>Budget:</strong> €${budget}</p>
        <p><strong>Preferenze:</strong> ${pref}</p>
        <hr>
        <p><strong>Analisi SMART:</strong><br>
        Itinerario ottimizzato, valutazione sicurezza integrata, consigli su mobilità,
        meteo, quartieri consigliati, affidabilità strutture e aree da evitare.</p>
    `;

    document.getElementById("summaryBox").innerHTML = text;
    document.getElementById("summarySection").classList.remove("hidden");
}
