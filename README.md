# NexusMedia 📸

An AI-powered Media Management Platform built with **Next.js 15 (App Router)**, **Prisma**, **PostgreSQL**, **AWS S3**, and **AWS Rekognition**.

NexusMedia centralizes media organization, enables AI-powered photo discovery through facial recognition, supports real-time social interactions, and provides secure role-based access control for managing large media collections at scale.

---

## Overview

NexusMedia addresses the challenge of managing and discovering large volumes of photos by combining cloud-native infrastructure with AI-driven search and recognition capabilities.

### Key Benefits

* AI-powered personal photo discovery
* Automated image tagging and indexing
* Scalable cloud storage architecture
* Secure role-based access control
* Real-time social engagement features
* Dynamic watermark generation and media protection

---

## Features

### 🤖 AI-Powered Media Discovery

#### Find Me (Facial Recognition)

Users can upload a reference selfie, allowing AWS Rekognition to identify and compile all photos in which they appear across the platform.

#### Smart Image Tagging

Uploaded images are automatically analyzed and tagged using AI-generated labels such as:

* Crowd
* Sports
* Landscape
* Indoor
* Outdoor
* Nature

#### Global Search

Search media across the platform using:

* AI-generated tags
* Uploader name
* Collection or album name
* Date

---

### ☁️ Cloud-Native Architecture

#### Direct-to-S3 Uploads

Files are uploaded directly from the browser to AWS S3 using pre-signed URLs, eliminating unnecessary server load and improving scalability.

#### Cross-Region AI Processing

Media stored in S3 is streamed to AWS Rekognition services across supported regions, ensuring reliable AI processing regardless of regional service limitations.

---

### ⚡ Smart Compression & Delivery

#### Client-Side Image Compression

Images are compressed and resized in the browser using Web Workers and `browser-image-compression` before upload.

Benefits include:

* Reduced storage costs
* Faster uploads
* Lower bandwidth consumption
* Improved user experience

---

### 🔒 Dynamic Watermarking

#### Real-Time Watermark Generation

The `/api/media/watermark` endpoint uses `sharp` to dynamically generate watermarked images during download.

Each watermark can include:

* Collection or album name
* User role
* Access metadata

Watermarks are applied on-the-fly without modifying the original media asset.

---

### 🛡️ Access Control & Management

#### Management Dashboard

Authorized users can:

* Create collections
* Edit metadata
* Manage visibility settings
* Delete content

#### Visibility Controls

* Public access
* Private access

#### Role-Based Access Control (RBAC)

Supported roles:

* `ADMIN`
* `PHOTOGRAPHER`
* `CLUB_MEMBER`
* `VIEWER`

Permissions are enforced using JWT-based authentication and authorization.

---

### 💬 Social Features

#### Real-Time Notifications

Users receive notifications when others:

* Like their uploads
* Comment on content
* Interact with shared media

#### Engagement Tools

Built directly into the gallery experience:

* Likes
* Comments
* Sharing

---

## System Architecture

```mermaid
graph TD
    Client[Next.js Client UI] -->|Direct Upload| S3[(AWS S3 Bucket)]
    Client -->|API Requests| Server[Next.js API Routes]
    
    Server -->|Read/Write| DB[(PostgreSQL + Prisma)]
    Server -->|Generate Presigned URLs| S3
    
    Server -->|Byte Streams| Rekognition[AWS Rekognition]
    Rekognition -->|Detect Labels| Tags[AI Tags]
    Rekognition -->|IndexFaces| FaceCollection[(Face Collection)]
    
    Client -->|Download Request| WatermarkAPI[Watermark API]
    WatermarkAPI -->|Fetch Original| S3
    WatermarkAPI -->|Sharp processing| Client
```

---

## Database Schema

### User

```prisma
model User {
  id                 String    @id @default(cuid())
  name               String
  email              String    @unique
  password           String
  role               Role      @default(VIEWER)
  referenceSelfieUrl String?

  events             Event[]
  media              Media[]
  likes              Like[]
  comments           Comment[]
}
```

### Event

```prisma
model Event {
  id          String   @id @default(cuid())
  name        String
  description String?
  date        DateTime
  category    String?
  isPublic    Boolean  @default(true)

  organizerId String
  media       Media[]
}
```

### Media

```prisma
model Media {
  id           String        @id @default(cuid())
  url          String
  key          String
  type         String
  isPublic     Boolean       @default(true)

  uploadedById String
  eventId      String

  tags         TagsOnMedia[]
}
```

---

## API Documentation

| Method | Endpoint                  | Description                                    |
| ------ | ------------------------- | ---------------------------------------------- |
| POST   | `/api/auth/register`      | Register a new user                            |
| POST   | `/api/auth/login`         | Authenticate user and issue JWT cookie         |
| POST   | `/api/auth/selfie`        | Upload and index reference selfie              |
| GET    | `/api/events`             | Retrieve all events with filtering support     |
| POST   | `/api/events`             | Create a new event                             |
| PUT    | `/api/events/[id]`        | Update event details and visibility            |
| POST   | `/api/media/upload-url`   | Generate AWS S3 pre-signed upload URL          |
| POST   | `/api/media`              | Store media metadata and trigger AI processing |
| GET    | `/api/media/search-faces` | Find photos matching a user's reference selfie |
| GET    | `/api/media/watermark`    | Generate and stream watermarked media          |
| GET    | `/api/search`             | Global search across media and metadata        |

---

## Technology Stack

### Frontend

* Next.js 15 (App Router)
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL
* JWT Authentication

### Cloud & AI

* AWS S3
* AWS Rekognition
* Sharp
* Pre-Signed URLs

### Optimization

* Web Workers
* Browser Image Compression

---

## Getting Started

### 1. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexusmedia"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

> AWS Rekognition requests may be routed to supported regions based on service availability.

---

### 2. AWS Configuration

Your IAM user should have permissions for:

* Amazon S3
* Amazon Rekognition

Additionally:

* Configure S3 CORS for PUT requests
* Configure bucket policies according to your deployment requirements

---

### 3. Installation

```bash
npm install

npx prisma db push

npm run dev
```

---

### 4. Run the Application

Open:

```text
http://localhost:3000
```

The application will be available locally for development.

---

## Future Enhancements

* Video recognition and indexing
* AI-powered content recommendations
* Advanced analytics dashboard
* Multi-tenant organization support
* Mobile application support
* Real-time collaborative collections

---

## License

This project is licensed under the MIT License.
