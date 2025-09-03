"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fadeIn, fadeInUp } from "./fadeMotion";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
	const pathname = usePathname();
	const active = pathname === href;
	return (
		<Link href={href} className={`px-3 py-2 rounded text-sm md:text-base font-medium transition ${active ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`}>
			{children}
		</Link>
	);
}

function MobileMenu() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	// prevent background scrolling when menu is open
	useEffect(() => {
		if (open) {
			const prev = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => { document.body.style.overflow = prev; };
		}
	}, [open]);

	return (
		<div className="md:hidden">
			<button
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onClick={() => setOpen(v => !v)}
				className="p-2 rounded text-white hover:text-yellow-400"
			>
				{!open ? (
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
						<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				) : (
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
						<path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
			</button>

			{/* full-screen fixed overlay so menu never gets clipped by parent containers */}
			{open && (
				<div className="fixed inset-0 z-[9999] bg-black/95 text-white flex flex-col items-stretch">
					<div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-yellow-400">
						<div />
						<button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded bg-black/0 border-2 border-yellow-400 text-white">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					</div>
					<nav style={{paddingTop: 'env(safe-area-inset-top, 16px)'}} className="flex-grow flex flex-col justify-center gap-2 overflow-auto">
						<Link href="/about" onClick={() => setOpen(false)} className={`block text-center px-6 py-4 text-2xl font-menu ${pathname === '/about' ? 'bg-yellow-400 text-black' : 'text-white hover:text-yellow-400'}`}>
							About
						</Link>
						<Link href="/contact" onClick={() => setOpen(false)} className={`block text-center px-6 py-4 text-2xl font-menu ${pathname === '/contact' ? 'bg-yellow-400 text-black' : 'text-white hover:text-yellow-400'}`}>
							Maralis Solutions
						</Link>
						<Link href="/shop" onClick={() => setOpen(false)} className={`block text-center px-6 py-4 text-2xl font-menu ${pathname === '/shop' ? 'bg-yellow-400 text-black' : 'text-white hover:text-yellow-400'}`}>
							Shop
						</Link>
					</nav>
				</div>
			)}
		</div>
	);
}

// Simple global slot manager for limiting concurrently mounted iframes
const MAX_IFRAMES = 2;
const activeIframes = new Set<string>();
const iframeOrder: string[] = [];

function tryAcquireSlot(id: string) {
	if (activeIframes.has(id)) return true;
	if (activeIframes.size < MAX_IFRAMES) {
		activeIframes.add(id);
		iframeOrder.push(id);
		return true;
	}
	return false;
}

function evictOldest() {
	const evicted = iframeOrder.shift();
	if (evicted) {
		activeIframes.delete(evicted);
		window.dispatchEvent(new CustomEvent('iframe-evict', { detail: { id: evicted } }));
		window.dispatchEvent(new CustomEvent('iframe-slot-freed'));
		return evicted;
	}
	return null;
}

function releaseSlot(id: string) {
	if (activeIframes.has(id)) {
		activeIframes.delete(id);
		const idx = iframeOrder.indexOf(id);
		if (idx >= 0) iframeOrder.splice(idx, 1);
		window.dispatchEvent(new CustomEvent('iframe-slot-freed'));
	}
}

function YouTubePreview({ id, title, className }: { id: string; title?: string; className?: string }) {
	const [active, setActive] = useState(false);
	const [clicked, setClicked] = useState(false);
	const [pending, setPending] = useState(false);
	const [mounted, setMounted] = useState(false);
	const ref = useRef<HTMLDivElement | null>(null);

	// When the preview enters the viewport, auto-load the iframe (without autoplay)
	// and warm the thumbnail + preconnect. Clicking explicitly enables autoplay.
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		let obs: IntersectionObserver | null = null;

		const onSlotFreed = () => {
			if (pending) {
				const ok = tryAcquireSlot(id);
				if (ok) {
					setPending(false);
					setActive(true);
				}
			}
		};

		const onEvict = (e: Event) => {
			const detail = (e as CustomEvent).detail as { id: string } | undefined;
			if (detail?.id === id) {
				// our id was evicted
				setActive(false);
			}
		};

		window.addEventListener('iframe-slot-freed', onSlotFreed);
		window.addEventListener('iframe-evict', onEvict as EventListener);

		if ('IntersectionObserver' in window) {
			obs = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// warm the thumbnail in browser cache
						const img = document.createElement('img');
						img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
						// preconnect to youtube to speed up iframe load later
						try {
							const link = document.createElement('link');
							link.rel = 'preconnect';
							link.href = 'https://www.youtube.com';
							link.crossOrigin = '';
							document.head.appendChild(link);
						} catch (e) {}

						// attempt to acquire slot and render iframe (no autoplay)
						const ok = tryAcquireSlot(id);
						if (ok) {
							setActive(true);
							setPending(false);
						} else {
							// no slot available yet; mark pending and wait
							setPending(true);
						}

						// if we acquired or became pending, keep observing so we can free later if needed
					} else {
						// if the element leaves viewport and was auto-loaded (not clicked), release its slot
						if (active && !clicked) {
							// release slot for this id
							releaseSlot(id);
							setActive(false);
						}
					}
				});
			}, { rootMargin: '300px' });
			obs.observe(node);
		}
		return () => {
			if (obs) obs.disconnect();
			window.removeEventListener('iframe-slot-freed', onSlotFreed);
			window.removeEventListener('iframe-evict', onEvict as EventListener);
			// clean up slot if we were holding one
			releaseSlot(id);
		};
	}, [id, active, clicked, pending]);

	// if active is true we render the iframe; autoplay only when user explicitly clicked
	useEffect(() => {
		if (active) {
			// small delay to allow mount and then animate opacity
			const t = setTimeout(() => setMounted(true), 20);
			return () => clearTimeout(t);
		} else {
			setMounted(false);
		}
	}, [active]);

	if (active) {
		const src = `https://www.youtube.com/embed/${id}?autoplay=${clicked ? 1 : 0}`;
		return (
			<iframe
				width="100%"
				height="100%"
				src={src}
				title={title || 'YouTube video'}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen
				className={`${className || ''} w-full h-full rounded-2xl bg-black transition-opacity duration-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}
			/>
		);
	}

	const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
	return (
		<div ref={ref} className={`w-full h-full bg-black rounded-2xl overflow-hidden ${className || ''}`}>
			<button
				aria-label={`Play video: ${title || id}`}
				aria-pressed={clicked}
				onClick={() => {
					// if no slot available, evict oldest so user intent takes priority
					if (!tryAcquireSlot(id)) {
						evictOldest();
						tryAcquireSlot(id);
					}
					setClicked(true);
					setActive(true);
					setPending(false);
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						(e.target as HTMLElement).click();
					}
				}}
				className="w-full h-full relative flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-black"
			>
				<img src={thumb} alt={title || 'Video thumbnail'} className="w-full h-full object-cover" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center shadow-lg">
						<svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>
					</div>
				</div>
			</button>
		</div>
	);
}

export default function Home() {
		const [smallName, setSmallName] = useState('');
		const router = useRouter();

	return (
<>
{/* HEADER / NAVIGATION */}
<header className="bg-black text-white sticky top-0 z-50 shadow">
<div className="bg-amber-500 text-black text-sm md:text-base py-1 px-2 text-center font-semibold tracking-wide">
	<a href="/quantum" className="block w-full hover:underline">
		<span className="inline-flex items-center justify-center gap-2 w-full">
			<span className="truncate whitespace-nowrap max-w-[95%]">Discount offer on Quantum Machine – Hospital in the home!</span>
			<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
			</svg>
		</span>
	</a>
</div>
	<nav className="flex items-center justify-between px-4 py-3 md:px-8">
		<div className="flex items-center gap-3">
					<Link href="/" className="flex items-center gap-2">
						<Image src="/logo.svg" alt="CoachAmara logo" width={36} height={36} priority />
						<span className="text-2xl font-extrabold tracking-tight text-yellow-400 hover:text-yellow-300 transition">CoachAmara</span>
					</Link>
		</div>
		<div className="hidden md:flex items-center gap-4 md:gap-6">
			<NavLink href="/about"><span className="font-menu">About</span></NavLink>
			<NavLink href="/contact"><span className="font-menu">Maralis Solutions</span></NavLink>
			<NavLink href="/shop"><span className="font-menu">Shop</span></NavLink>
		</div>
		{/* Mobile hamburger */}
		<MobileMenu />
	</nav>
</header>

<main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black">
{/* HERO SECTION */}
<motion.section
className="w-full flex flex-col items-center justify-center py-16 md:py-28 px-2 md:px-4 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
{/* Soft overlay and energy effect */}
<div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
<div className="w-full h-full bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-500/10" />
{/* Geometric patterns */}
<div className="absolute top-10 left-10 w-16 h-16 md:w-32 md:h-32 border border-yellow-400/20 rotate-45"></div>
<div className="absolute bottom-20 right-10 w-12 h-12 md:w-24 md:h-24 border border-yellow-400/30 rotate-12"></div>
<div className="absolute top-1/2 left-1/4 w-8 h-8 md:w-16 md:h-16 border border-yellow-400/25 rotate-90"></div>
</div>
<div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight font-playfair drop-shadow-2xl">
<span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent block">Discover the Energy Breakthrough</span>
<span className="text-white block mt-2">That's Transforming Lives</span>
</h1>
<p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-8 md:mb-10 text-gray-200 max-w-2xl mx-auto px-2">
For thousands worldwide, <span className="text-yellow-400 font-bold">Energy</span> has been the turning point — restoring vitality, promoting healing, and empowering people to live healthier, stronger, and more fulfilled lives.
</p>
{/* Video Embed */}
<div id="explainer-video" className="w-full max-w-3xl mx-auto aspect-video bg-black rounded-2xl md:rounded-3xl flex items-center justify-center text-gray-500 text-sm md:text-lg font-semibold mb-6 md:mb-8 overflow-hidden shadow-2xl border-2 md:border-4 border-yellow-400/50">
	<YouTubePreview id="vkG_plov8Ao" title="Energy Explainer Video" className="w-full h-full rounded-2xl md:rounded-3xl" />
</div>
<a
href="/join"
className="inline-block px-6 py-3 md:px-10 md:py-5 rounded-full text-base md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-2xl hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 mb-2 drop-shadow-lg max-w-xs md:max-w-none text-center"
>
Join the Community
</a>
</div>
</motion.section>

{/* SECTION 2: WHAT IS ENERGY */}
<motion.section
className="w-full py-16 px-4 bg-gray-50 flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
{/* Left: Text Content */}
<div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
<h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair text-black">What Is Energy?</h2>
<div className="w-16 h-1 bg-yellow-400 mb-6"></div>
<p className="text-lg md:text-xl font-bold mb-6 text-gray-800">
Energy is more than a buzzword — it's a practical tool that has helped people:
</p>
<ul className="list-none text-left text-lg font-bold mb-8 text-gray-800 space-y-3">
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">⚡</span> Boost immunity naturally</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">🔄</span> Accelerate recovery and healing</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">⚖️</span> Balance mind, body, and spirit</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">✨</span> Live with sustained energy and clarity</li>
</ul>
</div>
{/* Right: Image */}
<div className="w-full h-full flex items-stretch">
<Image
src="/quantum-energy.jpg"
alt="Energy Illustration"
className="w-full h-full object-cover rounded-none border-4 border-yellow-400"
style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
width={800}
height={600}
priority
/>
</div>
</div>
</motion.section>

{/* SECTION 3: PROOF OF TRANSFORMATION */}
<motion.section
className="w-full py-20 px-4 bg-white flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair text-center drop-shadow">Proof of Transformation</h2>
<div className="w-20 h-1 bg-yellow-400 mb-8"></div>
<p className="text-lg md:text-xl font-semibold mb-8 max-w-2xl text-center text-gray-700">
Over 1,000+ people have already embraced Energy tools and the transformation is undeniable. Here are just a few of their stories:
</p>
<ul className="list-none text-left text-lg font-bold mb-10 max-w-xl mx-auto text-gray-800 space-y-2">
<li className="flex items-center"><span className="mr-3 text-yellow-500">🏥</span> Reduced hospital visits (&quot;a hospital in the home&quot;)</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500">🎯</span> Greater focus and productivity</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500">💪</span> Enhanced wellness without dependency on drugs</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500">❤️</span> Improved intimacy &amp; vitality (through Energy Boxers)</li>
</ul>
<div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 mb-12">
<motion.div
className="flex-1 bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border-l-4 border-yellow-400 hover:shadow-yellow-400/30 transition-shadow duration-200"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeInUp}
>
<h3 className="font-bold text-2xl mb-4 text-yellow-400">&quot;A Hospital in the Home&quot;</h3>
<p className="text-base text-gray-300 font-semibold mb-4 italic leading-relaxed">&quot;Before discovering Energy, my family was constantly in and out of hospitals. Since we started using the tools, our home feels like a sanctuary of health. My son&apos;s asthma attacks have reduced dramatically, and my own energy levels are the best they&apos;ve been in years. I truly believe every home should have access to this breakthrough.&quot;</p>
<div className="mt-auto flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">J</span>
<span className="font-bold text-white">Janet O., Lagos</span>
</div>
</motion.div>
<motion.div
className="flex-1 bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border-l-4 border-yellow-400 hover:shadow-yellow-400/30 transition-shadow duration-200"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeInUp}
>
<h3 className="font-bold text-2xl mb-4 text-yellow-400">&quot;Productivity &amp; Wellness Unlocked&quot;</h3>
<p className="text-base text-gray-300 font-semibold mb-4 italic leading-relaxed">&quot;Energy has been a game changer for my focus and productivity. I used to rely on coffee and painkillers to get through my workday, but now I feel clear-headed and energized from morning till night. My migraines are gone, and I&apos;m more present with my family. I recommend this to anyone who wants to break free from dependency and thrive naturally.&quot;</p>
<div className="mt-auto flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">T</span>
<span className="font-bold text-white">Tunde A., Abuja</span>
</div>
</motion.div>
<motion.div
className="flex-1 bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border-l-4 border-yellow-400 hover:shadow-yellow-400/30 transition-shadow duration-200"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeInUp}
>
<h3 className="font-bold text-2xl mb-4 text-yellow-400">&quot;Intimacy &amp; Vitality Restored&quot;</h3>
<p className="text-base text-gray-300 font-semibold mb-4 italic leading-relaxed">&quot;I was skeptical at first, but Energy Boxers have completely changed my life. My relationship with my partner is stronger, and I feel a renewed sense of vitality and confidence. The best part is that I no longer need to rely on medication for intimacy issues. This is real transformation&mdash;thank you, Coach Amara!&quot;</p>
<div className="mt-auto flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">A</span>
<span className="font-bold text-white">Ada E., Port Harcourt</span>
</div>
</motion.div>
</div>
<a
href="/join"
className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 max-w-xs md:max-w-none text-center"
>
Be Part of This Movement Today
</a>
</motion.section>

{/* SECTION 4: INTRODUCING COACH AMARA */}
<motion.section
className="w-full py-20 px-4 bg-gray-50 flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
{/* Left: Rectangular Image of Coach Amara */}
<div className="w-full h-full flex items-stretch">
<Image
src="/coach-amara.jpg"
alt="Coach Amara"
className="w-full h-full object-cover border-4 border-yellow-400"
style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '350px', maxHeight: '500px' }}
width={800}
height={500}
priority
/>
</div>
{/* Right: Content */}
<div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
<h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-black font-playfair text-center md:text-left drop-shadow">Meet Coach Amara</h2>
<div className="w-20 h-1 bg-yellow-400 mb-6 mx-auto md:mx-0"></div>
<p className="text-lg md:text-xl font-semibold mb-6 text-gray-700 text-center md:text-left leading-relaxed">
Behind this movement is <span className="text-black font-bold">Coach Amara</span> — a consistent coach who has personally achieved 10-figure success while guiding others to transform their lives.<br /><br />
She&apos;s an unapologetic Energy advocate, merging business mastery with healing advocacy to build independent, healthy, and empowered communities.
</p>
<div className="flex justify-center md:justify-start mt-4">
<a
href="/join"
className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 max-w-xs md:max-w-none text-center"
>
Join TheCoachAmara Community
</a>
</div>
</div>
</div>
</motion.section>

{/* SECTION 5: TESTIMONIALS */}
<motion.section
className="w-full py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white font-playfair text-center drop-shadow">Real People. Real Healing. Real Results.</h2>
<div className="w-20 h-1 bg-yellow-400 mb-10"></div>
<p className="text-lg md:text-xl font-semibold mb-10 max-w-2xl text-center text-gray-300">
Hear directly from real people whose lives have been transformed by Energy. These are their stories, in their own words—unfiltered, authentic, and inspiring.
</p>
<div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
{/* 6 YouTube video testimonial cards */}
<a href="https://www.youtube.com/watch?v=JxXILs3aLtk" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
	<YouTubePreview id="JxXILs3aLtk" title="Testimonial 1" className="w-full h-full" />
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">&quot;Energy gave me my life back.&quot;</div>
<div className="text-gray-300 text-sm">Janet shares how her chronic fatigue disappeared after joining the community.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=odLxfeAuSZQ" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
	<YouTubePreview id="odLxfeAuSZQ" title="Testimonial 2" className="w-full h-full" />
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">&quot;No more migraines, no more painkillers.&quot;</div>
<div className="text-gray-300 text-sm">Tunde explains how Energy tools ended years of headaches.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=oQdZ99ePHvY" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
	<YouTubePreview id="oQdZ99ePHvY" title="Testimonial 3" className="w-full h-full" />
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"My family is thriving."</div>
<div className="text-gray-300 text-sm">Ada describes the transformation in her home after using Energy Boxers.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=TMiIrmDqOYw " target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
	<YouTubePreview id="TMiIrmDqOYw" title="Testimonial 4" className="w-full h-full" />
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"I feel younger and stronger."</div>
<div className="text-gray-300 text-sm">Chidi talks about renewed vitality and energy after joining the movement.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=Q5XVS5oPtyk" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
	<YouTubePreview id="Q5XVS5oPtyk" title="Testimonial 5" className="w-full h-full" />
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"From skeptic to believer."</div>
<div className="text-gray-300 text-sm">Ngozi shares her journey from doubt to real results with Energy.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=MrvAmnpnO7w" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
	<YouTubePreview id="MrvAmnpnO7w" title="Testimonial 6" className="w-full h-full" />
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"Community, support, and healing."</div>
<div className="text-gray-300 text-sm">Bola describes the power of community and support in her healing journey.</div>
</div>
</a>
</div>
<a
href="/join"
className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 max-w-xs md:max-w-none text-center"
>
Start Your Own Energy Journey
</a>
</motion.section>

{/* SECTION 6: JOIN THE MOVEMENT */}
<motion.section
className="w-full py-20 px-4 bg-white flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<div className="w-full max-w-2xl mx-auto flex flex-col items-center">
<div className="flex flex-col items-center mb-6">
<div className="w-16 h-16 rounded-full bg-black border-2 border-yellow-400 flex items-center justify-center shadow-xl mb-4">
<svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5.13a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
</div>
<h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-black font-playfair text-center drop-shadow">Join the Community Today</h2>
<div className="w-20 h-1 bg-yellow-400 mb-4"></div>
<p className="text-lg md:text-xl font-semibold mb-2 text-center text-gray-700 max-w-xl">Be part of a vibrant, supportive community dedicated to healing, growth, and real transformation. Your journey starts here.</p>
</div>
					<div className="w-full bg-black rounded-2xl border-2 border-yellow-400 shadow-2xl p-8 flex flex-col items-center">
					<div className="w-full flex flex-col gap-4 font-bold">
					<input
						type="text"
						name="name"
						value={smallName}
						onChange={e => setSmallName(e.target.value)}
						placeholder="Your Name"
						className="px-4 py-3 rounded border-2 border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg"
					/>
					<button
						type="button"
						className="w-full px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200"
						onClick={e => { e.preventDefault(); const target = '/join' + (smallName ? `?name=${encodeURIComponent(smallName)}` : ''); router.push(target); }}
					>
						Yes, I'm Ready to Join
					</button>
					</div>
<ul className="list-none text-left text-lg font-bold mt-8 mb-0 text-gray-300 space-y-2">
<li className="flex items-center"><span className="mr-3 text-yellow-400">✨</span> Access to exclusive insights &amp; healing resources</li>
<li className="flex items-center"><span className="mr-3 text-yellow-400">🤝</span> Connection with like-minded individuals</li>
<li className="flex items-center"><span className="mr-3 text-yellow-400">⚡</span> A chance to explore Energy tools that work</li>
</ul>
</div>
</div>
</motion.section>

{/* FOOTER */}
<footer className="bg-black text-white pt-10 pb-6 mt-16 w-full">
	<div className="w-full px-6">
		<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-9xl mx-auto">
			<div>
				<div className="flex items-center gap-3 mb-3">
					<div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">C</div>
					<div>
						<div className="text-xl font-extrabold text-yellow-400">CoachAmara</div>
						<div className="text-sm text-gray-300">Quantum energy coaching & wellness</div>
					</div>
				</div>
				<p className="text-base text-gray-400">Join our community for tools, trainings and real transformation — delivered with care.</p>
				<div className="flex items-center gap-3 mt-4">
					<a href="https://www.youtube.com/" aria-label="YouTube" className="p-2 rounded bg-gray-900 hover:bg-gray-800">
						<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23 7s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-1C17.6 3 12 3 12 3s-5.6 0-8.2.1c-.4 0-1.3 0-2 .9C1.2 5.6 1 7 1 7S1 8.7 1 10.5v3C1 17.3 1.2 19 1.2 19s.2 1.4.8 2c.7.8 1.6.8 2 1 2.6.1 8.2.1 8.2.1s5.6 0 8.2-.1c.4 0 1.3 0 2-.9.6-.6.8-2 .8-2s.2-1.7.2-3.5v-3C23 8.7 23 7 23 7zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z"/></svg>
					</a>
					<a href="https://www.facebook.com/" aria-label="Facebook" className="p-2 rounded bg-gray-900 hover:bg-gray-800">
						<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 4.9 3.6 9 8.2 9.9v-7H7.9v-2.9h2.3V9.4c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .1 2 .1v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4v1.8h2.4l-.4 2.9h-2v7C18.4 21 22 16.9 22 12z"/></svg>
					</a>
					<a href="https://www.instagram.com/" aria-label="Instagram" className="p-2 rounded bg-gray-900 hover:bg-gray-800">
						<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.4-3.9a1.1 1.1 0 11-1.1 1.1 1.1 1.1 0 011.1-1.1z"/></svg>
					</a>
				</div>
			</div>

			<div className="md:col-span-2 flex flex-col sm:flex-row justify-between gap-6">
				<div>
					<h4 className="text-base font-bold text-gray-200 mb-2">Explore</h4>
					<ul className="space-y-2 text-base text-gray-400">
						<li><a href="/about" className="hover:text-yellow-400">About</a></li>
						<li><a href="/quantum" className="hover:text-yellow-400">Quantum Machine</a></li>
						<li><a href="/shop" className="hover:text-yellow-400">Shop</a></li>
						<li><a href="/join" className="hover:text-yellow-400">Join</a></li>
					</ul>
				</div>
				<div>
					<h4 className="text-base font-bold text-gray-200 mb-2">Support</h4>
					<ul className="space-y-2 text-base text-gray-400">
						<li><a href="/contact" className="hover:text-yellow-400">Contact Maralis</a></li>
						<li><a href="/privacy" className="hover:text-yellow-400">Privacy</a></li>
						<li><a href="/terms" className="hover:text-yellow-400">Terms</a></li>
					</ul>
				</div>
			</div>
		</div>

			<div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
			<div className="text-base text-gray-400">&copy; {new Date().getFullYear()} TheCoachAmara. All rights reserved.</div>
			<div className="flex gap-4 text-base text-gray-400">
				<a href="/contact" className="hover:text-yellow-400">Contact</a>
			</div>
		</div>
	</div>
</footer>
</main>
</>
);
}
