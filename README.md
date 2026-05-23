---

## TP Vue.js — Mini Todo App

**Réponses complètes + Guide de dépannage**

### Structure du projet

```
todo-vue/
├── db.json                  ← Base de données json-server (à la racine)
├── package.json
├── src/
│   ├── App.vue              ← Layout + RouterView
│   ├── main.ts              ← createApp + router + pinia
│   ├── views/
│   │   ├── HomeView.vue     ← useTaskStore + TodoItem
│   │   ├── TaskView.vue     ← useRoute + onMounted
│   │   └── AboutView.vue
│   ├── components/
│   │   └── TodoItem.vue     ← defineProps + defineEmits
│   ├── stores/
│   │   └── tasks.ts         ← Pinia store CRUD
│   └── router/
│       └── index.ts         ← 3 routes
```

### Lancer le projet

**Terminal 1 — App Vue**

```sh
npm run dev
```

**Terminal 2 — API json-server (OBLIGATOIRE)**

```sh
npx json-server --watch db.json --port 4000
```

Vérifier que json-server tourne : ouvrir [http://localhost:4000/tasks](http://localhost:4000/tasks) dans le navigateur.

---

### db.json — Explication

db.json est la base de données du projet. json-server lit ce fichier et crée automatiquement une API REST complète :

| Requête HTTP    | Action dans db.json        |
|-----------------|---------------------------|
| GET /tasks      | Lit toutes les tâches      |
| POST /tasks     | Ajoute une tâche          |
| PUT /tasks/:id  | Modifie une tâche         |
| DELETE /tasks/:id | Supprime une tâche      |

C'est une fausse API backend pour dev front. *Pas besoin de Node.js, Express ou MongoDB.* Données persistantes : si on ajoute une tâche et recharge la page, elle reste.

**Contenu minimal du db.json :**

```json
{
  "tasks": []
}
```

---

### Dépannage — Rien ne s'ajoute

- Vérifier que json-server est lancé dans un 2ème terminal
- Vérifier que db.json est à la racine du projet (même niveau que package.json)
- Ouvrir http://localhost:4000/tasks — si erreur de connexion, json-server n'est pas lancé
- Si CORS bloqué : `npx json-server --watch db.json --port 4000 --host localhost`

---

### Tableau de comparaison React ↔ Vue 3

| Concept                      | React                                         | Vue 3                                 |
|------------------------------|-----------------------------------------------|---------------------------------------|
| State local                  | `const [x, setX] = useState(0)`              | `const x = ref(0)`                    |
| Two-way binding              | `value={x} onChange={e => set(e.target.value)}` | `v-model="x"`                      |
| Fetch au montage             | `useEffect(() => { fetch()... }, [])`         | `onMounted(async () => { ... })`      |
| Ajouter au state             | `setItems(prev => [...prev, data])`           | `items.value.push(data)`              |
| Boucle template              | `items.map(i => <li key={i.id}> ...)`         | `<li v-for="i in items" :key="i.id">` |
| Conditionnel                 | `{condition && <div>}`                        | `<div v-if="condition">`              |
| Event                        | `onClick={handler}`                           | `@click="handler"`                    |
| Props enfant                 | `<Child name={x} />`                          | `<Child :name="x" />`                 |
| Callback parent              | `<Child onDelete={handler}/>`                 | `<Child @delete="handler" />`         |
| Router lien                  | `<Link to='/x'>Lien</Link>`                   | `<RouterLink to='/x'>Lien</RouterLink>`|
| Params URL                   | `const { id } = useParams()`                  | `useRoute().params.id`                |
| Navigate                     | `const nav = useNavigate(); nav('/')`         | `const router = useRouter(); router.push('/')` |
| State global                 | `createSlice + useSelector + dispatch`        | `defineStore + useTaskStore()`        |
| Appeler action               | `dispatch(addTask(title))`                    | `store.addTask(title)`                |
| Style isolé                  | CSS Modules / .module.css                     | `<style scoped>`                      |

---

### Réponses aux questions

#### Q1 — Fichier .vue (3 sections) vs .tsx (tout mélangé)
Le fichier `.vue` sépare `<script>`, `<template>` et `<style>` : chaque section a un rôle clair. Un designer peut modifier le template sans toucher à la logique. C'est plus lisible pour des composants simples.

Inconvénient : plus de "magie" du compilateur, support TypeScript parfois moins précis qu'en `.tsx` pur.

`.tsx` garde tout en JavaScript : plus cohérent conceptuellement, meilleur support TypeScript natif, mais logique et affichage sont mélangés.

#### Q2 — Pourquoi React n'a pas de two-way binding natif ?

React utilise un flux de données unidirectionnel : value et onChange sont explicites, ce qui facilite la traçabilité et le debug.  
Vue considère que v-model est un sucre syntaxique acceptable (compile en value + @input en interne).

#### Q3 — Pourquoi `tasks.value.push(data)` fonctionne en Vue mais pas en React ?

Vue 3 utilise des Proxy et intercepte les mutations de tableau pour déclencher les mises à jour.  
React compare la référence du tableau : il faut changer la référence pour provoquer un re-render.

#### Q4 — `useEffect(fn, [])` vs `onMounted(fn)` — lequel est plus lisible ?

`onMounted` est très explicite.  
`useEffect` est plus générique (unifie tous les effets de bord) mais peut dérouter.

#### Q5 — Props fonctions (React) vs événements émis (Vue) — lequel est plus proche du HTML natif ?

Vue avec `emit` est plus proche du modèle natif DOM (événements).  
React passe des callbacks en props — cohérent JS, mais plus éloigné du DOM.

#### Q6 — Que se passe-t-il si on oublie `@delete` en Vue ?

L'événement n'a juste aucun effet (pas d'erreur).  
En React, si on oublie la prop, on obtient une erreur JS.

#### Q7 — `useParams` + `useNavigate` (React) vs `useRoute` + `useRouter` (Vue) — vraiment différent ?

Non, noms différents, logique identique.

#### Q8 — Routes dans le JSX (React) vs fichier de config (Vue) — avantage de Vue ?

Centralisation de la config, guards plus clairement placés, pas de mélange logique/route.

#### Q9 — Redux Toolkit vs Pinia — combien de concepts ?

Redux : 7 concepts minimum pour comprendre le flux complet.
Pinia : defineStore + useTaskStore — c'est tout !  
Pinia a une courbe d'apprentissage bien plus douce.

#### Q10 — `dispatch(addTask(title))` vs `store.addTask(title)` — lequel est plus intuitif ?

`store.addTask(title)` — simple, lisible.  
dispatch exige de comprendre des patterns plus avancés.

#### Q11 — Concepts identiques vs fondamentalement différents

**Identiques :**
- Routing (`useParams`/`useNavigate` ↔ `useRoute`/`useRouter`)
- Props parent→enfant
- Fetch au montage
- Lien de navigation
- Gestion d'erreurs async

**Différents :**
- Réactivité : immutabilité (React) vs Proxy/mutation (Vue)
- Two-way binding : inexistant natif (React), v-model (Vue)
- Enfant→parent : prop fonction (React) vs emit (Vue)
- State management : Redux multi fichiers vs Pinia simple
- Fichiers : tout JS vs SFC 3 sections (Vue)

#### Q12 — Vue est-il plus « magique » ? Avantage ou inconvénient ?

Oui, plus magique : v-model, Proxy, <style scoped> ...  
Avantage : productivité, lisibilité.  
Inconvénient : parfois plus dur à déboguer — React est plus transparent.

#### Q13 — App e-commerce, 50+ pages, équipe de 10, dashboard admin : React ou Vue ?

React :  
- Écosystème plus large
- TypeScript/TSX plus intégré
- Scalabilité prouvée
- SSR/SSG performant (Next.js)
- Immutabilité = moins de bugs d’équipe

#### Q14 — React ou Vue en premier pour un débutant ?

Vue :
- v-model aide à comprendre les liaisons simplement
- Template HTML proche du réel
- Pinia bien plus simple
- SFC facilite la compréhension de la structure

Une fois Vue acquis, React est facile à apprendre ensuite !
