# Living Ora - Web-Based Apartment Sales System

Living Ora is a web application for browsing apartments, managing unit bookings, publishing promotions, and tracking payments and installment schedules. It brings customer, sales agent, staff, and administrator workflows into a shared platform backed by MySQL.

Developed as a **Year 2, Semester 1 Software Engineering group project at SLIIT**.

## Features

- **Apartment and unit management:** View apartment developments, explore individual units, filter listings, and manage property details and availability.
- **Customer accounts and bookings:** Register, sign in, submit unit bookings with down-payment information, and view booking and payment details through the customer dashboard.
- **Booking administration:** Review bookings, update their status, and edit or cancel eligible bookings. Backend checks prevent changes to approved bookings and deletion of bookings with verified payments.
- **Promotions and special offers:** Create, edit, delete, and activate or deactivate promotions with discount percentages, promotion codes, validity dates, eligibility details, banner images, and apartment assignments.
- **Payment tracking:** Record payments and manage verification outcomes, including pending verification, verified, rejected, and failed statuses.
- **Installment schedules:** Generate schedules for bookings, manage installment items, confirm schedules, and retrieve schedule analytics.
- **External property listings:** Browse and manage resale listings through the external-apartment workflow.
- **User administration:** Manage internal staff accounts, update profiles, control account activation and verification, and inspect audit logs.
- **Role-specific dashboards:** Separate interfaces for customers, sales agents, internal staff, and administrators.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Backend | Java 17, Spring Boot, Spring MVC |
| Persistence | Spring Data JPA, Hibernate, MySQL |
| Frontend | HTML5, CSS3, JavaScript ES modules |
| Frontend tooling | Vite, Tailwind CSS, PostCSS |
| Build tooling | Gradle Kotlin DSL, Gradle Wrapper, npm |
| Validation and passwords | Jakarta Validation, BCrypt |
| Tests | JUnit, Mockito, MockMvc, H2, Node.js test runner |

The active frontend is the multi-page HTML application configured in `vite.config.js`. The repository also contains JSX and TSX source files under `src/`; the current Vite entry points use the HTML pages and `js/` modules.

## Architecture

The frontend communicates with the backend through REST endpoints. Controllers receive requests, services apply business rules, and repositories access MySQL through JPA.

Backend packages separate controllers, services, repositories, entities, request/response DTOs, mappers, configuration, utilities, and exception handling.

## Project Structure

```text
Living Ora Apartment Sales System/
├── Apartment Sales System Backend/
│   ├── src/main/java/com/apartment/apartmentsalessystembackend/
│   ├── src/main/resources/application.properties
│   ├── src/test/java/
│   ├── gradle/wrapper/
│   ├── build.gradle.kts
│   ├── gradlew
│   └── gradlew.bat
├── Apartment Sales System Frontend/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── public/
│   ├── src/
│   ├── tests/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── ApartmentSalesSystemDB.mwb
└── README.md
```

`ApartmentSalesSystemDB.mwb` is the MySQL Workbench database model. The application uses Hibernate to create or update mapped tables on startup.

## Running Locally

### Prerequisites

- JDK 17
- Node.js 18 or newer and npm
- A running MySQL server
- Internet access for downloading build dependencies

Open a terminal in the project root after cloning or downloading the repository.

### 1. Configure MySQL

The backend reads the following environment variables:

| Variable | Purpose |
| --- | --- |
| `DB_URL` | MySQL JDBC connection URL |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |

The default database name in `application.properties` is `apartment sales system`. To use it, configure the connection as follows in **Windows PowerShell**, replacing the username and password with your local credentials:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/apartment sales system?createDatabaseIfNotExist=true"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"
```

If your MySQL account cannot create databases, create the database first in MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS `apartment sales system`;
```

### 2. Start the Backend

In the same PowerShell terminal:

```powershell
cd "Apartment Sales System Backend"
.\gradlew.bat bootRun
```

On macOS or Linux, export the database variables in your shell and run:

```bash
cd "Apartment Sales System Backend"
chmod +x gradlew
./gradlew bootRun
```

The backend uses `http://localhost:8080`, with REST endpoints under `/api`.

### 3. Start the Frontend

Open a second terminal in the project root:

```bash
cd "Apartment Sales System Frontend"
npm install
npm run dev
```

Open **http://localhost:3000**. The frontend is configured to call `http://localhost:8080/api`.

### Demo Data and Accounts

`DataInitializer` runs at backend startup and populates sample apartments, units, promotions, listings, and user accounts. It also refreshes some demo account records, including the administrator password, on subsequent starts. Use a dedicated development database for this demo.

The seeded accounts use the password **`12345678`**.

| Role | Email |
| --- | --- |
| Administrator | `admin@livingora.lk` |
| Sales Manager | `sales.manager@livingora.lk` |
| Marketing Manager | `marketing.manager@livingora.lk` |
| Customer Relations Officer | `customer.relations@livingora.lk` |
| Finance & Payments Officer | `finance.payments@livingora.lk` |
| Property Development Manager | `property.development@livingora.lk` |
| Operations Director | `operations.director@livingora.lk` |
| Customer | `john@livingora.lk` |
| Sales Agent | `agent@livingora.lk` |

Use `internal-login.html` for internal staff and `auth.html` for customers and sales agents.

## REST API Areas

| Base path | Function |
| --- | --- |
| `/api/auth` | Login and external signup |
| `/api/apartments` | Apartment development records |
| `/api/units` | Individual apartment units |
| `/api/bookings` | Booking records and status updates |
| `/api/promotions` | Promotions and offer management |
| `/api/payments` | Payments and verification |
| `/api/schedules` | Installment schedules and analytics |
| `/api/external-apartments` | External property listings |
| `/api/users` | User and profile operations |
| `/api/admin` | Administration and audit logs |

See the controller classes for individual routes, request bodies, and required headers.

## Tests and Builds

From the backend directory on Windows:

```powershell
.\gradlew.bat test
.\gradlew.bat build
```

On macOS or Linux, use `./gradlew test` and `./gradlew build`.

Existing backend tests cover application context loading, booking CRUD rules, and internal-user validation and profile access. Context tests use an in-memory H2 database.

From the frontend directory:

```bash
node --test tests/booking-portal.test.js
npm run build
```

The frontend tests cover customer matching, booking API requests, and cached booking updates. Vite writes the frontend build to `dist/`.

## Local Configuration Notes

- Start MySQL and the backend before using features that retrieve or update records.
- The backend allows frontend origins `http://localhost:3000` and `http://localhost:5173`. If you change ports, update the API URLs and CORS configuration together.
- This repository is an academic development project with seeded demonstration data. Login and dashboard flows are implemented; API-wide token enforcement requires further work before production deployment.
