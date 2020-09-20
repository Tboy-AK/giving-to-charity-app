# DATABASE MODELS

## Auth

- id
- email
- password
- userType
- created_at
- updated_at

## Admin

- id
- email
- firstName
- lastName
- created_at
- updated_at

## Subscriber

- id
- email
- sdgs
- categories
- ngos
- created_at
- updated_at

## Ngos

- id
- email
- companyName
- country
- state
- city
- zipCode
- address
- cacNumber
- sdg
- category: seems redundant
- needs
- created_at
- updated_at

## Events

- id
- eventName
- desc
- companyName
- country
- state
- city
- zipCode
- address
- sdg
- category
- needs
- created_at
- updated_at

## Needs

A member of the Ngos (needs) and Events (needs) model.

- id
- itemName
- quantityNeeded
- quantitySupplied
- created_at
- updated_at

## Donations

- id
- items
- companyName
- eventId
- country
- state
- city
- zipCode
- address
- email
- phone
- created_at
- updated_at

## DonationItems

A member of the Donations (items) model.

- id
- itemName
- quantity
- desc
- purpose
- created_at
- updated_at

## Testimonies

- id
- url
- created_at
- updated_at

## Blogs

- id
- title
- content
- url
- created_at
- updated_at

## BannerNeeds

- id
- title
- content
- img
- url
- created_at
- updated_at

## SDGs

- id
- name
- url
- created_at
- updated_at
