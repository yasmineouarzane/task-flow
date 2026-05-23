
## TP5

### Partie 1 — Sécurité XSS

**Q1 : Le script s'exécute-t-il ? Pourquoi ? Que fait React avec les strings dans le JSX ?**

Non, le script ne s'exécute pas. React échappe automatiquement toutes les strings affichées dans le JSX. `<img src=x onerror=alert("HACK")>` est affiché comme du texte brut visible à l'écran, pas interprété comme du HTML. C'est la protection anti-XSS intégrée de React.

**Q2 : Que se passe-t-il avec dangerouslySetInnerHTML ?**

Cette fois le script S'EXÉCUTE — une alerte "HACK" apparaît dans le navigateur. `dangerouslySetInnerHTML` désactive complètement la protection XSS de React. Le HTML est injecté et interprété directement dans le DOM. Ne jamais utiliser avec des données venant d'un utilisateur ou d'une API.

---

### Partie 2 — JWT simulé

**Q3 : Voyez-vous le header Authorization: Bearer ... dans Network ?**

Oui. Dans F12 → Network → cliquer sur la requête GET /projects → onglet Headers → Request Headers → on voit :
`Authorization: Bearer eyJ1c2VySWQi...`
C'est l'intercepteur Axios qui ajoute automatiquement ce header à chaque requête après que `setAuthToken()` a été appelé.

**Q4 : Pourquoi stocker le token en mémoire (state React) et PAS dans localStorage ?**

| Critère            | localStorage                     | State React (mémoire)       |
|--------------------|----------------------------------|----------------------------|
| Accès XSS          | Accessible par tout script JS    | Isolé, inaccessible depuis l'extérieur |
| Persistance        | Survit au rechargement           | Perdu au rechargement (voulu)         |
| Sécurité           | Vulnérable si XSS                | Protégé                    |
| Recommandation     | Jamais pour les tokens           | Oui pour les tokens sensibles         |

`localStorage` est accessible par TOUT script JavaScript de la page. Si un attaquant injecte du JS (XSS), il peut faire `localStorage.getItem('token')` et voler le token. Le state React est isolé dans la mémoire du composant.

---

### Partie 3 — Redux Toolkit

**Q5 : Comparez authSlice.ts avec authReducer.ts. Qu'est-ce qui a changé ?**

| Critère           | authReducer.ts (ancien)               | authSlice.ts (Redux Toolkit)                |
|-------------------|---------------------------------------|---------------------------------------------|
| Syntaxe           | switch/case manuel                    | Fonctions dans reducers: {}                 |
| Action types      | Strings manuels 'LOGIN_START'          | Auto-générés par RTK                        |
| Immutabilité      | Spread manuel `{ ...state, loading: true }` | Mutation directe `state.loading = true` (Immer) |
| Action creators   | Créés manuellement                    | Auto-exportés `authSlice.actions`           |
| Boilerplate       | Beaucoup                              | Très peu                                    |

RTK utilise Immer en coulisse : écrire `state.user = action.payload` semble mutable mais Immer crée un nouvel objet immutable automatiquement. Plus besoin de spread `{ ...state }`.

---

### Partie 4 — React.memo & useCallback

**Q6 : Combien de composants se re-rendent quand on toggle la sidebar ?**

Sans optimisation, TOUS les composants se re-rendent :  
- Header ✅ (normal — reçoit onMenuClick qui change)  
- Sidebar ✅ (normal — isOpen change)  
- MainContent ❌ (inutile — ses props columns n'ont pas changé)  

MainContent ne DEVRAIT PAS se re-rendre car ses données (columns) n'ont pas changé lors du toggle de la sidebar.

**Q7 : Pourquoi MainContent ne se re-rend plus avec React.memo ?**

`React.memo` compare les props actuelles avec les props précédentes (*shallow comparison* — comparaison superficielle). Si les props sont identiques, React saute le re-render entièrement. columns n'a pas changé lors du toggle sidebar → MainContent ignoré → pas de re-render.

**Q8 : Quelle différence entre useMemo et useCallback ?**

| Hook        | Mémoïse             | Utilisation                                  |
|-------------|---------------------|----------------------------------------------|
| useCallback | Une fonction        | Éviter de recréer une fonction à chaque render |
| useMemo     | Une valeur calculée | Éviter de recalculer une valeur coûteuse     |

Exemples :

```js
// useCallback — mémoïse la fonction elle-même
const handleRename = useCallback((project) => {
  renameProject(project);
}, [renameProject]);

// useMemo — mémoïse le résultat d'un calcul
const sortedProjects = useMemo(() => {
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}, [projects]);
```

Le piège : `onRename={(p) => renameProject(p)}` crée une NOUVELLE fonction à chaque render même si renameProject n'a pas changé. `memo(Sidebar)` détecte que la prop onRename a changé (nouvelle référence) et re-rend quand même. Solution : useCallback pour stabiliser la référence.

---

### Partie 5 — Custom Hook

**Q9 (implicite) : Pourquoi extraire la logique dans un custom hook ?**

|            | Sans hook           | Avec `useProjects`      |
|------------|---------------------|------------------------|
| Taille     | Dashboard a 100+ lignes | Dashboard simplifié ~50 lignes |
| Logique    | Mélangée avec UI    | Logique séparée de l'affichage |
| Réutilisable | Impossible        | Utilisable partout     |
| Testable   | Difficile           | Testable indépendamment |

Un custom hook est juste une fonction qui commence par `use` et peut appeler d'autres hooks. Il permet de séparer la logique métier de l'UI.

---

### Partie 6 — React Profiler

**Q10 : Pour chaque action, quels composants se re-rendent ?**

| Action                 | Composants re-rendus          | Re-renders inutiles après memo       |
|------------------------|------------------------------|--------------------------------------|
| Toggle sidebar         | Header, Sidebar              | MainContent ❌ (éliminé par memo)    |
| Ajouter un projet      | Dashboard, Sidebar           | MainContent ❌ (éliminé par memo)    |
| Naviguer ProjectDetail | App, ProtectedRoute, ProjectDetail | Aucun                         |
| Se déconnecter         | App → Login                  | Aucun                               |

Après `React.memo` sur MainContent et useCallback sur handleRename :
- Toggle sidebar → MainContent ne re-render plus ✅
- Ajout projet → MainContent ne re-render plus ✅ (columns n'a pas changé)

---

### Résumé des concepts clés (TP5)

| Concept                  | Rôle                                         |
|--------------------------|----------------------------------------------|
| React.memo               | Évite re-render si props inchangées          |
| useCallback              | Stabilise la référence d'une fonction        |
| useMemo                  | Mémoïse une valeur calculée coûteuse         |
| Redux Toolkit            | Remplace useReducer + Context pour état global|
| authSlice                | Gère auth avec moins de boilerplate qu'un reducer manuel |
| useProjects              | Custom hook qui sépare logique CRUD de l'UI  |
| setAuthToken             | Intercepteur Axios qui ajoute Bearer token automatiquement |
| dangerouslySetInnerHTML  | Désactive protection XSS — jamais avec données utilisateur |
