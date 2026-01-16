# ArcadiaBox — Guide de déploiement

Résumé
- Ce document décrit la procédure simple pour déployer ArcadiaBox sur un Raspberry Pi.

Prérequis (Raspberry Pi)
- Un Raspberry Pi (arm32/arm64 selon modèle).
- Docker installé (ou Docker Engine + Compose plugin).
  - Installer Docker : https://docs.docker.com/engine/install/
  - Installer Docker Compose (si nécessaire) : https://docs.docker.com/compose/install/
- Accès SSH/console au Pi et accès au réseau.

Déploiement local sur Raspberry Pi (procédure simple)
1. Cloner le dépôt (depuis votre machine ou directement sur le Pi) :
   - git clone https://github.com/Barras-Matias-emf/306-G2-ArcadiaBox
2. Se rendre dans le dossier contenant Arcadiabox :
   - cd 306-G2-ArcadiaBox/code/Arcadiabox
3. Lancer la construction et le lancement en arrière-plan :
   - docker compose up --build -d
4. Vérifier que les services tournent :
   - docker ps
   - docker logs -f <container_name>

Dépannage rapide
- Si conteneurs ne démarrent pas : docker logs -f <container>
- Problèmes d'architecture : vérifier que les images sont compatibles ARM ou reconstruire localement.
- Ports : vérifier que le port exposé n'est pas occupé (ss -tulpn / sudo lsof -i :<port>).

Notes finales
- La procédure ci‑dessus suffit si le dépôt contient tout (Dockerfile, docker-compose.yml) dans code/Arcadiabox.