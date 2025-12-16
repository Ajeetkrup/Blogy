import React from 'react'

// Base skeleton component with shimmer effect
const SkeletonBase: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  )
}

// Text skeleton variants
export const TextSkeleton: React.FC<{ 
  lines?: number
  className?: string
  width?: string
}> = ({ lines = 1, className = '', width = 'full' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 ${i === lines - 1 ? `w-${width === 'full' ? 'full' : '3/4'}` : 'w-full'}`}
        />
      ))}
    </div>
  )
}

// BlogCard skeleton matching the BlogCard component structure
export const BlogCardSkeleton: React.FC = () => {
  return (
    <article className="group relative bg-white transition-all hover:bg-gray-50 sm:rounded-2xl sm:p-6 p-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 mb-3">
        <SkeletonBase className="w-6 h-6 rounded-full" />
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-1" />
        <SkeletonBase className="h-4 w-24" />
      </div>

      <div className="mb-2">
        <SkeletonBase className="h-7 w-3/4 mb-2" />
      </div>

      <div className="mb-4 space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-5/6" />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBase className="w-5 h-5 rounded" />
          <SkeletonBase className="w-5 h-5 rounded" />
        </div>
      </div>
    </article>
  )
}

// BlogPost skeleton for individual blog pages
export const BlogPostSkeleton: React.FC = () => {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4">
      {/* Title skeleton */}
      <div className="mb-8">
        <SkeletonBase className="h-12 w-3/4 mb-4" />
        <SkeletonBase className="h-4 w-1/2" />
      </div>

      {/* Content skeleton */}
      <div className="prose lg:prose-xl mx-auto space-y-4">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-5/6" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-4/5" />
        <div className="my-8">
          <SkeletonBase className="h-64 w-full rounded-lg" />
        </div>
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-3/4" />
      </div>

      {/* Sources section skeleton */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <SkeletonBase className="h-8 w-32 mb-4" />
        <div className="space-y-2">
          <SkeletonBase className="h-4 w-2/3" />
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-4 w-1/2" />
        </div>
      </div>
    </article>
  )
}

// Generic skeleton for forms/inputs
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// Spinner loader for small loading states
export const SpinnerLoader: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  )
}

const SkeletonComponents = {
  BlogCardSkeleton,
  BlogPostSkeleton,
  TextSkeleton,
  FormSkeleton,
  SpinnerLoader
}

export default SkeletonComponents
