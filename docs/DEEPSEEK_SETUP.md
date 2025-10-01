# Configuration DeepSeek pour l'Analyse IA

Ce guide explique comment configurer l'intégration DeepSeek pour l'analyse IA des formulaires.

## 1. Obtenir une clé API DeepSeek

1. Visitez [DeepSeek Platform](https://platform.deepseek.com/)
2. Créez un compte ou connectez-vous
3. Allez dans la section "API Keys"
4. Générez une nouvelle clé API
5. Copiez la clé API (elle commence généralement par `sk-`)

## 2. Configuration de l'environnement

### Option A: Variables d'environnement (Recommandé)

Créez un fichier `.env.local` à la racine du projet :

```bash
# DeepSeek API Configuration
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-your-actual-api-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Option B: Configuration directe

Modifiez le fichier `lib/config.ts` :

```typescript
export const config = {
  deepSeek: {
    apiKey: 'sk-your-actual-api-key-here', // Remplacez par votre vraie clé
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },
  // ...
}
```

## 3. Vérification de la configuration

1. Démarrez l'application : `npm run dev`
2. Allez sur la page des réponses d'un formulaire
3. Cliquez sur l'onglet "Analyse IA"
4. Vérifiez que le statut DeepSeek affiche "Connecté"

## 4. Utilisation de l'analyse IA

### Générer une analyse

1. Allez dans la page des réponses d'un formulaire
2. Cliquez sur "Analyser avec IA" dans la barre d'actions
3. Sélectionnez "Générer l'analyse"
4. Attendez que l'analyse soit terminée (2-5 secondes)

### Types d'analyses disponibles

- **Résumé exécutif** : Vue d'ensemble des résultats
- **Insights clés** : Tendances et patterns identifiés
- **Recommandations** : Suggestions d'amélioration
- **Graphiques** : Visualisations des données par question

### Export des résultats

- **JSON** : Export complet des données d'analyse
- **Tableau** : Vue tabulaire des résultats
- **Graphiques** : Visualisations interactives

## 5. Dépannage

### Erreur "API key DeepSeek non configurée"

- Vérifiez que `NEXT_PUBLIC_DEEPSEEK_API_KEY` est défini
- Redémarrez le serveur de développement
- Vérifiez que la clé API est valide

### Erreur "Impossible de se connecter à l'API DeepSeek"

- Vérifiez votre connexion internet
- Vérifiez que la clé API est correcte
- Vérifiez que votre compte DeepSeek est actif

### Analyse qui échoue

- Vérifiez qu'il y a des réponses dans le formulaire
- Vérifiez que les questions ont des options (pour les questions à choix multiples)
- Vérifiez les logs de la console pour plus de détails

## 6. Limites et considérations

### Limites de l'API DeepSeek

- **Rate limiting** : Respectez les limites de requêtes
- **Tokens** : Chaque analyse consomme des tokens
- **Modèle** : Utilise le modèle `deepseek-chat`

### Optimisations

- Les analyses sont mises en cache côté client
- Les données sont compressées avant envoi
- Seules les 10 premières réponses sont envoyées pour l'analyse (les autres sont résumées)

## 7. Sécurité

- **Ne commitez jamais** votre clé API dans le code
- Utilisez des variables d'environnement
- Surveillez l'utilisation de votre clé API
- Régénérez la clé si elle est compromise

## 8. Support

Pour toute question ou problème :

1. Vérifiez les logs de la console
2. Testez la connexion avec le composant DeepSeekStatus
3. Consultez la documentation DeepSeek
4. Contactez le support technique
