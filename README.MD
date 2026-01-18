# FINALYZE

FINALYZE is a personal finance management web application that helps you plan, track, and analyze your finances with clarity.

## Live Demo:
👉 https://finalyze.alessiogiovannini.com

## Features

FINALYZE allows you to:

-   Plan expenses

-   One-time

-   Weekly

-   Monthly

-   Yearly

-   Track actual expenses

-   Generate forecasts

    -   Daily

    -   Weekly

    -   Monthly

    -   Yearly

-   Compare budget vs actuals

-   Generate financial reports to better understand spending habits

## Project Structure

The project is organized into multiple folders, each with a clear responsibility:
```
finalyze/
├── backend/
│   ├── Serverless Python backend
│   ├── AWS API Gateway + Lambda
│   ├── RDS database
│   ├── Secrets Manager
│   └── CDK stack for backend deployment
│
├── frontend/
│   ├── React application
│   ├── Authentication handling
│   └── Finance management UI
│
├── infra/
│   └── CDK stack to deploy the S3 bucket
│       used to host the frontend
│
└── .github/
    └── workflows/
        ├── deploy-backend.yml   # Deploys backend stack
        ├── deploy-frontend.yml  # Builds & deploys frontend
        └── deploy-infra.yml     # Deploys infrastructure (S3)
```
## Architecture Overview

-   Frontend

    - React (SPA)

    - Deployed to S3

    - Served via CloudFront

-   Backend

    - Python Lambdas

    - API Gateway (REST API)

    - JWT-based authentication

    - RDS for persistence

    - Fully deployed using AWS CDK

-   CI/CD

    -  GitHub Actions

    - Automated deployments for:

    - Backend

    - Frontend



## Authentication Notes

- Authentication currently uses JWT access & refresh tokens

- Tokens are sent via the Authorization header

- Cookie-based authentication was tested but reverted due to network issues on iOS browsers

- This approach prioritizes cross-platform stability (Desktop + Mobile)

## Disclaimer

FINALYZE is a demo project created for learning, experimentation, and portfolio purposes.

It is not intended for production use as-is.
Contributions, feedback, and improvements are very welcome!

## To Do / Roadmap

 - Revisit authentication using cookies once iOS compatibility is fully resolved

 - Replace RDS with DynamoDB to reduce costs

 - Improve reporting & visualizations

 - Add export functionality (CSV / PDF)

# Contact

Alessio Giovannini

📧 Email: alessiogiovannini23@gmail.com

🌐 Website: https://www.alessiogiovannini.com

