# Design System — Lunettes de Sport Enfants (< 12 ans)

## Product Context
- **Quoi** : Lunettes de protection sportive haute sécurité pour enfants, avec verres remplaçables chez l'opticien pour intégrer la correction optique de l'enfant.
- **Pour qui** : Parents algériens d'enfants de moins de 12 ans pratiquant le football, le vélo, le basket et les sports de contact.
- **Espace** : E-commerce direct monoproduit en Algérie (Cash on Delivery / COD).
- **Type** : Landing page marketing & formulaire de conversion express.
- **Memorable thing** : Des lunettes de sport conçues pour les enfants, avec des verres remplaçables chez n'importe quel opticien : l'enfant porte sa propre vue pendant son sport en toute sécurité.

## Aesthetic Direction
- **Direction** : Athletic-Optic Protection
- **Décoration** : Intentionnel (badges optiques & antichoc, hiérarchie claire, aucune fioriture)
- **Mood** : Sérieux, médical et rassurant pour les parents, dynamique et sportif pour les enfants.
- **Références** : Standards d'équipements sportifs juniors et optométrie pédiatrique.

## Typography
- **Display/Hero** : Cabinet Grotesk (ou Clash Grotesk) — Robuste, géométrique, sportive.
- **Body** : Plus Jakarta Sans — Rondeur moderne, très lisible sur smartphone pour les parents.
- **Data/Tables/Prix** : Plus Jakarta Sans avec `font-variant-numeric: tabular-nums` (affichages des montants en DA).
- **Code** : Sans objet.
- **Loading** : Google Fonts (`Cabinet Grotesk` & `Plus Jakarta Sans`).
- **Scale** : 12 / 14 / 16 / 18 / 22 / 28 / 34 / 42 px.

## Color
- **Approche** : Balanced
- **Primary** : `#1E3A8A` (Bleu Marine Athlétique — Confiance, santé, sécurité)
- **Secondary / CTA** : `#EA580C` (Orange Sport Énergie — Contraste maximal et déclencheur d'achat)
- **Optic Accent** : `#0284C7` (Bleu Azur Clair — Rappel de la clarté optique et des verres)
- **Neutrals** : Fond `#F8FAFC` → Surface `#FFFFFF` → Bordures `#E2E8F0` → Texte `#0F172A`
- **Semantic** : Succès `#16A34A`, Avertissement `#D97706`, Erreur `#DC2626`
- **Dark mode** : Désactivé (thème clair blanc & lumineux obligatoire pour inspirer propreté et sérieux médical).

## Spacing
- **Base** : 4px
- **Densité** : Confortable (optimisé pour les doigts sur écran tactile mobile : cibles tactiles minimum 48px).
- **Scale** : 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approche** : Grid-disciplined & Mobile-First
- **Grid** : 1 colonne mobile centrée (max 480px) s'étendant à conteneur 768px sur tablette/desktop.
- **Max content width** : 520px pour le tunnel d'achat mobile, 980px pour les sections de présentation.
- **Border radius** : sm: 6px, md: 10px, lg: 16px, full: 9999px

## Motion
- **Approche** : Minimal-fonctionnel
- **Easing** : ease-out (200ms) pour les sélections de couleurs et le défilement vers le formulaire.
- **Duration** : Micro (100ms pour tap feedback sur le bouton d'achat), Court (200ms pour accordéons et sélecteurs).

## Decisions Log
| Date | Décision | Rationale |
|------|----------|-----------|
| 2026-10-06 | Création initiale | /design — Identité visuelle axée sur la double promesse : sécurité sportive + verres remplaçables chez l'opticien. |
