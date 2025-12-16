"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, logout } = useAuthStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        try {
            await logout();
            router.push('/signin');
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect even if logout fails
        router.push('/signin');
        }
    };

    return (
        <motion.nav
            className={`fixed top-0 w-full z-50 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg border-gray-200/50' : 'bg-white/50 backdrop-blur-sm border-transparent'}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2 group">
                            <motion.div
                                className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center"
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="text-white font-serif font-bold text-xl">B</span>
                            </motion.div>
                            <motion.span
                                className="font-serif text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                                animate={{
                                    backgroundPosition: ['0%', '100%', '0%'],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                style={{
                                    backgroundSize: '200%',
                                }}
                            >
                                Blogy
                            </motion.span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href="/blog/create"
                                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-transparent hover:border-blue-200"
                            >
                                <motion.svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </motion.svg>
                                <span className="font-medium">Write</span>
                            </Link>
                        </motion.div>
                        )}
                        {isAuthenticated && (
                        <div className="relative" ref={dropdownRef}>
                            <motion.button
                                onClick={handleToggleDropdown}
                                className="flex items-center gap-2 focus:outline-none"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px]"
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                </motion.div>
                            </motion.button>
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 border border-gray-200 z-50"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Link
                                                href="/my-blogs"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors"
                                            >
                                                My Blogs
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 }}
                                        >
                                            <Link
                                                href="/analytics"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors"
                                            >
                                                Analytics
                                            </Link>
                                        </motion.div>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                Sign out
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        )}
                        {!isAuthenticated && (
                            <div className="flex items-center gap-3">
                                <Link href="/signin">
                                    <motion.button
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Sign In
                                    </motion.button>
                                </Link>
                                <Link href="/signup">
                                    <motion.button
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg font-medium transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Sign Up
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
