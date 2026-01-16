const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ...existing code...

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});