# ReachInbox Email Scheduler Backend

## Overview

ReachInbox is an authenticated email scheduling backend built with Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, BullMQ, Nodemailer and Slack.

## Features

- User registration
- User login
- Password hashing with bcrypt
- JWT authentication
- Protected APIs
- Campaign creation
- Campaign listing
- Campaign details
- Campaign update
- Campaign pause
- Campaign resume
- Campaign deletion
- SMTP sender management
- Single email scheduling
- Bulk email scheduling
- BullMQ delayed jobs
- Redis queue management
- Per-sender hourly rate limiting
- Email idempotency
- Retry handling
- Email status tracking
- Slack notifications
- Ethereal SMTP testing

## Requirements

- Node.js
- PostgreSQL
- Redis
- Docker
- npm

## Installation

```bash
npm install