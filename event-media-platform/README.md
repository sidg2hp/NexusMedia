# NexusMedia 📸 (formerly Event Media)

A highly scalable, AI-driven Event & Media Management Platform built with **Next.js 15 (App Router)**, **Prisma**, **AWS S3**, and **AWS Rekognition**. 

Designed to solve the problem of scattered club event photos by providing centralized organization, facial recognition-based personal discovery, real-time social interactions, and strict access control.

---

## 🌟 Hackathon Core Features Delivered

### 1. Advanced AI/ML Integration (AWS Rekognition)
- **"Find Me" Facial Recognition**: Users can upload a reference selfie. The system maps their facial vector and automatically compiles a personalized gallery of every photo they appear in across all events.
- **Smart Image Tagging**: Every uploaded photo is automatically scanned by AI to generate semantic tags (e.g., *mountain, crowd, sports*).
- **Global Search**: Search the entire platform's media by AI Tags, Uploader Name, Event Name, or Date.

### 2. Cloud Architecture (AWS S3 & Rekognition Cross-Region)
- **Direct-to-S3 Uploads**: Uses Pre-signed URLs for highly scalable, direct browser-to-cloud uploads, bypassing the Node server.
- **Cross-Region AI Execution**: Intelligently streams S3 object bytes to AWS Rekognition servers across regions to bypass strict AWS regional availability limitations.

### 3. Smart Media Compression & Delivery
- **Client-Side Compression**: Uses Web Workers and `browser-image-compression` to resize and compress heavy images on the user's device *before* upload, drastically reducing cloud storage costs and bandwidth.

### 4. Dynamic Watermarking System
- **Real-time Image Processing**: The `GET /api/media/watermark` endpoint uses `sharp` to dynamically overlay an SVG watermark containing the `Event Name` and `User Role` onto the S3 image buffer during the download stream.

### 5. Event Management & Security
- **Organizers Hub**: Create, edit, and delete events. Toggle visibility between Public and Private.
- **Role-Based Access Control**: JWT payload contains `Role` enums (`ADMIN`, `PHOTOGRAPHER`, `CLUB_MEMBER`, `VIEWER`) used to restrict access and uploads.

### 6. Social Networking
- **Real-Time Notification Bell**: Receive alerts when users comment or like your photos.
- **Full Social Suite**: Like, Comment, and Share features built directly into the Glassmorphic Gallery UI.

---

## 🏗️ Architecture Diagram

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

## 🗄️ Database Schema Overview

The database uses PostgreSQL managed by Prisma ORM. Key entities include:

- **User**: Stores authentication details, Role (`ADMIN`, `VIEWER`, etc.), and `referenceSelfieUrl` for facial recognition.
- **Event**: Contains event metadata (name, date, category, description) and links to the Organizer (User).
- **Media**: Represents a photo/video. Stores the S3 URL, `isPublic` flag, and relationships to `Event` and `User`.
- **Like / Comment / Favourite**: Join tables connecting Users to Media for social interactions.
- **Notification**: Stores real-time alerts for users (e.g., "Someone commented on your photo").
- **Tag & TagsOnMedia**: Many-to-many relationship mapping AI-generated AWS Rekognition labels to specific media files.

---

## 🚀 Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eventmedia"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-north-1" # Your S3 Bucket Region
AWS_S3_BUCKET_NAME="your-bucket-name"
```
*(AWS Rekognition automatically routes to `eu-central-1` to ensure availability).*

### 2. AWS Setup
Your AWS IAM User requires: `AmazonS3FullAccess` and `AmazonRekognitionFullAccess`.
Ensure your S3 bucket has a Public Read bucket policy and CORS configured for `PUT` requests.

### 3. Installation
```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start exploring NexusMedia!
