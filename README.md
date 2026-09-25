# The Study Desk

### SEN371 Software Engineering 371 — E-Commerce Web Application

**The Study Desk** is a stationery e-commerce web application developed as part of the SEN371 Software Engineering 371 project at Belgium Campus ITversity.

The platform provides customers with a convenient way to browse stationery products, view product information, add products to a shopping cart, complete checkout, and manage their orders. An administrative interface allows authorised administrators to manage products and orders.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Problem Statement](#problem-statement)
* [Objectives](#objectives)
* [Target Users](#target-users)
* [Core Features](#core-features)
* [Project Scope](#project-scope)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [Application Structure](#application-structure)
* [Database](#database)
* [Authentication and Security](#authentication-and-security)
* [API](#api)
* [Frontend](#frontend)
* [User Interface](#user-interface)
* [Admin Functionality](#admin-functionality)
* [Validation and Error Handling](#validation-and-error-handling)
* [Testing](#testing)
* [Version Control](#version-control)
* [Deployment](#deployment)
* [Production Configuration](#production-configuration)
* [Development Setup](#development-setup)
* [Environment Variables](#environment-variables)
* [Important Deployment Fixes](#important-deployment-fixes)
* [Project Milestones](#project-milestones)
* [Agile Development](#agile-development)
* [Design Principles](#design-principles)
* [Project Limitations](#project-limitations)
* [Future Improvements](#future-improvements)
* [Team](#team)
* [Acknowledgements](#acknowledgements)

---

# Project Overview

The Study Desk is an online stationery store designed to make purchasing stationery products easier and more convenient.

The application allows users to browse a catalogue of products such as:

* Pens
* Notebooks
* Art equipment
* Office supplies
* Other academic stationery

Customers can view product details, add items to their shopping cart, select a checkout method, place orders, and view their order history.

The system also provides administrative functionality for managing products and customer orders.

---

# Problem Statement

Students and other stationery users often need to physically visit stores to find the products they need. This can involve searching through different aisles, checking product availability, and travelling between different locations.

The Study Desk addresses this problem by providing an online platform where users can:

* Browse stationery products
* Search for products
* View product information
* Check product availability
* Add products to a shopping cart
* Complete checkout
* Place orders
* View previous orders

The goal is to provide a simple and accessible shopping experience through a clean web interface.

---

# Objectives

The main objectives of The Study Desk are to:

1. Provide an online stationery catalogue.
2. Allow customers to search and browse products.
3. Provide detailed product information.
4. Implement customer registration and authentication.
5. Implement role-based access for customers and administrators.
6. Provide shopping cart functionality.
7. Provide checkout and order functionality.
8. Allow customers to view their order history.
9. Allow administrators to manage products.
10. Allow administrators to manage customer orders.
11. Provide secure communication between the frontend and backend.
12. Store application data using MongoDB.
13. Provide a RESTful API.
14. Deploy the application to a cloud hosting environment.
15. Provide a responsive and accessible user interface.

---

# Target Users

## Customers

Customers can:

* Register an account
* Log in
* Browse products
* Search for products
* View product details
* Add products to their cart
* Review their cart
* Complete checkout
* Select a payment/checkout method
* Place orders
* View their order history

## Administrators

Administrators have additional privileges and can:

* Manage products
* Add products
* Update products
* Remove products
* Manage product information
* View customer orders
* Update order information/status

---

# Core Features

## Customer Features

### Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing using bcrypt
* Authenticated user sessions
* Role-based access

### Product Catalogue

* Product listing
* Product search
* Product categories
* Product details
* Product pricing
* Stock information
* Product images

### Shopping Cart

Customers can:

* Add products to their cart
* View cart contents
* Adjust quantities
* Remove products
* View calculated totals

### Checkout

The checkout process supports:

* Customer information
* Delivery information
* Payment/checkout selection
* Order summary
* Promotional-code interface
* Order confirmation

### Orders

Customers can:

* Place orders
* View order information
* View previous orders
* Track order status where supported by the application

---

# Project Scope

## Included

The project includes:

* Customer authentication
* Administrator authentication
* Role-based authorisation
* Product browsing
* Product search
* Product details
* Shopping cart
* Checkout
* Orders
* Order history
* Product management
* Order management
* REST API
* MongoDB database
* Input validation
* Error handling
* Responsive frontend
* Automated testing
* Git/GitHub version control
* Cloud deployment

## Excluded

The following features are outside the current project scope:

* Native mobile application
* International deliveries
* Advanced AI product recommendations
* Physical warehouse operations
* Enterprise-scale inventory integrations
* Custom payment-processing infrastructure
* Large-scale enterprise integrations

---

# Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* ES6+
* Responsive CSS
* VS Code
* Codicons for interface icons

## Backend

* Node.js
* Express.js
* JavaScript
* REST API
* JSON

## Database

* MongoDB
* MongoDB Atlas
* MongoDB Node.js Driver

## Authentication and Security

* JSON Web Tokens (JWT)
* bcrypt
* Role-based authorisation
* Environment variables
* Input validation
* Centralised error handling

## Development Tools

* Visual Studio Code
* Git
* GitHub
* MongoDB
* MongoDB Compass/Atlas where applicable
* Postman/API testing tools
* Jest
* Supertest

## Deployment

* Render
* MongoDB Atlas
* GitHub

---

# System Architecture

The application follows a layered architecture that separates different responsibilities within the backend.

```text
                    USER
                      |
                      v
              FRONTEND / UI
                      |
                      v
                 REST API
                      |
                      v
                  ROUTES
                      |
                      v
                CONTROLLERS
                      |
                      v
                  SERVICES
                      |
                      v
                REPOSITORIES
                      |
                      v
                  MONGODB
```

## Request Flow

A typical request follows this structure:

```text
Browser
   |
   | HTTP Request
   v
Express REST API
   |
   v
Route
   |
   v
Controller
   |
   v
Service
   |
   v
Repository
   |
   v
MongoDB
   |
   | Response
   v
Repository
   |
   v
Service
   |
   v
Controller
   |
   v
JSON Response
   |
   v
Frontend
```

This separation improves:

* Maintainability
* Testability
* Organisation
* Separation of concerns
* Reusability
* Error management

---

# Application Structure

The backend follows a layered structure similar to:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Database
```

### Routes

Routes define the available API endpoints and connect incoming HTTP requests to controllers.

### Controllers

Controllers receive requests, extract information, call the appropriate services, and return responses.

### Services

Services contain application/business logic.

### Repositories

Repositories handle communication with MongoDB.

### Database

MongoDB provides persistent storage for the application's data.

---

# Database

The application uses MongoDB as its NoSQL database.

The project was designed around collections representing major application entities.

The main data areas include:

* Users
* Addresses
* Categories
* Products
* Carts
* Orders
* Reviews

Conceptually:

```text
User
 |
 +---- Address
 |
 +---- Cart
 |
 +---- Orders
 |
 +---- Reviews

Category
 |
 +---- Products

Product
 |
 +---- Cart Items
 |
 +---- Order Items
 |
 +---- Reviews
```

MongoDB was selected because it provides a flexible document-based data model and integrates well with Node.js.

---

# Authentication and Security

The application uses JWT authentication.

## Registration

During registration:

```text
User
  |
  v
Registration Form
  |
  v
Validation
  |
  v
Password Hashing
  |
  v
MongoDB
```

Passwords are not stored as plain text. bcrypt is used to hash passwords before they are stored.

## Login

The login process follows:

```text
User Login
    |
    v
Validate Credentials
    |
    v
Compare Password Hash
    |
    v
Generate JWT
    |
    v
Return Token
```

The JWT is then used to authenticate protected API requests.

## Authorisation

Role-based access controls distinguish between:

```text
Customer
    |
    +-- Customer functionality

Administrator
    |
    +-- Customer functionality
    |
    +-- Product management
    |
    +-- Order management
```

Sensitive configuration such as JWT secrets is stored using environment variables rather than being hard-coded into the source code.

---

# API

The backend exposes REST API endpoints.

Major API areas include:

```text
/api/health
/api/auth
/api/categories
/api/products
/api/cart
/api/orders
/api/upload
```

The API uses HTTP methods such as:

* GET
* POST
* PUT/PATCH
* DELETE

depending on the operation.

Example:

```text
GET /api/products
```

returns product data from MongoDB.

The production frontend communicates with the backend through:

```text
/api
```

rather than directly referencing a localhost port.

---

# Frontend

The frontend is built using:

* HTML
* CSS
* JavaScript

The application uses reusable partials for common elements such as the header and footer.

Example structure:

```text
pages/
    home.html
    products.html
    product.html
    checkout.html
    about.html
    login.html
    admin.html

css/
    variables.css
    responsive.css
    home.css
    product.css
    checkout.css
    about.css
    ...

js/
    home.js
    product.js
    productlist.js
    script.js
    admin.js
    ...

partials/
    header
    footer
    script.js
```

The exact project structure may vary as development continues.

---

# User Interface

The application uses a clean stationery-store design based around:

* Navy
* White
* Gold
* Light neutral backgrounds

Core design variables include:

```css
--primary-navy
--primary-navy-hover
--accent-gold
--accent-gold-soft
--surface-card
--text-primary
--text-muted
--border-subtle
```

The interface uses reusable components and hover states to provide visual feedback.

Examples include:

```css
cursor: pointer;
```

for interactive controls and:

```css
:hover
```

states for buttons and interactive elements.

Product cards use hover effects to reveal the **Add to Tray** button.

The product-card interaction follows:

```text
Product Card
     |
     | Hover
     v
Add to Tray Button Appears
     |
     | Hover
     v
Gold Button State
     |
     | Click
     v
Product Added to Cart
```

---

# Responsive Design

The frontend includes responsive layouts for different screen sizes.

For example, the checkout layout changes from two columns to one column on smaller screens:

```css
@media (max-width: 900px) {
    .checkout-layout {
        grid-template-columns: 1fr;
    }
}
```

This allows the application to remain usable on smaller devices.

---

# Admin Functionality

The administrator area provides functionality for managing the application's catalogue and orders.

Administrators can manage:

### Products

* Create products
* View products
* Update products
* Delete products
* Manage stock
* Manage categories

### Orders

* View orders
* Review order information
* Manage order status

Administrative routes are protected using authentication and authorisation.

---

# Validation and Error Handling

The backend includes validation and centralised error handling.

Validation is used for areas such as:

* Required product information
* Product IDs
* Prices
* Stock quantities
* User information
* Order information
* Review ratings
* Authentication information

The application distinguishes between different types of errors, including:

* Bad requests
* Not found errors
* Authentication errors
* Authorisation errors
* Server errors

This prevents invalid requests from being processed incorrectly and provides clearer API responses.

---

# Testing

Testing forms part of the SEN371 project and includes multiple levels of testing.

## Unit Testing

Tests individual backend functions, services, helpers and validation logic.

Examples include:

```text
UT01 - Valid product validation
UT02 - Negative product price
UT03 - Invalid product ID
UT04 - Order total calculation
UT05 - Invalid review rating
UT06 - Missing required product field
```

## Function Testing

Tests specific application behaviours such as:

* Validation
* Calculations
* Business rules
* Error handling

## API Testing

Tests REST API endpoints including:

* Authentication
* Products
* Cart
* Orders
* Reviews

## Component Testing

Tests interactions between backend layers:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

## User Testing

Tests the application from the perspective of a real customer.

Examples include:

* Registering
* Logging in
* Searching for products
* Viewing products
* Adding products to the cart
* Checking out
* Placing an order

## Exploratory Testing

Exploratory testing is used to identify unexpected behaviour through unscripted interaction with the system.

## Regression Testing

Regression testing verifies that previously working functionality continues to work after changes and bug fixes.

## Test-Driven Development

The testing milestone also includes TDD evidence demonstrating:

```text
RED
 |
 | Write failing test
 v
FAIL
 |
 | Implement/fix functionality
 v
GREEN
 |
 v
PASS
```

---

# Version Control

Git and GitHub are used for source-code management.

The repository is hosted on GitHub.

The general workflow is:

```text
Create/modify code
       |
       v
Test locally
       |
       v
git status
       |
       v
git add .
       |
       v
git commit
       |
       v
git push
       |
       v
GitHub
       |
       v
Render deployment
```

Git provides:

* Version history
* Collaboration
* Branch management
* Change tracking
* Backup of source code
* Integration with deployment

---

# Deployment

The Study Desk has been deployed as a live web application using Render.

The production architecture is:

```text
                 GitHub
                    |
                    v
                 Render
                    |
          +---------+---------+
          |                   |
          v                   v
      Frontend             Express API
                              |
                              v
                         MongoDB Atlas
```

The production application uses the same Express server to serve the frontend and API.

The Express server includes static-file serving and routes requests to the appropriate API endpoints.

The application listens on the port provided by the hosting platform:

```javascript
process.env.PORT || 5000
```

The production Render environment provides its own port.

---

# Production Configuration

The deployed application uses environment variables for configuration.

The following variables are configured in the production environment:

```text
MONGO_URI
DB_NAME
JWT_SECRET
JWT_EXPIRES_IN
BCRYPT_SALT_ROUNDS
CLIENT_URL
```

Example:

```text
DB_NAME=thestudydesk
CLIENT_URL=https://the-study-desk.onrender.com
```

Secrets such as `JWT_SECRET` and `MONGO_URI` must not be committed to GitHub.

---

# Important Deployment Fixes

During deployment, several issues were identified and resolved.

## 1. Localhost API URLs

The frontend originally attempted to communicate with the backend using:

```text
http://hostname:5000/api
```

This worked locally but failed after deployment because the browser was attempting to connect to port `5000` on the production host.

The application was changed to use:

```javascript
export function getApiBaseUrl() {
    return '/api';
}
```

This allows the frontend and backend to communicate through the same deployed domain.

Production requests therefore look like:

```text
/api/products
/api/categories
/api/orders
```

instead of:

```text
http://localhost:5000/api/products
http://localhost:5000/api/categories
http://localhost:5000/api/orders
```

## 2. Missing JWT Secret

The first production deployment produced an authentication error because the JWT secret was not configured in Render.

The error was:

```text
Error: JWT_SECRET is not set.
Check your .env file.
```

The required `JWT_SECRET` environment variable was then added to Render.

After redeployment, authentication worked correctly.

## 3. MongoDB Connection

The production backend was configured to connect to MongoDB using:

```text
MONGO_URI
```

The production logs confirmed that the application successfully connected to:

```text
thestudydesk
```

## 4. Product API Verification

The production API was tested through:

```text
/api/products
```

The endpoint successfully returned product information from MongoDB.

---

# Production Architecture

The final production request flow is:

```text
Customer
   |
   v
The Study Desk Website
   |
   v
Frontend JavaScript
   |
   | /api/...
   v
Express REST API
   |
   v
Authentication / Validation
   |
   v
Controllers
   |
   v
Services
   |
   v
Repositories
   |
   v
MongoDB Atlas
```

---

# Development Setup

## Prerequisites

Install:

* Node.js
* npm
* Git
* MongoDB access
* Visual Studio Code

---

## Clone the Repository

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd E-commerce-Project
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

Example structure:

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=thestudydesk
JWT_SECRET=your_secret
JWT_EXPIRES_IN=your_expiry
BCRYPT_SALT_ROUNDS=your_salt_rounds
CLIENT_URL=http://localhost:5000
```

Do not commit the `.env` file.

---

## Start the Application

```bash
npm start
```

The application can then be accessed through the local server.

The development configuration may use:

```text
http://localhost:5000
```

---

# Environment Variables

| Variable             | Purpose                               |
| -------------------- | ------------------------------------- |
| `MONGO_URI`          | MongoDB connection string             |
| `DB_NAME`            | MongoDB database name                 |
| `JWT_SECRET`         | Secret used to sign JWT tokens        |
| `JWT_EXPIRES_IN`     | JWT expiration period                 |
| `BCRYPT_SALT_ROUNDS` | bcrypt password hashing configuration |
| `CLIENT_URL`         | Frontend/application URL              |

**Never place actual production secrets in this README.**

---

# Project Milestones

The project was developed through a series of SEN371 milestones.

## M1 — System Plan

The system plan covered:

* Requirements
* Software development lifecycle
* Architecture
* Design patterns
* Git/GitHub strategy
* Database schema
* Framework justification
* API design
* JWT authentication
* UI/UX
* Testing strategy
* Deployment strategy

---

## M2 — Backend Code Review

The backend milestone focused on:

* Architecture implementation
* Authentication and security
* Database integration
* Error handling

The backend established the foundation for:

```text
Routes
Controllers
Services
Repositories
MongoDB
```

---

## M3 — API Code Review

The API milestone focused on integrating the frontend with the backend through REST APIs.

Major areas included:

* API endpoints
* JSON requests/responses
* Authentication
* Products
* Cart
* Orders
* API validation
* Error responses

---

## M4 — Frontend Code Review

The frontend milestone focused on:

* High-fidelity UI implementation
* Responsive design
* Frontend functionality
* API integration
* User experience
* Navigation
* Product browsing
* Cart and checkout interfaces

---

## M5 — Testing Code Review

The testing milestone focused on:

* Test-Driven Development
* Unit testing
* Function testing
* API testing
* Component testing
* User testing
* Exploratory testing
* Regression testing
* Automated testing
* Coverage analysis
* Test reporting

---

## M6 — Presentation and Deployment

The final milestone focused on:

* Deployment
* Version control
* Live application availability
* Demonstration of application functionality
* Technical architecture
* Final presentation

---

# Agile Development

The project follows an Agile/Scrum development approach.

The project was divided into manageable milestones and development tasks.

The team worked collaboratively using GitHub for version control and integration.

The Agile approach allowed the team to:

* Develop functionality incrementally
* Test features throughout development
* Identify and fix issues
* Integrate frontend and backend functionality
* Respond to project requirements
* Prepare individual milestone deliverables

---

# Design Principles

The project applies several software engineering principles.

## Separation of Concerns

Different responsibilities are separated into different layers.

```text
Routes
Controllers
Services
Repositories
Database
```

This prevents application logic from becoming concentrated in one location.

## Single Responsibility

Components should focus on a specific responsibility.

For example:

* Routes handle routing.
* Controllers handle requests/responses.
* Services handle business logic.
* Repositories handle database interaction.

## DRY — Don't Repeat Yourself

Reusable functions and shared components reduce duplicated logic.

## Encapsulation

Internal implementation details are kept within their appropriate components.

## Maintainability

The layered structure allows individual components to be modified without unnecessarily affecting unrelated parts of the application.

---

# UI/UX Design

The Study Desk uses a clean, simple interface intended to make navigation straightforward.

The design uses:

```text
Navy
Gold
White
Light Grey
```

Interactive elements provide visual feedback through hover states.

For example:

```css
button:hover {
    background: var(--accent-gold);
}
```

Interactive buttons use:

```css
cursor: pointer;
```

The application also uses responsive layouts to support different screen sizes.

---

# Footer and Page Layout

Pages use a flex-based layout to ensure that short pages can keep the footer at the bottom of the viewport without using a fixed footer.

The general structure is:

```html
<body>
    <header></header>

    <main>
        Page Content
    </main>

    <footer></footer>
</body>
```

with:

```css
body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

main {
    flex: 1;
}
```

This allows:

* Short pages → footer remains at the bottom
* Long pages → footer naturally follows the content

---

# Current Production Status

The Study Desk application has been successfully deployed and tested in the production environment.

The production API successfully connects to MongoDB and returns product data.

Authentication was also tested after configuring the production JWT secret.

The frontend communicates with the backend using the production-relative API path:

```text
/api
```

The application is therefore no longer dependent on a local:

```text
:5000
```

API URL when running in production.

---

# Known Considerations

A MongoDB index warning was observed during deployment:

```text
An existing index has the same name as the requested index...
```

This warning did not prevent the application from connecting to MongoDB or serving the application.

The deployment itself completed successfully.

---

# Future Improvements

Potential future improvements include:

* More advanced product filtering
* Improved search functionality
* Additional payment integration
* Customer reviews
* Wishlist functionality
* Improved order tracking
* Email notifications
* Expanded admin analytics
* Improved inventory management
* More extensive automated test coverage
* Additional accessibility improvements
* More comprehensive production monitoring

These features are outside the current core project scope but could be considered in future versions.

---

# Team

### The Study Desk — SEN371

| Member                | Student     |
| --------------------- | ----------- |
| Daniel Greyling       | Team Member |
| Marylin Zhou          | Team Member |
| Ntokoto Martin Chauke | Team Member |

The team collaborated across the different development milestones, with final integration requiring contributions from the team.

---

# Project Workflow

The overall development workflow can be summarised as:

```text
Requirements
     |
     v
System Planning
     |
     v
Architecture & Database Design
     |
     v
Backend Development
     |
     v
REST API Development
     |
     v
Frontend Development
     |
     v
Frontend + API Integration
     |
     v
Testing
     |
     v
Bug Fixes
     |
     v
Production Configuration
     |
     v
Render Deployment
     |
     v
Final Verification
     |
     v
Presentation
```

---

# Technologies Summary

```text
Frontend
├── HTML5
├── CSS3
└── JavaScript / ES6+

Backend
├── Node.js
├── Express.js
└── REST API

Database
└── MongoDB / MongoDB Atlas

Security
├── JWT
└── bcrypt

Testing
├── Jest
└── Supertest

Version Control
└── Git / GitHub

Development
└── Visual Studio Code

Deployment
└── Render
```

---

# Conclusion

The Study Desk demonstrates the development of a complete e-commerce web application using a modern web development stack.

The project combines a responsive frontend with a Node.js/Express backend, RESTful APIs, MongoDB data storage, authentication and authorisation, automated testing, Git/GitHub version control, and cloud deployment.

The final system provides customers with a complete stationery-shopping workflow while providing administrators with tools to manage the catalogue and orders.

The project also demonstrates software engineering concepts covered throughout SEN371, including layered architecture, separation of concerns, REST APIs, authentication, database integration, testing, Agile development, version control, and deployment.

---

## Project Repository

The source code for The Study Desk is maintained in the project's GitHub repository.

## Production Deployment

The application is deployed using Render and uses MongoDB Atlas for production database storage.

**The Study Desk — Online Stationery E-Commerce Platform**

---

## Academic Project

**Module:** SEN371 — Software Engineering 371
**Institution:** Belgium Campus ITversity
**Project:** The Study Desk
**Year:** 2026
