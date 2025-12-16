import { NextRequest, NextResponse } from 'next/server'

// Known AI bot user-agent patterns
const AI_BOT_PATTERNS = [
    /GPTBot/i,
    /ChatGPT-User/i,
    /ClaudeBot/i,
    /anthropic-ai/i,
    /Google-Extended/i,
    /PerplexityBot/i,
    /CCBot/i,
    /Amazonbot/i,
    /cohere-ai/i,
    /ai-crawler/i,
    /ai-bot/i,
    // Generic patterns that might indicate AI scraping
    /bot.*ai/i,
    /crawler.*ai/i,
]

// Check if user agent matches any AI bot pattern
function isAIBot(userAgent: string): boolean {
    return AI_BOT_PATTERNS.some(pattern => pattern.test(userAgent))
}

// Public routes that don't require authentication
const publicRoutes = [
    '/',
    '/signin',
    '/signup',
    '/verify-email',
]

// Protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/my-blogs',
    '/analytics',
    '/blog/create',
    '/blog/edit',
]

// Check if a route is public
function isPublicRoute(pathname: string): boolean {
    // Allow blog/[slug] routes (read blog) - these are public
    if (pathname.startsWith('/blog/') && !pathname.startsWith('/blog/create') && !pathname.startsWith('/blog/edit')) {
        return true
    }
    return publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
}

// Check if a route is protected
function isProtectedRoute(pathname: string): boolean {
    return protectedRoutes.some(route => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    
    // Block AI bots from accessing blog content (except public routes)
    if (!isPublicRoute(pathname) && isAIBot(userAgent)) {
        console.warn(`Blocked AI bot access: ${userAgent} - ${request.url}`)
        return NextResponse.json(
            { 
                error: 'Automated access detected',
                message: 'AI crawlers are not permitted to access this content'
            },
            { status: 403 }
        )
    }
    
    // Check for access token in HTTP-only cookie
    // HTTP-only cookies are readable by server-side middleware
    const accessToken = request.cookies.get('access_token')?.value
    
    // If accessing a protected route without access token cookie, redirect to signin with redirect parameter
    // Note: Client-side AuthGuard will also handle this, but this provides server-side protection
    if (isProtectedRoute(pathname) && !accessToken) {
        const signInUrl = new URL('/signin', request.url)
        signInUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(signInUrl)
    }
    
    // If directly accessing signin page, validate and clean redirect parameter
    // Only allow redirect parameter if it's a valid protected route
    if (pathname === '/signin') {
        const redirectParam = request.nextUrl.searchParams.get('redirect')
        
        // If redirect parameter exists but is not a valid protected route, remove it
        if (redirectParam && !isProtectedRoute(redirectParam)) {
            const cleanUrl = new URL('/signin', request.url)
            return NextResponse.redirect(cleanUrl)
        }
        
        // If redirect is default dashboard, check if user came from a protected route
        // If not, remove the redirect parameter to keep URL clean
        if (redirectParam === '/dashboard') {
            try {
                // Check referer to see if user came from a protected route
                const refererPath = referer ? new URL(referer).pathname : null
                const cameFromProtectedRoute = refererPath && isProtectedRoute(refererPath)
                
                // If didn't come from protected route, remove redirect parameter
                if (!cameFromProtectedRoute) {
                    const cleanUrl = new URL('/signin', request.url)
                    return NextResponse.redirect(cleanUrl)
                }
            } catch (e) {
                // If referer URL parsing fails, assume direct access and remove redirect
                const cleanUrl = new URL('/signin', request.url)
                return NextResponse.redirect(cleanUrl)
            }
        }
    }
    
    // If authenticated user (has access token cookie) tries to access auth pages, redirect to dashboard
    if (accessToken && (pathname === '/signin' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return NextResponse.next()
}

// Apply middleware to all routes except static files and API routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
