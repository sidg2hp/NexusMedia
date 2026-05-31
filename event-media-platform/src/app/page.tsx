import Link from 'next/link';
import { ArrowRightIcon, PhotoIcon, ViewfinderCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in">
      <div className="glass-card p-12 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white tracking-tight">
          Capture. Organize. <span className="text-gradient">Experience.</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
          The centralized Event & Media Management Platform. Effortlessly organize event media, tag friends using AI, and manage access like never before.
        </p>
        
        <div className="flex gap-4 mb-16">
          <Link href="/events" className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-2">
            Explore Events <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link href="/upload" className="px-8 py-4 glass text-white hover:bg-white/10 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center gap-2">
            Upload Media <CloudArrowUpIcon className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 text-accent">
              <PhotoIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Organization</h3>
            <p className="text-gray-400">Event-wise albums with AI-powered tagging and search.</p>
          </div>
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 delay-100">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary">
              <ViewfinderCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Facial Recognition</h3>
            <p className="text-gray-400">Upload a selfie and find all photos you're featured in instantly.</p>
          </div>
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 delay-200">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <CloudArrowUpIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cloud Storage</h3>
            <p className="text-gray-400">Secure, scalable, and optimized media storage powered by AWS S3.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
