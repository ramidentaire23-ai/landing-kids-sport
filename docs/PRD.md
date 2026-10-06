# PRD - Lunettes de Sport Enfants (< 12 ans)

## Problème

Les parents d'enfants sportifs (football, basket, arts martiaux, vélo, course) craignent constamment les blessures oculaires et la casse fréquente des lunettes de vue traditionnelles pendant l'effort physique. Les montures ordinaires glissent, se brisent facilement sous l'impact et n'offrent pas une protection antichoc adaptée, privant les enfants d'une pratique sportive sereine et sécurisée.

## Solution

Une landing page épurée, persuasive, ultra-rapide et mobile-first permettant aux parents en Algérie de commander en un clic des lunettes de sport de haute qualité, authentiques et spécialement calibrées pour les enfants de moins de 12 ans. Particularité majeure : les verres sont remplaçables chez n'importe quel opticien habituel pour adapter la correction de l'enfant. L'acheteur sélectionne sa couleur (Noir ou Transparent), renseigne ses coordonnées de livraison, visualise le récapitulatif transparent et valide sa commande avec paiement à la réception (Cash on Delivery).

## Utilisateur cible

Parents algériens (pères ou mères) d'enfants âgés de moins de 12 ans pratiquant des activités sportives régulières, naviguant sur mobile via les publicités Meta (Facebook et Instagram), cherchant une solution de confiance pour protéger les yeux de leur enfant tout en maintenant sa correction visuelle.

## User Stories

- **US-1** : En tant que parent visiteur, je veux visualiser immédiatement la promesse centrale (Protection antichoc + Enfant < 12 ans + Verres remplaçables chez l'opticien avec sa propre vue), afin de comprendre l'utilité du produit en moins de 3 secondes.
- **US-2** : En tant que parent acheteur, je veux choisir la couleur des lunettes (Noir Sport ou Transparent) avec mise à jour visuelle instantanée au prix fixe de 2 900 DA par unité, afin de personnaliser mon choix sans hésitation.
- **US-3** : En tant que client, je veux remplir un formulaire de commande sans friction (Nom complet, Téléphone algérien vérifié en temps réel, Wilaya parmi les 58, Commune, Adresse), sans créer de compte ni passer par un panier multi-étapes.
- **US-4** : En tant que client, je veux voir un récapitulatif clair avant de confirmer (Produit, Couleur choisie, Prix 2 900 DA, Frais de livraison selon la wilaya, Total net à payer en DA), afin d'avoir une transparence totale sur le montant à régler à la livraison.
- **US-5** : En tant que client prêt à commander, je veux cliquer sur un bouton d'action principal bien visible au pouce portant l'appel à l'action arabe naturel « أطلب الآن » (avec sous-titre rassurant sur le paiement à la livraison).
- **US-6** : En tant que parent ayant des doutes, je veux consulter une section FAQ concise (5 à 6 questions sur le remplacement des verres chez l'opticien, la correction, les couleurs, le prix fixe, les 58 wilayas et le paiement COD) suivie d'un rappel direct du bouton « أطلب الآن » qui remonte au formulaire sans scroll fastidieux.
- **US-7** : En tant que client validant sa commande, je veux être redirigé vers une page de confirmation détaillée récapitulant ma commande et le numéro de suivi, avec déclenchement automatique du pixel de conversion.

## Critères de succès

- Transmission instantanée et 100% automatisée de la commande vers l'API Nord et Ouest Express en statut préexpédié dès validation du formulaire (zéro intervention manuelle).
- Déclenchement de l'événement Meta Pixel `Purchase` conditionné exclusivement au retour de succès (HTTP 200/201 avec identifiant de colis) de l'API de livraison.
- Blocage strict de l'événement `Purchase` en cas d'échec ou d'erreur technique lors de la création du colis chez le transporteur, avec message d'erreur clair et maintien des champs déjà saisis par l'utilisateur.
- Expérience 100% Mobile-first : cibles tactiles larges, temps de chargement ultra-court, aucune distraction superflue.
- Taux de complétion et de conversion maximal grâce à la clarté du récapitulatif et la validation téléphone temps réel.

## Hors périmètre

- Paiement en ligne par carte bancaire (CIB / Edahabia) : uniquement paiement à la livraison (Cash on Delivery).
- Système de panier multi-produits complexe : commande directe monoproduit.
- Espace compte client ou authentification par mot de passe.
- Tailles supérieures à 12 ans (le produit est strictement calibré pour les enfants de moins de 12 ans).
- Menu de navigation lourd ou liens externes distrayants : navigation en entonnoir fermée axée sur l'achat.

## Décisions d'implémentation

- Navigation monopage fluide avec bouton d'action principal ancré qui fait défiler l'écran directement vers le formulaire de commande express.
- Formulaire affichant la sélection visuelle des coloris (Noir Sport et Transparent) avec boutons d'options larges.
- Menu déroulant des 58 wilayas d'Algérie avec calcul dynamique des frais de livraison et mise à jour instantanée du total.
- Validation instantanée du numéro de téléphone algérien (10 chiffres commençant par 05, 06 ou 07) avec message d'erreur clair en temps réel.
- Bloc Récapitulatif pré-commande affichant distinctement : Produit, Couleur sélectionnée, Prix (2 900 DA), Livraison (DA), Total à payer (DA).
- Bouton CTA principal : Texte arabe naturel « أطلب الآن » sous-titré « الدفع عند الاستلام » (Paiement à la livraison), taille tactile optimisée pour le pouce.
- Section FAQ de 5 à 6 questions accordéon traitant les objections clés des parents (opticien, vue, âge, livraison, paiement) suivie du rappel CTA.
- Bouton de validation de commande avec indicateur de chargement ("Création de votre colis en cours...") empêchant les doubles envois.

## Notes complémentaires

- Dépendance critique : disponibilité et temps de réponse de l'API Nord et Ouest Express.
- Clés et identifiants : Meta Pixel ID configuré, endpoints d'expédition Nord et Ouest Express connectés.
