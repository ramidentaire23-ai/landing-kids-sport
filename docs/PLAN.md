# Plan : Landing Page E-commerce - Lunettes de Sport Enfants

> PRD source : docs/PRD.md

## Décisions architecturales

Décisions durables qui s'appliquent à toutes les phases :

- **Architecture applicative** : Single Page Application (HTML5 / Tailwind CSS / Vanilla JS optimisé zéro dépendance lourde pour une vitesse de chargement instantanée sur mobile 3G/4G) + Serveur Node.js/Express léger pour sécuriser les clés d'API et traiter les envois vers Nord et Ouest Express.
- **Routes & Pages** :
  - `GET /` : Landing page principale ultra-optimisée mobile-first
  - `POST /api/order` : Endpoint de traitement de la commande client, validation des données, et transmission directe à l'API Nord et Ouest Express
  - `GET /merci` (ou redirection `merci.html`) : Page de remerciement et de confirmation de commande
- **Modèle de données Commande** :
  - Client : `nom_prenom`, `telephone` (format 10 chiffres algérien), `wilaya_id`, `commune`, `adresse`
  - Panier : `produit` ("Lunettes de Sport Kids <12 ans"), `couleur` ("Noir Sport" ou "Transparent"), `quantite` (1), `prix_unitaire` (2900 DA), `frais_livraison`, `total`
- **Sécurité API** : La clé/token API du transporteur (`JlLZKsPRF6eClTd4v2NaDfS60JZLbgxtWfd`) reste strictement protégée côté serveur et n'est jamais exposée dans le code client.
- **Condition de tracking Meta Pixel** :
  - `PageView` à l'ouverture de la landing page.
  - `InitiateCheckout` au premier focus/interaction avec le formulaire de commande.
  - `Purchase` exclusivement déclenché sur la page de remerciement après confirmation de succès HTTP 200/201 renvoyée par Nord et Ouest Express.

---

## Phase 1 : Vitrine d'Impact & Hook Visuel (Mobile-First)

**User stories** : US-1

### Ce qu'on livre

Structure frontend complète avec barre d'urgence, Hero Section mobile-first, promesse centrale immédiate (*"Verres remplaçables chez l'opticien avec sa propre vue"*), présentation technique antichoc (sécurité, sangle, enfants < 12 ans) et premier bouton d'ancrage CTA.

### Critères d'acceptation

- [ ] Affichage en moins d'une seconde sur mobile.
- [ ] Le message "Verres remplaçables chez l'opticien" est visible dès le premier écran sans scroll.
- [ ] Le bouton d'action principal fait défiler l'écran de manière fluide vers le formulaire de commande.
- [ ] Style visuel propre d'une vraie marque de sport pour enfants (Palette #1E3A8A et #EA580C).

## Bloquée par

- Aucune — démarrable immédiatement.

---

## Phase 2 : Formulaire de Commande Express 1-Click & Récapitulatif Dynamique

**User stories** : US-2, US-3, US-4, US-5

### Ce qu'on livre

Formulaire de commande express sans distraction intégrant : sélecteur visuel interactif des coloris (Noir Sport et Transparent), saisie du nom, numéro de téléphone algérien validé en temps réel (05/06/07), sélecteur complet des 58 wilayas d'Algérie avec calcul automatique des frais, bloc Récapitulatif transparent (Produit, Couleur, 2 900 DA, Livraison, Total) et bouton d'action principal au pouce « أطلب الآن » sous-titré « الدفع عند الاستلام ».

### Critères d'acceptation

- [ ] La sélection Noir/Transparent met à jour le récapitulatif instantanément.
- [ ] La sélection de la wilaya met à jour automatiquement les frais de port et le total général en DA.
- [ ] Le numéro de téléphone rejette les formats incorrects avec un message d'erreur clair et bienveillant.
- [ ] Le récapitulatif affiche explicitement les 5 lignes requises avant le bouton final.
- [ ] Le bouton « أطلب الآن » est ergonomique pour le pouce sur mobile.

## Bloquée par

- Phase 1

---

## Phase 3 : Levée d'Objections (FAQ) & Rappel CTA

**User stories** : US-6

### Ce qu'on livre

Section FAQ en accordéon compact traitant les 6 questions prioritaires des parents (remplacement verres opticien, correction vue enfant, coloris, prix fixe 2 900 DA, couverture 58 wilayas, paiement à réception), suivie d'un second bouton d'action « أطلب الآن » remontant sans à-coup vers le formulaire.

### Critères d'acceptation

- [ ] 6 questions/réponses claires et concises.
- [ ] Les accordéons s'ouvrent/se ferment avec fluidité sans faire sauter la page.
- [ ] Le bouton CTA de rappel fait remonter l'utilisateur directement au formulaire avec focus prêt à commander.

## Bloquée par

- Phase 2

---

## Phase 4 : Connexion API Nord et Ouest Express, Thank You Page & Déclencheur Meta Pixel

**User stories** : US-7

### Ce qu'on livre

Mise en place du script Meta Pixel avec gestion des événements, création de l'endpoint serveur `/api/order` avec votre token Nord et Ouest Express pour la création automatisée du colis préexpédié, et page de confirmation (`merci.html`) qui affiche le numéro de suivi du colis et déclenche l'événement `Purchase` de Meta Pixel si et seulement si l'API a validé la commande.

### Critères d'acceptation

- [ ] L'envoi du formulaire affiche un état de chargement empêchant tout double clic.
- [ ] L'API Nord et Ouest Express reçoit la commande préexpédiée avec le montant COD exact.
- [ ] En cas de succès : redirection vers la page de remerciement, affichage du récapitulatif et déclenchement de `fbq('track', 'Purchase', { ... })`.
- [ ] En cas d'erreur de l'API transporteur : aucun `Purchase` n'est déclenché, le formulaire reste rempli et un message informe le client.

## Bloquée par

- Phase 2 & Phase 3
