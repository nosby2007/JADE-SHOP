const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint pour générer un PDF
const fs = require('fs');

app.get('/api/generate-pdf', async (req, res) => {
    try {
        const professionals = [
            { name: 'Jean Dupont', startDate: '2024-01-01', npi: '123456', login: 'jean.dupont@mail.com', officePhone: '0123456789', type: 'Médecin' },
            { name: 'Marie Curie', startDate: '2024-02-01', npi: '789012', login: 'marie.curie@mail.com', officePhone: '9876543210', type: 'Infirmière' },
        ];

        // Génération du tableau HTML
        const rows = professionals.map(pro => `
            <tr>
                <td>${pro.name}</td>
                <td>${pro.startDate}</td>
                <td>${pro.npi}</td>
                <td>${pro.login}</td>
                <td>${pro.officePhone}</td>
                <td>${pro.type}</td>
            </tr>
        `).join('');

        const html = `
    <html>
    <head>
        <title>Test PDF</title>
    </head>
    <body>
        <h1>Hello, PDF!</h1>
        <p>Ceci est un test de génération PDF.</p>
    </body>
    </html>
        `;

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        
        // Sauvegarder le fichier PDF localement pour inspection
        fs.writeFileSync('rapport-' + Date.now() + '.pdf', pdfBuffer);
        console.log('Fichier PDF généré et sauvegardé localement.');

        await page.waitForTimeout(2000); // Attendre 2 secondes


        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="test.pdf"',
            'Content-Length': pdfBuffer.length, // Indiquer la taille du fichier
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        res.status(500).send('Erreur lors de la génération du PDF.');
    }
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
