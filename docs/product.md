# Product Brief

## Vision

Build a focused ecommerce platform for Japanese masks in India. The product should feel curated rather than marketplace-like, with enough domain context to support storytelling, discovery, and commerce.

## Target Users

- collectors and enthusiasts of Japanese culture
- anime, cosplay, and festival buyers
- decor buyers looking for distinctive wall pieces
- gift buyers looking for premium niche products

## Product Principles

- catalog-first before checkout-heavy
- culturally rich product detail, not generic SKU pages
- INR-native pricing and India-first shipping assumptions
- simple MVP scope with clean evolution toward scale

## MVP Scope

- browse mask catalog
- view product detail
- basic cart
- simple checkout simulation
- admin product management later

## Out of Scope for MVP

- full marketplace capabilities
- supplier workflows
- complex recommendation engine
- advanced search infrastructure
- multi-warehouse inventory

## Domain Notes

These are included because they affect the data model and UX:

- mask type matters as a taxonomy dimension
- material and craftsmanship matter for buyer trust
- cultural context matters for storytelling
- dimensions and display guidance matter for decor buyers
- India-specific pricing and shipping matter from day one

## Early Domain Model

Each product is expected to grow beyond generic ecommerce fields. Likely fields:

- `id`
- `slug`
- `title`
- `shortDescription`
- `longDescription`
- `priceInr`
- `inventory`
- `status`
- `images`
- `material`
- `maskType`
- `originRegion`
- `dimensions`
- `careInstructions`
- `culturalContext`
- `featured`
