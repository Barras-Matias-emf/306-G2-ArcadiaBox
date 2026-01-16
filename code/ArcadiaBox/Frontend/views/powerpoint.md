# Présentation : Récupération du score - Super Mario Bros (NES)

Slide 1 — Titre
- Super Mario Bros — Live Score Tracker
- Objectif : expliquer comment on lit le score depuis la mémoire de l'émulateur (WASM / HEAPU8)

Slide 2 — Vue d'ensemble (3 étapes)
- 1) Accéder à la mémoire WebAssembly (HEAPU8)
- 2) Calculer l'adresse finale (adresse NES + offset)
- 3) Lire 6 octets BCD et reconstruire le score

Slide 3 — Accès à la mémoire WASM (HEAPU8)
- On cherche l'objet HEAPU8 exposé par l'émulateur ou window.Module.
- Si trouvé, on le met en cache pour lectures rapides.
- Extrait :
```javascript
// getWasmMemory(): chercher HEAPU8 via plusieurs chemins
const paths = [
  () => this.nostalgist.Module?.HEAPU8,
  () => this.nostalgist.emulator?.emscripten?.Module?.HEAPU8,
  () => this.nostalgist.getEmulator()?.Module?.HEAPU8,
  () => window.Module?.HEAPU8
];
// tester chaque chemin et conserver le premier HEAPU8 valide
```

Slide 4 — Calcul de l'adresse finale
- La RAM NES est mappée dans HEAPU8 à un offset connu.
- Pour une adresse NES (ex: 0x07DE), on fait : finalAddress = nesAddress + offset.
- Extrait :
```javascript
// readNESMemory(address, specificOffset)
const offset = specificOffset !== undefined ? specificOffset : this.scoreOffset;
const finalAddress = address + offset;
return memory[finalAddress];
```

Slide 5 — Lecture et reconstruction du score (BCD)
- Le score est stocké en 6 octets BCD (nibble bas = chiffre 0-9).
- On lit chaque octet, on prend rawByte & 0x0F, on valide (<=9).
- Puis on reconstruit la valeur entière.
- Extrait :
```javascript
// getScore()
const digits = [];
for (let nesAddr of this.scoreAddresses) {
  const rawByte = this.readNESMemory(nesAddr);
  const digit = rawByte & 0x0F; // nibble bas
  if (digit > 9) return 0; // non initialisé ou invalide
  digits.push(digit);
}
const score = digits[0]*100000 + digits[1]*10000 + digits[2]*1000 +
              digits[3]*100 + digits[4]*10 + digits[5];
```

Slide 6 — Vies et detection Game Over
- Adresse dédiée pour les vies (ex: 0x075A).
- Valeur 0xFF (255) signifie Game Over.
- Extrait :
```javascript
// getLives()
const livesRaw = this.readNESMemory(this.livesAddress, this.livesOffset);
if (livesRaw === 255) return -1; // Game Over
return livesRaw + 1; // 0x00 -> 1 vie, etc.
```

Slide 7 — Points à souligner / risques
- HEAPU8 peut être inaccessible selon l'intégration du core WASM.
- Offsets peuvent varier selon la version de l'émulateur : prévoir scan/détection.
- Validation BCD importante pour éviter fausses lectures.

Slide 8 — Démo (commandes rapides)
- Après initialisation : window.MARIO_CONTROLLER.getCurrentScore()
- Debug mémoire : window.MARIO_CONTROLLER.getDebugData()
- Pré-définir pseudo : window.setMarioPseudo("MonPseudo")
- Expliquer en direct : ouvrir la console et montrer getScore(), debugData et canvas affiché.

Slide 9 — Résumé final
- 3 étapes simples : trouver HEAPU8 → calculer adresse → lire BCD et reconstruire.
- Montrer en live : lecture du score, game over et envoi au backend.

Slide 10 — Annexes (références code)
- Indiquer fichiers clés à lire : services/MarioMemoryScanner.js, controllers/MarioGameController.js, controllers/initMario.js
- Conseils : afficher getWasmMemory() et getDebugData() pendant la présentation pour preuve visuelle.
