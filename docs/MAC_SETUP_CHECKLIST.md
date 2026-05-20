# Shift-K — Checklist d'installation Mac

Document de référence à suivre sur ton Mac pendant que tu attends la validation du compte Apple Developer.
À chaque étape, une commande à copier-coller dans le **Terminal** (Cmd+Espace → "Terminal" → Entrée).

---

## Avant de commencer

Ouvre le Terminal et garde-le ouvert pendant toute la session. Toutes les commandes vont là.

Si jamais une commande te demande un mot de passe : c'est ton mot de passe Mac (admin), tu tapes "à l'aveugle" (pas d'astérisques affichés, c'est normal sur macOS).

---

## Étape 1 — Xcode Command Line Tools

Fondation pour compiler du code natif sur Mac (Git, compilateurs, etc.).

```
xcode-select --install
```

Une popup apparaît → clique "Installer". Compte 5 à 10 minutes selon ta connexion.

**Vérification :**

```
xcode-select -p
```

Doit retourner quelque chose comme `/Library/Developer/CommandLineTools`. Si oui, étape OK.

---

## Étape 2 — Homebrew

Gestionnaire de paquets pour tout le reste.

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Important** : à la fin du script, il affiche 2-3 commandes à lancer pour ajouter Homebrew au PATH. Elles ressemblent à :

```
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Copie-colle exactement les commandes qu'il te donne**, pas celles que je mets ici (le chemin varie selon Mac Intel vs Apple Silicon).

**Vérification :**

```
brew --version
```

Doit afficher la version (4.x ou supérieur). Si oui, étape OK.

---

## Étape 3 — Node.js

**Avant de lancer la commande**, vérifie la version Node sur ton Windows. Sur Windows, ouvre PowerShell et tape :

```
node --version
```

Note le numéro (ex : `v20.11.1` → version 20).

Ensuite sur le Mac :

```
brew install node@20
```

(remplace 20 par la version que tu as relevée sur Windows)

Puis lie le binaire au PATH :

```
brew link node@20 --force --overwrite
```

**Vérification :**

```
node --version
npm --version
```

Tu dois voir les deux versions. Si oui, étape OK.

---

## Étape 4 — Claude Code

```
npm install -g @anthropic-ai/claude-code
```

**Vérification :**

```
claude --version
```

Premier lancement de `claude` te demandera de te logger avec ton compte Anthropic (même que celui de l'app Claude desktop). Suis le flow OAuth dans le navigateur.

---

## Étape 5 — VS Code (recommandé)

```
brew install --cask visual-studio-code
```

Ouvre VS Code une fois installé, puis :
- Cmd+Shift+X (extensions)
- Cherche "Claude" et installe l'extension officielle Anthropic

---

## Étape 6 — Git + GitHub CLI

Configure ton identité Git :

```
git config --global user.name "Hadrien Durand-Baïssas"
git config --global user.email "hadridb@gmail.com"
```

Installe GitHub CLI :

```
brew install gh
```

Authentification :

```
gh auth login
```

Choisis :
- GitHub.com
- HTTPS
- Yes (authenticate Git with GitHub credentials)
- Login with a web browser
- Copie le code affiché, ouvre l'URL dans Safari, colle le code, autorise

**Vérification :**

```
gh auth status
```

Doit afficher "Logged in to github.com as TON_USERNAME". Si oui, étape OK.

---

## Étape 7 — Cloner le repo Shift-K

Crée le dossier de projets standard Apple :

```
mkdir -p ~/Developer
cd ~/Developer
```

Clone le repo (remplace `TON_USERNAME` par ton vrai username GitHub) :

```
gh repo clone TON_USERNAME/shift-k
cd shift-k
```

Si tu ne connais pas le nom exact du repo, lance :

```
gh repo list
```

Ça liste tous tes repos, tu trouveras le bon.

---

## Étape 8 — Installer les dépendances

```
npm install
```

Compte 3 à 5 minutes la première fois. Tu vas voir des messages "node-gyp" qui compilent better-sqlite3 et quelques modules natifs — c'est normal et c'est pour ça qu'on avait installé Xcode CLT en étape 1.

**Si tu vois des warnings jaunes**, c'est ok, on ignore.
**Si tu vois des erreurs rouges**, copie-colle dans Claude Code et il diagnostique.

---

## Étape 9 — Premier lancement

```
npm run dev
```

L'overlay Shift-K devrait apparaître à l'écran. **Moment de vérité Mac** — note tout ce qui te semble bizarre :

- Position et taille de l'overlay
- Les hotkeys (Ctrl+Alt+1..0 sur Windows → essaie **Cmd+Option+1..0** sur Mac)
- L'icône dans la barre de menu en haut à droite (le tray)
- Le rendu visuel des thèmes (Liquid Glass surtout, qui utilise un effet natif Mac différent de Windows)
- Le comportement quand tu glisses un fichier dans Downloads

**Notes tes observations dans un fichier `~/Developer/shift-k/MAC_BUGS.md`** pour qu'on les passe en revue avec Claude Code après.

---

## État attendu une fois les 9 étapes finies

Sur ton Mac, tu as :
- Un projet Shift-K cloné dans `~/Developer/shift-k`
- L'app qui tourne en mode dev avec `npm run dev`
- Claude Code installé et fonctionnel (lance `claude` depuis le dossier projet pour reprendre où on en est)
- VS Code prêt à coder dedans
- Tous les outils en place pour builder dès que les certificats Apple arrivent

**Ce qu'il te manque encore :**
- Le compte Apple Developer activé (24-48h d'attente Apple)
- Les certificats Developer ID Application
- Un App-Specific Password (Apple ID) pour la notarization API
- Ton Team ID Apple

Ces 4 trucs viennent après validation du compte Apple, on les configure ensemble à ce moment-là.

---

## Si quelque chose casse

1. Copie l'erreur exacte
2. Ouvre Claude Code depuis le dossier projet : `cd ~/Developer/shift-k && claude`
3. Colle l'erreur et explique l'étape où tu étais
4. Claude Code lit `CLAUDE.md` automatiquement et a tout le contexte du projet

---

## Pour reprendre la conversation Cowork sur ton Mac

Le plus simple : ouvre **claude.ai** dans Safari et connecte-toi avec ton compte Anthropic. Tu retrouves tes conversations web là. Pour les conversations Cowork (desktop) elles restent sur le Mac/PC où elles ont été démarrées — mais tu peux toujours démarrer une nouvelle conversation sur ton Mac qui aura le contexte de `CLAUDE.md` une fois Claude Code lancé dans le dossier projet.
