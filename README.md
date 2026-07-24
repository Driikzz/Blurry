# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command

# Environnement de recette

## Vue d'ensemble

- `docker-compose.prod.yml` lance `database` (Postgres) et `api`, en tirant l'image
  `ghcr.io/driikzz/blurry:develop` depuis le GitHub Container Registry (privé).
- `docker-compose.watchtower.yml` lance un conteneur Watchtower qui surveille **uniquement**
  le conteneur `api` (grâce au label `com.centurylinklabs.watchtower.enable=true`) et le
  redéploie automatiquement dès qu'une nouvelle image `develop` est poussée sur le registre.
- Watchtower vérifie le registre toutes les minutes (`WATCHTOWER_SCHEDULE=0 * * * * *`).

Comme `ghcr.io/driikzz/blurry` est un package **privé**, Docker (et Watchtower) doivent être
authentifiés auprès de `ghcr.io` pour pouvoir pull l'image. C'est l'objet des étapes ci-dessous.

## 1. Générer un Personal Access Token (PAT) GitHub

1. Aller sur https://github.com/settings/tokens → **Tokens (classic)** → **Generate new token (classic)**.
2. Cocher uniquement le scope **`read:packages`** (aucun autre scope n'est nécessaire).
3. Générer le token et le copier immédiatement : GitHub ne l'affichera plus jamais après coup.
   Le format ressemble à `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.

> Le PAT doit appartenir à un compte ayant accès en lecture au package
> `ghcr.io/driikzz/blurry` (accès repo ou membre de l'org selon la visibilité configurée).

## 2. Authentifier Docker sur la machine hôte

Nécessaire pour que `docker compose -f docker-compose.prod.yml up` puisse pull l'image
directement (indépendamment de Watchtower) :

```powershell
docker login ghcr.io -u <ton_user_github>
# coller le PAT généré à l'étape 1 quand demandé comme mot de passe
```

## 3. Générer `ghcr-auth.json` pour Watchtower

Watchtower tourne dans son propre conteneur (Linux) et n'a pas accès au trousseau de
Docker Desktop (`credsStore`) utilisé par `docker login` sur Windows. Il lui faut donc un
fichier `config.json` autonome contenant les credentials encodés en base64.

À exécuter dans PowerShell, à la racine du projet (`C:\DEV\Blurry`) :

```powershell
$ghUser  = "ton_user_github"
$ghToken = "ghp_xxx_ton_PAT_copie_a_l_etape_1"

$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("$ghUser`:$ghToken"))

echo $b64
# copier le resultat
```

Créer le fichier ghcr-auth.json :

```json
{
  "auths": {
    "ghcr.io": {
      "auth": "credential_base_64"
    }
  }
}
```

## 4. Lancer la stack de recette

```powershell
docker compose -f .\docker-compose.prod.yml up -d
docker compose -f .\docker-compose.watchtower.yml up -d
```
