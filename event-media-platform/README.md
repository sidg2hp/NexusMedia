# Event Media Platform 📸

A powerful, AI-driven event media management platform built with **Next.js 15**, **Prisma**, **Tailwind CSS**, and **AWS Services** (S3 and Rekognition).

This platform allows users to create events, upload media (photos and videos), and securely manage access. It leverages AWS AI services to automatically tag photos and provides a magical "Find Me" facial recognition feature to instantly pull up any photos you appear in.

## 🌟 Core Features

### 1. Event Management
- **Create & Manage**: Organizers can create public or private events.
- **Edit & Delete**: Seamlessly edit event details (name, description, date, category, visibility).
- **Sorting & Filtering**: Find events quickly by name, category, or date.

### 2. Media Upload & Optimization
- **Drag & Drop Upload**: Bulk upload media directly to AWS S3.
- **Client-Side Compression**: High-res images are automatically compressed in the browser before upload (saving massive cloud storage costs) using `browser-image-compression`.
- **Pre-signed URLs**: Secure, direct-to-S3 uploads without bottlenecking the Node.js server.

### 3. AI Facial Recognition & Tagging (AWS Rekognition)
- **Smart Image Tagging**: Every uploaded photo is scanned by AWS Rekognition to automatically generate searchable tags (e.g., mountains, crowd, sports).
- **Find Me (Facial Recognition)**: Upload a reference selfie, and the platform will instantly scan the database to find and compile a gallery of every photo you appear in across all events! 

### 4. Social Interactions & Notifications
- **Like, Comment, & Share**: Fully interactive media gallery.
- **Real-Time Notification Bell**: Receive notifications whenever someone likes or comments on your media.

### 5. Advanced Watermarking
- **Dynamic Overlays**: Clicking the "Download" button fetches the original image from S3, uses the `sharp` library to dynamically overlay a text watermark (Event Name & Role), and streams the secure download to the user.

### 6. Authentication & Roles
- Custom JWT-based authentication.
- Built-in Role enum (`ADMIN`, `PHOTOGRAPHER`, `CLUB_MEMBER`, `VIEWER`) for future access control expansions.

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Cloud Storage**: AWS S3
- **AI/ML**: AWS Rekognition
- **Image Processing**: Sharp (Server), Browser-Image-Compression (Client)

---

## 🚀 Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eventmedia"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-north-1" # Region for your S3 Bucket
AWS_S3_BUCKET_NAME="your-bucket-name"
```
*(Note: AWS Rekognition runs in `eu-central-1` as a workaround for regions that do not support it natively).*

### 2. AWS Setup
Your AWS IAM User requires the following policies:
- `AmazonS3FullAccess`
- `AmazonRekognitionFullAccess`

Your S3 Bucket must have a **Bucket Policy** granting `s3:GetObject` to `*` for public viewing.

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
