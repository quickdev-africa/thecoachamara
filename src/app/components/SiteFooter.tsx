export default function SiteFooter() {
  return (
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
                <li><a href="/shop" className="hover:text-yellow-400">Maralis Solutions</a></li>
                <li><a href="/join" className="hover:text-yellow-400">Join</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-200 mb-2">Support</h4>
              <ul className="space-y-2 text-base text-gray-400">
                <li><a href="/talktoamara" className="hover:text-yellow-400">Talk to Amara</a></li>
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
  );
}
